
-- ============ document_analysis ============
CREATE TABLE public.document_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  file_name text NOT NULL,
  file_size bigint NOT NULL,
  mime_type text,
  sha256_hash text,
  md5_hash text,
  trust_score integer,
  risk_score integer,
  ai_summary text,
  forensic_report jsonb,
  metadata jsonb,
  signature_verified boolean NOT NULL DEFAULT false,
  ocr_used boolean NOT NULL DEFAULT false,
  watermark_detected boolean NOT NULL DEFAULT false,
  tampering_detected boolean NOT NULL DEFAULT false,
  processing_time_ms integer,
  credits_consumed integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'completed',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX document_analysis_org_idx ON public.document_analysis(org_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.document_analysis TO authenticated;
GRANT ALL ON public.document_analysis TO service_role;
ALTER TABLE public.document_analysis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "doc_analysis: org read" ON public.document_analysis
  FOR SELECT TO authenticated USING (public.is_org_member(auth.uid(), org_id));
CREATE POLICY "doc_analysis: member insert" ON public.document_analysis
  FOR INSERT TO authenticated WITH CHECK (public.is_org_member(auth.uid(), org_id) AND user_id = auth.uid());
CREATE POLICY "doc_analysis: admin delete" ON public.document_analysis
  FOR DELETE TO authenticated USING (public.has_any_org_role(auth.uid(), org_id, ARRAY['owner'::app_role,'admin'::app_role]));

-- ============ analysis_findings ============
CREATE TABLE public.analysis_findings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.document_analysis(id) ON DELETE CASCADE,
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  category text,
  severity text,
  title text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX analysis_findings_doc_idx ON public.analysis_findings(document_id);
GRANT SELECT, INSERT, DELETE ON public.analysis_findings TO authenticated;
GRANT ALL ON public.analysis_findings TO service_role;
ALTER TABLE public.analysis_findings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "findings: org read" ON public.analysis_findings
  FOR SELECT TO authenticated USING (public.is_org_member(auth.uid(), org_id));
CREATE POLICY "findings: member insert" ON public.analysis_findings
  FOR INSERT TO authenticated WITH CHECK (public.is_org_member(auth.uid(), org_id));

-- ============ usage_tracking ============
CREATE TABLE public.usage_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  documents_analyzed integer NOT NULL DEFAULT 0,
  credits_used integer NOT NULL DEFAULT 0,
  credits_remaining integer NOT NULL DEFAULT 0,
  monthly_limit integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(org_id, period_start)
);
GRANT SELECT ON public.usage_tracking TO authenticated;
GRANT ALL ON public.usage_tracking TO service_role;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "usage_tracking: org read" ON public.usage_tracking
  FOR SELECT TO authenticated USING (public.is_org_member(auth.uid(), org_id));
