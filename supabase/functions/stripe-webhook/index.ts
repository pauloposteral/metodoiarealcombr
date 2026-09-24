import Stripe from 'npm:stripe@18.5.0';
import { adminClient } from '../_shared/auth.ts';
import { billingPeriod, COURSE_PRICE_ID, stripeId, SUBSCRIPTION_PRICES } from '../_shared/billing.ts';
import { errorResponse, HttpError, json, requireEnv } from '../_shared/http.ts';

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') throw new HttpError(405, 'Method not allowed');
    const secret = requireEnv('STRIPE_WEBHOOK_SECRET');
    const signature = req.headers.get('stripe-signature');
    if (!signature) throw new HttpError(400, 'Missing signature');
    const stripe = new Stripe(requireEnv('STRIPE_SECRET_KEY'), { apiVersion: '2025-08-27.basil' });
    const rawBody = await req.text();
    if (rawBody.length > 1_048_576) throw new HttpError(413, 'Payload too large');
    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(rawBody, signature, secret, undefined, Stripe.createSubtleCryptoProvider());
    } catch { throw new HttpError(400, 'Invalid signature'); }
    const db = adminClient();

    async function syncSubscription(id: string, userHint?: string) {
      // Retrieve canonical Stripe state so retries and out-of-order deliveries do not restore stale access.
      const subscription = await stripe.subscriptions.retrieve(id);
      const priceId = subscription.items.data[0]?.price.id;
      const planSlug = SUBSCRIPTION_PRICES[priceId];
      if (!planSlug) return;
      let userId = subscription.metadata.supabase_user_id || userHint;
      if (!userId) {
        const { data: existing, error } = await db.from('subscriptions').select('user_id').eq('stripe_subscription_id', id).maybeSingle();
        if (error) throw error;
        userId = existing?.user_id;
      }
      if (!userId) throw new Error('Subscription has no verified user mapping');
      const { data: plan, error: planError } = await db.from('plans').select('id').eq('slug', planSlug).single();
      if (planError || !plan) throw planError || new Error('Plan missing');
      const period = billingPeriod(subscription);
      const { error } = await db.from('subscriptions').upsert({
        user_id: userId, plan_id: plan.id, stripe_subscription_id: subscription.id,
        stripe_customer_id: stripeId(subscription.customer), status: subscription.status,
        current_period_start: period.start, current_period_end: period.end,
        cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
        canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'stripe_subscription_id' });
      if (error) throw error;
    }

    if (['checkout.session.completed', 'checkout.session.async_payment_succeeded'].includes(event.type)) {
      const session = await stripe.checkout.sessions.retrieve((event.data.object as Stripe.Checkout.Session).id);
      const userId = session.metadata?.supabase_user_id;
      if (session.mode === 'subscription') {
        const id = stripeId(session.subscription);
        if (id) await syncSubscription(id, userId);
      } else if (session.mode === 'payment' && session.payment_status === 'paid') {
        const items = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });
        if (!items.data.some(item => item.price?.id === COURSE_PRICE_ID)) return json({ received: true });
        if (!userId) throw new Error('Course payment has no verified user mapping');
        const intentId = stripeId(session.payment_intent);
        if (!intentId) throw new Error('Payment intent missing');
        const intent = await stripe.paymentIntents.retrieve(intentId);
        const chargeId = stripeId(intent.latest_charge);
        const charge = chargeId ? await stripe.charges.retrieve(chargeId) : null;
        const { error } = await db.from('course_payments').upsert({
          stripe_checkout_session_id: session.id, stripe_payment_intent_id: intentId,
          stripe_charge_id: chargeId, user_id: userId,
          status: charge?.refunded ? 'refunded' : charge?.disputed ? 'disputed' : 'paid',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'stripe_checkout_session_id' });
        if (error) throw error;
      }
    } else if (event.type.startsWith('customer.subscription.')) {
      await syncSubscription((event.data.object as Stripe.Subscription).id);
    } else if (['invoice.paid', 'invoice.payment_failed'].includes(event.type)) {
      const invoice = event.data.object as Stripe.Invoice & { subscription?: string | { id: string } };
      const id = stripeId(invoice.parent?.subscription_details?.subscription ?? invoice.subscription);
      if (id) await syncSubscription(id);
    } else if (event.type === 'charge.refunded' || event.type.startsWith('charge.dispute.')) {
      const id = event.type === 'charge.refunded'
        ? (event.data.object as Stripe.Charge).id
        : stripeId((event.data.object as Stripe.Dispute).charge);
      if (id) {
        const charge = await stripe.charges.retrieve(id);
        let status = charge.refunded ? 'refunded' : 'paid';
        if (event.type.startsWith('charge.dispute.')) {
          const dispute = await stripe.disputes.retrieve((event.data.object as Stripe.Dispute).id);
          if (!['won', 'warning_closed'].includes(dispute.status)) status = 'disputed';
        } else if (charge.disputed) status = 'disputed';
        const { error } = await db.from('course_payments').update({ status, updated_at: new Date().toISOString() }).eq('stripe_charge_id', id);
        if (error) throw error;
      }
    }
    return json({ received: true });
  } catch (error) { return errorResponse(error); }
});
