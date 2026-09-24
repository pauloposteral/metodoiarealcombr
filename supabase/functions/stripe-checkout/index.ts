// Compatibility route. Auth, product validation and payment metadata live in the canonical handlers.
import { applicationOrigin, corsHeaders, errorResponse, HttpError, readJson, requireEnv } from '../_shared/http.ts';
import { requireUser } from '../_shared/auth.ts';
import { SUBSCRIPTION_PRICES } from '../_shared/billing.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    if (req.method !== 'POST') throw new HttpError(405, 'Método não permitido.');
    await requireUser(req);
    const body = await readJson(req);
    const prices = Object.entries(SUBSCRIPTION_PRICES);
    let endpoint: string;
    let payload = {};
    if (body.action === 'customer-portal') endpoint = 'customer-portal';
    else if (body.action === 'create-checkout' && ['pro', 'premium'].includes(String(body.planSlug)) && ['monthly', 'yearly'].includes(String(body.billingPeriod))) {
      endpoint = 'create-checkout';
      const priceId = prices.filter(([, plan]) => plan === body.planSlug)[body.billingPeriod === 'yearly' ? 1 : 0]?.[0];
      payload = { priceId, mode: 'subscription' };
    } else throw new HttpError(400, 'Ação ou plano inválido.');
    const response = await fetch(`${requireEnv('SUPABASE_URL')}/functions/v1/${endpoint}`, {
      method: 'POST', headers: { Authorization: req.headers.get('authorization')!, apikey: requireEnv('SUPABASE_ANON_KEY'), 'Content-Type': 'application/json', Origin: applicationOrigin() },
      body: JSON.stringify(payload), signal: AbortSignal.timeout(20_000),
    });
    return new Response(await response.text(), { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) { return errorResponse(error); }
});
