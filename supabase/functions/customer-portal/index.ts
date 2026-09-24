import Stripe from 'npm:stripe@18.5.0';
import { requireUser } from '../_shared/auth.ts';
import { applicationOrigin, corsHeaders, errorResponse, HttpError, json, requireEnv } from '../_shared/http.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    if (req.method !== 'POST') throw new HttpError(405, 'Método não permitido.');
    const { user, client } = await requireUser(req);
    const stripe = new Stripe(requireEnv('STRIPE_SECRET_KEY'), { apiVersion: '2025-08-27.basil' });
    const { data: subscriptions, error } = await client.from('subscriptions').select('stripe_customer_id').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1);
    if (error) throw error;
    let customerId = subscriptions?.[0]?.stripe_customer_id;
    if (!customerId) {
      const customers = await stripe.customers.list({ email: user.email, limit: 100 });
      customerId = (customers.data.find(c => c.metadata.supabase_user_id === user.id) ?? customers.data.find(c => !c.metadata.supabase_user_id))?.id;
    }
    if (!customerId) throw new HttpError(404, 'Cadastro de pagamento não encontrado.');
    const session = await stripe.billingPortal.sessions.create({ customer: customerId, return_url: `${applicationOrigin()}/membros` });
    return json({ url: session.url });
  } catch (error) { return errorResponse(error); }
});
