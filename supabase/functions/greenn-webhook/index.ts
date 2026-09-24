import { adminClient } from '../_shared/auth.ts';
import { normalizeGreenn, validWebhookToken } from '../_shared/greenn.ts';
import { errorResponse, HttpError, json, readJson, requireEnv } from '../_shared/http.ts';

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') throw new HttpError(405, 'Method not allowed');
    const secret = requireEnv('GREENN_WEBHOOK_SECRET');
    const supplied = req.headers.get('x-webhook-token') || new URL(req.url).searchParams.get('token');
    if (!(await validWebhookToken(supplied, secret))) throw new HttpError(401, 'Invalid webhook token');
    const allowedProducts = requireEnv('GREENN_PRODUCT_IDS').split(',').map(s => s.trim());
    const payload = await readJson(req);
    const purchase = normalizeGreenn(payload);
    if (!purchase) throw new HttpError(400, 'Invalid sale payload');
    if (!allowedProducts.includes(String(purchase.productId))) throw new HttpError(403, 'Product not configured');
    const db = adminClient();
    let userId: string | null = null;
    // listUsers defaults to one page: search every page instead of creating duplicate buyers.
    for (let page = 1; ; page++) {
      const { data, error } = await db.auth.admin.listUsers({ page, perPage: 500 });
      if (error) throw error;
      userId = data.users.find(user => user.email?.toLowerCase() === purchase.email)?.id || null;
      if (userId || data.users.length < 500) break;
    }
    if (!userId && purchase.status === 'paid') {
      const { data, error } = await db.auth.admin.createUser({
        email: purchase.email, password: crypto.randomUUID() + crypto.randomUUID(), email_confirm: true,
        user_metadata: { full_name: purchase.name },
      });
      if (error || !data.user) throw error || new Error('User creation failed');
      userId = data.user.id;
      // Credentials are never logged. The buyer sets a password through /auth recovery.
    }
    const { error } = await db.rpc('apply_greenn_purchase', {
      purchase_data: { ...purchase, userId, payload },
    });
    if (error) throw error;
    return json({ success: true });
  } catch (error) { return errorResponse(error); }
});
