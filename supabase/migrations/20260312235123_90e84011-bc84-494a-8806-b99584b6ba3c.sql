
-- Update plans table with real Stripe price IDs
UPDATE public.plans SET 
  stripe_price_id_monthly = 'price_1T8qngK7VFRW1YcZdgbfLP0b',
  stripe_price_id_yearly = 'price_1T8qr8K7VFRW1YcZwksylyOi'
WHERE slug = 'pro';

UPDATE public.plans SET 
  stripe_price_id_monthly = 'price_1T8qsLK7VFRW1YcZcr24abYp',
  stripe_price_id_yearly = 'price_1T8quAK7VFRW1YcZrhxEjAoR'
WHERE slug = 'premium';

-- Ensure plans exist (insert if missing)
INSERT INTO public.plans (name, slug, price_monthly, price_yearly, stripe_price_id_monthly, stripe_price_id_yearly, features, is_active, description)
VALUES 
  ('Gratuito', 'free', 0, 0, null, null, '{"modules": 2, "ai_sandbox": 0, "quizzes": false, "certificate": false, "community": "read_only"}'::jsonb, true, 'Acesso básico com 2 módulos gratuitos'),
  ('Pro', 'pro', 4990, 39900, 'price_1T8qngK7VFRW1YcZdgbfLP0b', 'price_1T8qr8K7VFRW1YcZwksylyOi', '{"modules": "all", "ai_sandbox": 50, "quizzes": true, "certificate": true, "community": "full"}'::jsonb, true, 'Todos os módulos, AI Sandbox, certificado'),
  ('Premium', 'premium', 9990, 79900, 'price_1T8qsLK7VFRW1YcZcr24abYp', 'price_1T8quAK7VFRW1YcZrhxEjAoR', '{"modules": "all", "ai_sandbox": "unlimited", "quizzes": true, "certificate": true, "community": "full", "mentoring": true, "early_access": true}'::jsonb, true, 'Tudo do Pro + AI Sandbox ilimitado, mentoria')
ON CONFLICT (slug) DO UPDATE SET
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  stripe_price_id_monthly = EXCLUDED.stripe_price_id_monthly,
  stripe_price_id_yearly = EXCLUDED.stripe_price_id_yearly,
  features = EXCLUDED.features,
  is_active = EXCLUDED.is_active,
  description = EXCLUDED.description;
