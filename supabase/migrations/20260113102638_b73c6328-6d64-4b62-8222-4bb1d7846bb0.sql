-- =============================================
-- MÉTODO IA SaaS - B2B Database Structure
-- =============================================

-- Enum for company plan types
CREATE TYPE public.company_plan AS ENUM ('starter', 'pro', 'business');

-- Enum for company user roles
CREATE TYPE public.company_role AS ENUM ('admin', 'user');

-- Enum for company status
CREATE TYPE public.company_status AS ENUM ('pending', 'active', 'suspended');

-- Enum for prompt categories
CREATE TYPE public.prompt_category AS ENUM ('marketing', 'conteudo', 'atendimento', 'gestao', 'vendas');

-- =============================================
-- COMPANIES TABLE (Core B2B entity)
-- =============================================
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  plan company_plan NOT NULL DEFAULT 'starter',
  status company_status NOT NULL DEFAULT 'pending',
  max_users INTEGER NOT NULL DEFAULT 3,
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =============================================
-- COMPANY USERS TABLE (Users linked to companies)
-- =============================================
CREATE TABLE public.company_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role company_role NOT NULL DEFAULT 'user',
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(company_id, user_id)
);

-- =============================================
-- PROMPTS LIBRARY TABLE
-- =============================================
CREATE TABLE public.prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  category prompt_category NOT NULL,
  subcategory TEXT,
  variables JSONB DEFAULT '[]'::jsonb,
  is_premium BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =============================================
-- USER SAVED PROMPTS (Favorites/Custom versions)
-- =============================================
CREATE TABLE public.user_saved_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE,
  custom_title TEXT,
  custom_content TEXT,
  variables_values JSONB DEFAULT '{}'::jsonb,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =============================================
-- COMPANY LEADS TABLE (for lead + approval flow)
-- =============================================
CREATE TABLE public.company_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  employees_count TEXT,
  industry TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending',
  converted_company_id UUID REFERENCES public.companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =============================================
-- ENABLE RLS
-- =============================================
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_saved_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_leads ENABLE ROW LEVEL SECURITY;

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Check if user belongs to a company
CREATE OR REPLACE FUNCTION public.get_user_company_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM public.company_users WHERE user_id = _user_id LIMIT 1
$$;

-- Check if user is company admin
CREATE OR REPLACE FUNCTION public.is_company_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.company_users 
    WHERE user_id = _user_id AND role = 'admin'
  )
$$;

-- Check if user has active company access
CREATE OR REPLACE FUNCTION public.has_active_company(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.company_users cu
    JOIN public.companies c ON c.id = cu.company_id
    WHERE cu.user_id = _user_id AND c.status = 'active'
  )
$$;

-- =============================================
-- RLS POLICIES - COMPANIES
-- =============================================
CREATE POLICY "Users can view their own company"
ON public.companies FOR SELECT
USING (
  id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can update their company"
ON public.companies FOR UPDATE
USING (
  admin_user_id = auth.uid() OR 
  id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid() AND role = 'admin')
);

-- =============================================
-- RLS POLICIES - COMPANY USERS
-- =============================================
CREATE POLICY "Company members can view their team"
ON public.company_users FOR SELECT
USING (
  company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid())
);

