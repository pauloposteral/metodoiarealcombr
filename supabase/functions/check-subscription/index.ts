import Stripe from 'npm:stripe@18.5.0';
import { requireUser } from '../_shared/auth.ts';
import { billingPeriod, SUBSCRIPTION_PRICES } from '../_shared/billing.ts';
import { corsHeaders, errorResponse, HttpError, json, requireEnv } from '../_shared/http.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    if (req.method !== 'POST') throw new HttpError(405, 'Método não permitido.');
    const { user, client } = await requireUser(req);
    const stripe = new Stripe(requireEnv('STRIPE_SECRET_KEY'), { apiVersion: '2025-08-27.basil' });
    const { data: mappings, error } = await client.from('subscriptions').select('stripe_customer_id').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1);
    if (error) throw error;
    let customerId = mappings?.[0]?.stripe_customer_id;
    if (!customerId) {
      const customers = await stripe.customers.list({ email: user.email, limit: 100 });
      customerId = (customers.data.find(c => c.metadata.supabase_user_id === user.id) ?? customers.data.find(c => !c.metadata.supabase_user_id))?.id;
    }
    if (!customerId) return json({ subscribed: false, plan: 'free', subscription_end: null });
    const subscriptions = await stripe.subscriptions.list({ customer: customerId, status: 'all', limit: 100 });
    const candidates = subscriptions.data.filter(s => ['active', 'trialing'].includes(s.status)
      && Object.hasOwn(SUBSCRIPTION_PRICES, s.items.data[0]?.price.id || ''));
    candidates.sort((a, b) => Number(SUBSCRIPTION_PRICES[b.items.data[0].price.id] === 'premium') - Number(SUBSCRIPTION_PRICES[a.items.data[0].price.id] === 'premium'));
    const sub = candidates[0];
    if (!sub) return json({ subscribed: false, plan: 'free', subscription_end: null });
    return json({ subscribed: true, plan: SUBSCRIPTION_PRICES[sub.items.data[0].price.id], subscription_end: billingPeriod(sub).end });
  } catch (error) { return errorResponse(error); }
});
