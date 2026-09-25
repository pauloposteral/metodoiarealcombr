BEGIN;
ALTER TABLE public.purchases ADD COLUMN provider_updated_at timestamptz;
CREATE FUNCTION public.apply_greenn_purchase(purchase_data jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE buyer uuid := (purchase_data->>'userId')::uuid;
  sale_id integer := (purchase_data->>'saleId')::integer;
  sale_status text := purchase_data->>'status';
  event_time timestamptz := (purchase_data->>'occurredAt')::timestamptz;
  previous public.purchases;
BEGIN
  PERFORM pg_advisory_xact_lock(sale_id);
  SELECT * INTO previous FROM public.purchases WHERE greenn_sale_id = sale_id FOR UPDATE;
  buyer := coalesce(buyer, previous.user_id);
  IF previous.provider_updated_at IS NOT NULL AND (event_time IS NULL OR event_time < previous.provider_updated_at) THEN RETURN; END IF;
  -- Refunds must not be reversed by a duplicate paid notification without a newer provider timestamp.
  IF previous.status IN ('refunded', 'chargedback') AND sale_status = 'paid'
    AND (event_time IS NULL OR previous.provider_updated_at IS NULL OR event_time <= previous.provider_updated_at) THEN RETURN; END IF;
  INSERT INTO public.purchases(greenn_sale_id, greenn_client_id, user_id, product_name, product_id,
    amount, status, payment_method, client_email, client_name, client_phone, client_document, raw_payload, provider_updated_at)
  VALUES (sale_id, (purchase_data->>'clientId')::integer, buyer, purchase_data->>'productName',
    (purchase_data->>'productId')::integer, (purchase_data->>'amount')::numeric, sale_status,
    purchase_data->>'paymentMethod', purchase_data->>'email', purchase_data->>'name',
    purchase_data->>'phone', purchase_data->>'document', purchase_data->'payload', event_time)
  ON CONFLICT(greenn_sale_id) DO UPDATE SET status = EXCLUDED.status,
    user_id = coalesce(EXCLUDED.user_id, public.purchases.user_id),
    raw_payload = EXCLUDED.raw_payload, provider_updated_at = coalesce(EXCLUDED.provider_updated_at, public.purchases.provider_updated_at), updated_at = now();
  -- An independent valid purchase keeps its entitlement after a different sale is refunded.
  IF buyer IS NOT NULL AND sale_status = 'paid' THEN
    UPDATE public.profiles SET access_status = 'active', updated_at = now() WHERE id = buyer AND access_status <> 'revoked';
  ELSIF buyer IS NOT NULL AND sale_status IN ('refunded', 'chargedback') THEN
    IF NOT EXISTS (SELECT 1 FROM public.purchases p WHERE p.user_id = buyer AND p.status = 'paid') THEN
      UPDATE public.profiles SET access_status = 'pending', updated_at = now() WHERE id = buyer AND access_status <> 'revoked';
    END IF;
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.apply_greenn_purchase(jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_greenn_purchase(jsonb) TO service_role;
COMMIT;