CREATE POLICY "Company admins can manage team members"
ON public.company_users FOR INSERT
WITH CHECK (
  company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Company admins can update team members"
ON public.company_users FOR UPDATE
USING (
  company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Company admins can remove team members"
ON public.company_users FOR DELETE
USING (
  company_id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid() AND role = 'admin')
);

-- =============================================
-- RLS POLICIES - PROMPTS
-- =============================================
CREATE POLICY "Active company users can view prompts"
ON public.prompts FOR SELECT
USING (
  has_active_company(auth.uid()) AND (
    is_premium = false OR 
    EXISTS (
      SELECT 1 FROM public.company_users cu
      JOIN public.companies c ON c.id = cu.company_id
      WHERE cu.user_id = auth.uid() AND c.plan IN ('pro', 'business')
    )
  )
);

-- =============================================
-- RLS POLICIES - USER SAVED PROMPTS
-- =============================================
CREATE POLICY "Users can view their saved prompts"
ON public.user_saved_prompts FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create saved prompts"
ON public.user_saved_prompts FOR INSERT
WITH CHECK (user_id = auth.uid() AND has_active_company(auth.uid()));

CREATE POLICY "Users can update their saved prompts"
ON public.user_saved_prompts FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their saved prompts"
ON public.user_saved_prompts FOR DELETE
USING (user_id = auth.uid());

-- =============================================
-- RLS POLICIES - COMPANY LEADS
-- =============================================
CREATE POLICY "Anyone can submit a lead"
ON public.company_leads FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view leads"
ON public.company_leads FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update leads"
ON public.company_leads FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================
CREATE TRIGGER update_companies_updated_at
BEFORE UPDATE ON public.companies
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prompts_updated_at
BEFORE UPDATE ON public.prompts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_saved_prompts_updated_at
BEFORE UPDATE ON public.user_saved_prompts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_company_leads_updated_at
BEFORE UPDATE ON public.company_leads
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- SEED INITIAL PROMPTS
-- =============================================
INSERT INTO public.prompts (title, description, content, category, subcategory, variables, is_premium, order_index) VALUES
-- Marketing
('Legenda para Instagram', 'Crie legendas envolventes para posts', 'Crie uma legenda para Instagram sobre {{tema}} para uma empresa de {{segmento}}. Tom: {{tom}}. Inclua call-to-action e hashtags relevantes.', 'marketing', 'redes-sociais', '[{"name": "tema", "label": "Tema do post"}, {"name": "segmento", "label": "Segmento da empresa"}, {"name": "tom", "label": "Tom de voz", "default": "profissional e amigável"}]', false, 1),
('Anúncio Facebook Ads', 'Crie copies persuasivas para anúncios', 'Escreva um anúncio para Facebook Ads sobre {{produto}}. Público: {{publico}}. Objetivo: {{objetivo}}. Limite: 125 caracteres no texto principal.', 'marketing', 'anuncios', '[{"name": "produto", "label": "Produto/Serviço"}, {"name": "publico", "label": "Público-alvo"}, {"name": "objetivo", "label": "Objetivo do anúncio"}]', false, 2),
('Email Marketing', 'Crie emails que convertem', 'Escreva um email marketing para {{objetivo}} direcionado a {{publico}}. Empresa: {{empresa}}. Inclua assunto, preview e corpo do email.', 'marketing', 'email', '[{"name": "objetivo", "label": "Objetivo do email"}, {"name": "publico", "label": "Público-alvo"}, {"name": "empresa", "label": "Nome da empresa"}]', false, 3),

-- Conteúdo
('Roteiro de Carrossel', 'Crie carrosséis educativos', 'Crie um roteiro de carrossel Instagram com 7 slides sobre {{tema}}. Slide 1: gancho forte. Slides 2-6: conteúdo. Slide 7: CTA.', 'conteudo', 'carrossel', '[{"name": "tema", "label": "Tema do carrossel"}]', false, 1),
('Script para Reels', 'Roteiros virais para Reels', 'Crie um script de Reels de 30 segundos sobre {{tema}}. Estrutura: Hook (3s) + Conteúdo (20s) + CTA (7s). Tom: {{tom}}.', 'conteudo', 'video', '[{"name": "tema", "label": "Tema do vídeo"}, {"name": "tom", "label": "Tom", "default": "dinâmico e educativo"}]', false, 2),
('Artigo de Blog', 'Posts otimizados para SEO', 'Escreva um artigo de blog sobre {{tema}} com 800 palavras. Inclua: título SEO, meta description, H2s, bullet points e conclusão com CTA.', 'conteudo', 'blog', '[{"name": "tema", "label": "Tema do artigo"}]', true, 3),

-- Atendimento
('Resposta a Reclamação', 'Respostas empáticas para clientes', 'Crie uma resposta profissional para um cliente reclamando sobre {{problema}}. Tom: empático mas resolutivo. Empresa: {{empresa}}.', 'atendimento', 'reclamacoes', '[{"name": "problema", "label": "Problema relatado"}, {"name": "empresa", "label": "Nome da empresa"}]', false, 1),
('FAQ Automatizado', 'Respostas para perguntas frequentes', 'Crie respostas para as 10 perguntas mais frequentes sobre {{produto}} de {{empresa}}. Formato: pergunta + resposta curta.', 'atendimento', 'faq', '[{"name": "produto", "label": "Produto/Serviço"}, {"name": "empresa", "label": "Nome da empresa"}]', false, 2),
('Script de Vendas WhatsApp', 'Abordagem comercial eficiente', 'Crie um script de vendas por WhatsApp para {{produto}}. Inclua: saudação, qualificação, apresentação, objeções e fechamento.', 'atendimento', 'vendas', '[{"name": "produto", "label": "Produto/Serviço a vender"}]', true, 3),

-- Gestão
('Briefing de Projeto', 'Documentação clara de projetos', 'Crie um briefing para o projeto {{projeto}}. Inclua: objetivo, escopo, entregas, prazos, responsáveis e métricas de sucesso.', 'gestao', 'projetos', '[{"name": "projeto", "label": "Nome do projeto"}]', false, 1),
('Análise SWOT', 'Análise estratégica do negócio', 'Faça uma análise SWOT para {{empresa}} do setor de {{setor}}. Liste 3-5 itens para cada quadrante com justificativas.', 'gestao', 'estrategia', '[{"name": "empresa", "label": "Nome da empresa"}, {"name": "setor", "label": "Setor de atuação"}]', true, 2),
('OKRs Trimestrais', 'Defina objetivos e resultados-chave', 'Crie 3 OKRs para {{area}} focados em {{objetivo}}. Cada OKR deve ter 1 objetivo e 3 key results mensuráveis.', 'gestao', 'metas', '[{"name": "area", "label": "Área/Departamento"}, {"name": "objetivo", "label": "Objetivo principal"}]', true, 3),

-- Vendas
('Proposta Comercial', 'Propostas persuasivas', 'Crie uma proposta comercial para {{servico}} direcionada a {{empresa_cliente}}. Inclua: contexto, solução, benefícios, investimento e próximos passos.', 'vendas', 'propostas', '[{"name": "servico", "label": "Serviço oferecido"}, {"name": "empresa_cliente", "label": "Empresa do cliente"}]', false, 1),
('Email de Follow-up', 'Acompanhamento de leads', 'Escreva 3 variações de email de follow-up para lead que {{situacao}}. Tom: profissional sem ser invasivo.', 'vendas', 'follow-up', '[{"name": "situacao", "label": "Situação do lead (ex: não respondeu, pediu tempo)"}]', false, 2),
('Script de Cold Call', 'Ligações de prospecção', 'Crie um script de cold call para vender {{produto}} para {{perfil}}. Duração: 2 minutos. Inclua contorno de objeções.', 'vendas', 'prospeccao', '[{"name": "produto", "label": "Produto/Serviço"}, {"name": "perfil", "label": "Perfil do prospect"}]', true, 3);