CREATE TRIGGER usage_tracking_touch BEFORE UPDATE ON public.usage_tracking
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ persist_analysis RPC ============
CREATE OR REPLACE FUNCTION public.persist_analysis(p_payload jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_org uuid := (p_payload->>'org_id')::uuid;
  v_period date := date_trunc('month', now())::date;
  v_limit int;
  v_remaining int;
  v_doc_id uuid;
  v_finding jsonb;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'NOT_AUTHENTICATED'; END IF;
  IF NOT public.is_org_member(v_user, v_org) THEN RAISE EXCEPTION 'FORBIDDEN'; END IF;

  SELECT p.monthly_analyses INTO v_limit
    FROM public.subscriptions s JOIN public.plans p ON p.id = s.plan_id
   WHERE s.org_id = v_org;
  v_limit := COALESCE(v_limit, 0);

  INSERT INTO public.usage_tracking(org_id, period_start, monthly_limit, credits_remaining)
    VALUES (v_org, v_period, v_limit, v_limit)
    ON CONFLICT (org_id, period_start) DO UPDATE
      SET monthly_limit = EXCLUDED.monthly_limit
    RETURNING credits_remaining INTO v_remaining;

  IF v_remaining <= 0 THEN
    RAISE EXCEPTION 'NO_CREDITS';
  END IF;

  INSERT INTO public.document_analysis(
    org_id,user_id,file_name,file_size,mime_type,sha256_hash,md5_hash,
    trust_score,risk_score,ai_summary,forensic_report,metadata,
    signature_verified,ocr_used,watermark_detected,tampering_detected,
    processing_time_ms,credits_consumed,status
  ) VALUES (
    v_org, v_user,
    p_payload->>'file_name',
    (p_payload->>'file_size')::bigint,
    p_payload->>'mime_type',
    p_payload->>'sha256_hash',
    p_payload->>'md5_hash',
    NULLIF(p_payload->>'trust_score','')::int,
    NULLIF(p_payload->>'risk_score','')::int,
    p_payload->>'ai_summary',
    p_payload->'forensic_report',
    p_payload->'metadata',
    COALESCE((p_payload->>'signature_verified')::boolean, false),
    COALESCE((p_payload->>'ocr_used')::boolean, false),
    COALESCE((p_payload->>'watermark_detected')::boolean, false),
    COALESCE((p_payload->>'tampering_detected')::boolean, false),
    NULLIF(p_payload->>'processing_time_ms','')::int,
    1, 'completed'
  ) RETURNING id INTO v_doc_id;

  FOR v_finding IN SELECT * FROM jsonb_array_elements(COALESCE(p_payload->'findings','[]'::jsonb))
  LOOP
    INSERT INTO public.analysis_findings(document_id, org_id, category, severity, title, description)
    VALUES (v_doc_id, v_org,
      v_finding->>'category', v_finding->>'severity',
      v_finding->>'title', v_finding->>'description');
  END LOOP;

  INSERT INTO public.reports(
    org_id, user_id, file_name, file_size, mime_type, sha256, md5,
    risk_score, risk_label, tampering_confidence, report
  ) VALUES (
    v_org, v_user,
    p_payload->>'file_name',
    (p_payload->>'file_size')::bigint,
    p_payload->>'mime_type',
    p_payload->>'sha256_hash',
    p_payload->>'md5_hash',
    NULLIF(p_payload->>'risk_score','')::int,
    p_payload->>'risk_label',
    NULLIF(p_payload->>'tampering_confidence','')::int,
    p_payload->'forensic_report'
  );

  UPDATE public.usage_tracking
     SET documents_analyzed = documents_analyzed + 1,
         credits_used = credits_used + 1,
         credits_remaining = credits_remaining - 1,
         updated_at = now()
   WHERE org_id = v_org AND period_start = v_period;

  RETURN v_doc_id;
END $$;

GRANT EXECUTE ON FUNCTION public.persist_analysis(jsonb) TO authenticated;

-- ============ get_usage_snapshot RPC ============
CREATE OR REPLACE FUNCTION public.get_usage_snapshot(_org uuid)
RETURNS TABLE(documents_analyzed int, credits_used int, credits_remaining int, monthly_limit int)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_limit int;
  v_period date := date_trunc('month', now())::date;
BEGIN
  IF NOT public.is_org_member(auth.uid(), _org) THEN
    RAISE EXCEPTION 'FORBIDDEN';
  END IF;

  SELECT p.monthly_analyses INTO v_limit
    FROM public.subscriptions s JOIN public.plans p ON p.id = s.plan_id
   WHERE s.org_id = _org;
  v_limit := COALESCE(v_limit, 0);

  RETURN QUERY
  SELECT
    COALESCE(u.documents_analyzed, 0),
    COALESCE(u.credits_used, 0),
    COALESCE(u.credits_remaining, v_limit),
    COALESCE(u.monthly_limit, v_limit)
  FROM (SELECT 1) x
  LEFT JOIN public.usage_tracking u
    ON u.org_id = _org AND u.period_start = v_period;
END $$;

GRANT EXECUTE ON FUNCTION public.get_usage_snapshot(uuid) TO authenticated;
