export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function readJson(req: Request, maxBytes = 65_536): Promise<Record<string, unknown>> {
  const reader = req.body?.getReader();
  if (!reader) throw new HttpError(400, 'Corpo da requisição obrigatório.');
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new HttpError(413, 'Requisição muito grande.');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const buffer = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { buffer.set(chunk, offset); offset += chunk.length; }
  let value: unknown;
  try { value = JSON.parse(new TextDecoder().decode(buffer)); }
  catch { throw new HttpError(400, 'JSON inválido.'); }
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new HttpError(400, 'Objeto JSON obrigatório.');
  }
  return value as Record<string, unknown>;
}

export function errorResponse(error: unknown): Response {
  if (error instanceof HttpError) return json({ error: error.message }, error.status);
  console.error('Request failed:', error instanceof Error ? error.name : 'Unknown error');
  return json({ error: 'Não foi possível concluir. Tente novamente.' }, 500);
}

export function requireEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new HttpError(503, 'Serviço temporariamente indisponível.');
  return value;
}

export function applicationOrigin(): string {
  const origin = new URL(Deno.env.get('APP_ORIGIN') || 'https://metodoiareal.com.br');
  if (origin.protocol !== 'https:' || origin.username || origin.password) {
    throw new HttpError(503, 'Origem da aplicação inválida.');
  }
  return origin.origin;
}
