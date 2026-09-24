import Stripe from 'npm:stripe@18.5.0';
import { requireUser } from '../_shared/auth.ts';
import { checkoutProduct } from '../_shared/billing.ts';
import { applicationOrigin, corsHeaders, errorResponse, HttpError, json, readJson, requireEnv } from '../_shared/http.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    if (req.method !== 'POST') throw new HttpError(405, 'Método não permitido.');
    const { user } = await requireUser(req);
    const { priceId, mode = 'subscription' } = await readJson(req);
    const product = checkoutProduct(priceId, mode);
    if (!product) throw new HttpError(400, 'Produto ou modalidade inválida.');
    const stripe = new Stripe(requireEnv('STRIPE_SECRET_KEY'), { apiVersion: '2025-08-27.basil' });
    const customers = await stripe.customers.list({ email: user.email, limit: 100 });
    const customer = customers.data.find(c => c.metadata.supabase_user_id === user.id)
      ?? customers.data.find(c => !c.metadata.supabase_user_id)
      ?? await stripe.customers.create({ email: user.email, metadata: { supabase_user_id: user.id } }, { idempotencyKey: `customer:${user.id}` });
    if (mode === 'subscription') {
      const subscriptions = await stripe.subscriptions.list({ customer: customer.id, status: 'all', limit: 100 });
      if (subscriptions.data.some(s => ['active', 'trialing', 'past_due'].includes(s.status))) {
        throw new HttpError(409, 'Você já possui uma assinatura. Use Gerenciar assinatura para alterar seu plano.');
      }
    }
    const origin = applicationOrigin();
    const metadata = { supabase_user_id: user.id, purchase_kind: product.kind, ...(product.plan ? { plan_slug: product.plan } : {}) };
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      line_items: [{ price: priceId as string, quantity: 1 }],
      mode: mode as 'payment' | 'subscription',
      success_url: `${origin}/membros?checkout=success`,
      cancel_url: `${origin}/${mode === 'payment' ? 'checkout' : 'pricing'}?checkout=cancelled`,
      metadata,
      ...(mode === 'subscription' ? { subscription_data: { metadata } } : { payment_intent_data: { metadata } }),
    }, { idempotencyKey: `checkout:${user.id}:${priceId}:${Math.floor(Date.now() / 300000)}` });
    if (!session.url) throw new Error('Checkout URL missing');
    return json({ url: session.url });
  } catch (error) { return errorResponse(error); }
});
