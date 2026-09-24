// Local typechecking only. Production runtime is supplied by Supabase Edge Functions.
declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (request: Request) => Response | Promise<Response>): unknown;
  resolveDns(hostname: string, type: 'A' | 'AAAA'): Promise<string[]>;
};
declare module 'https://esm.sh/@supabase/supabase-js@2.89.0' { export { createClient } from '@supabase/supabase-js'; }
declare module 'https://esm.sh/@supabase/supabase-js@2' { export { createClient } from '@supabase/supabase-js'; }
declare module 'https://deno.land/std@0.168.0/http/server.ts' { export function serve(handler: (request: Request) => Response | Promise<Response>): unknown; }
declare module 'https://deno.land/x/xhr@0.1.0/mod.ts' {}
declare module 'npm:stripe@18.5.0' { export { default } from 'stripe'; }
