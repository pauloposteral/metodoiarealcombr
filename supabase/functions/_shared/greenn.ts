export async function validWebhookToken(received: string | null, expected: string | undefined): Promise<boolean> {
  if (!received || !expected || expected.length < 32) return false;
  const digest = async (value: string) => new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)));
  const [a, b] = await Promise.all([digest(received), digest(expected)]);
  let difference = 0;
  for (let i = 0; i < a.length; i++) difference |= a[i] ^ b[i];
  return difference === 0;
}

export function normalizeGreenn(payload: Record<string, unknown>) {
  const sale = payload.sale as Record<string, unknown> | undefined;
  const client = payload.client as Record<string, unknown> | undefined;
  const product = payload.product as Record<string, unknown> | undefined;
  if (!sale || !client || !product) return null;
  const status = payload.currentStatus || sale.currentStatus || sale.status;
  if (!['paid', 'refunded', 'chargedback', 'waiting_payment', 'refused', 'unpaid'].includes(String(status))) return null;
  if (!Number.isSafeInteger(sale.id) || Number(sale.id) <= 0 || !Number.isSafeInteger(product.id)) return null;
  if (typeof client.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.email)) return null;
  if (typeof client.name !== 'string' || !client.name.trim() || typeof product.name !== 'string') return null;
  if (typeof sale.amount !== 'number' || !Number.isFinite(sale.amount) || sale.amount < 0) return null;
  return {
    saleId: Number(sale.id), productId: Number(product.id), clientId: Number(client.id) || null,
    status: String(status), amount: sale.amount, email: client.email.trim().toLowerCase(),
    name: client.name.trim().slice(0, 200), productName: product.name.slice(0, 300),
    paymentMethod: String(sale.method || sale.paymentMethod || ''),
    phone: String(client.cellphone || `${client.phone_local_code || ''}${client.phone_number || ''}`).slice(0, 40),
    document: String(client.cpf_cnpj || client.doc || '').slice(0, 40),
    occurredAt: typeof sale.updated_at === 'string' && Number.isFinite(Date.parse(sale.updated_at)) ? new Date(sale.updated_at).toISOString() : null,
  };
}
