import { adminClient, requireUser } from './auth.ts';
import { corsHeaders, errorResponse, HttpError, readJson } from './http.ts';

export async function consumeQuota(key: string, limit: number, windowSeconds: number) {
  const { data, error } = await adminClient().rpc('consume_ai_quota', {
    quota_key: key, quota_limit: limit, window_seconds: windowSeconds,
  });
  if (error) throw new HttpError(503, 'Controle de uso indisponível. Tente novamente em instantes.');
  if (!data) throw new HttpError(429, 'Limite de uso atingido. Tente novamente mais tarde.');
}

// AI routes share an atomic abuse counter; changing the route cannot bypass it.
export async function guardAIRequest(req: Request, options: { sandbox?: boolean } = {}): Promise<Response | null> {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    if (req.method !== 'POST') throw new HttpError(405, 'Método não permitido.');
    const { user, client } = await requireUser(req);
    const { data: profile, error } = await client.from('profiles').select('access_status').eq('id', user.id).single();
    if (error || !profile || profile.access_status === 'revoked') throw new HttpError(403, 'Acesso indisponível.');
    const body = await readJson(req.clone());
    for (const key of ['prompt', 'topic', 'userPrompt', 'editInstruction', 'context']) {
      if (body[key] !== undefined && (typeof body[key] !== 'string' || (body[key] as string).length > 8_000)) {
        throw new HttpError(400, `Campo ${key} inválido.`);
      }
    }
    const config = body.config as { format?: { slideCount?: unknown } } | undefined;
    const count = body.slideCount ?? config?.format?.slideCount;
    if (count !== undefined && (!Number.isInteger(count) || Number(count) < 1 || Number(count) > 30)) {
      throw new HttpError(400, 'Quantidade de slides inválida (1 a 30).');
    }
    if (body.slides !== undefined && (!Array.isArray(body.slides) || body.slides.length > 30)) {
      throw new HttpError(400, 'Lista de slides inválida.');
    }
    if (options.sandbox) {
      const { data: limit, error: accessError } = await client.rpc('ai_sandbox_daily_limit');
      if (accessError) throw new HttpError(503, 'Não foi possível verificar seu plano.');
      if (typeof limit !== 'number' || limit === 0) throw new HttpError(403, 'O AI Sandbox requer acesso pago.');
      if (limit > 0) await consumeQuota(`user:${user.id}:sandbox:day`, limit, 86400);
    }
    await consumeQuota(`user:${user.id}:hour`, 60, 3600);
    await consumeQuota(`user:${user.id}:day`, 200, 86400);
    return null;
  } catch (error) { return errorResponse(error); }
}
