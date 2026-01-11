-- Adicionar coluna access_status na tabela profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS access_status TEXT DEFAULT 'active';

-- Criar tabela de compras para rastrear transações da Greenn
CREATE TABLE public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  greenn_sale_id INTEGER UNIQUE NOT NULL,
  greenn_client_id INTEGER,
  product_name TEXT NOT NULL,
  product_id INTEGER,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL,
  payment_method TEXT,
  client_email TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT,
  client_document TEXT,
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS na tabela purchases
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Política para admin ver todas as compras (via service role)
CREATE POLICY "Service role can manage purchases"
ON public.purchases
FOR ALL
USING (true)
WITH CHECK (true);

-- Índices para buscas rápidas
CREATE INDEX idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX idx_purchases_client_email ON public.purchases(client_email);
CREATE INDEX idx_purchases_greenn_sale_id ON public.purchases(greenn_sale_id);
CREATE INDEX idx_purchases_status ON public.purchases(status);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_purchases_updated_at
BEFORE UPDATE ON public.purchases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();