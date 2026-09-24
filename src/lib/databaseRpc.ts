import { supabase } from '@/integrations/supabase/client';

type RpcResult<T> = {
  data: T | null;
  error: unknown;
};

type RpcInvoker = (
  functionName: string,
  args?: Record<string, unknown>,
) => Promise<RpcResult<unknown>> & {
  single: () => Promise<RpcResult<unknown>>;
};

const invokeRpc = supabase.rpc.bind(supabase) as unknown as RpcInvoker;

export async function databaseRpc<T>(
  functionName: string,
  args?: Record<string, unknown>,
): Promise<RpcResult<T>> {
  return invokeRpc(functionName, args) as Promise<RpcResult<T>>;
}

export async function databaseRpcSingle<T>(
  functionName: string,
  args?: Record<string, unknown>,
): Promise<RpcResult<T>> {
  return invokeRpc(functionName, args).single() as Promise<RpcResult<T>>;
}

export type ProfileCard = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
};