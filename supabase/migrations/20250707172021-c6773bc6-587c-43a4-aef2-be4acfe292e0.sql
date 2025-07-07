-- GDPR & Compliance Tables für echte Daten

-- Cookie Consents Tabelle
CREATE TABLE public.cookie_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL CHECK (consent_type IN ('essential', 'functional', 'analytics', 'marketing')),
  granted BOOLEAN NOT NULL DEFAULT false,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- GDPR Requests Tabelle
CREATE TABLE public.gdpr_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN ('data_export', 'data_deletion', 'rectification', 'portability')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  requested_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES auth.users(id),
  data_export_url TEXT,
  admin_notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tax Reports Tabelle
CREATE TABLE public.tax_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  report_year INTEGER NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('annual', 'quarterly', 'monthly')),
  total_trades INTEGER DEFAULT 0,
  total_volume_eur DECIMAL(15,2) DEFAULT 0,
  total_profit_eur DECIMAL(15,2) DEFAULT 0,
  total_loss_eur DECIMAL(15,2) DEFAULT 0,
  tax_liability_eur DECIMAL(15,2) DEFAULT 0,
  report_data JSONB DEFAULT '{}',
  generated_at TIMESTAMPTZ DEFAULT now(),
  file_url TEXT,
  status TEXT DEFAULT 'generated' CHECK (status IN ('generated', 'downloaded', 'submitted')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Compliance Documents Tabelle
CREATE TABLE public.compliance_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type TEXT NOT NULL CHECK (document_type IN ('privacy_policy', 'terms_of_service', 'imprint', 'cookie_policy', 'aml_policy')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  version TEXT NOT NULL,
  language TEXT DEFAULT 'de',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  effective_date DATE,
  last_updated TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Compliance Statistics Tabelle
CREATE TABLE public.compliance_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE DEFAULT CURRENT_DATE,
  total_cookie_consents INTEGER DEFAULT 0,
  essential_consents INTEGER DEFAULT 0,
  functional_consents INTEGER DEFAULT 0,
  analytics_consents INTEGER DEFAULT 0,
  marketing_consents INTEGER DEFAULT 0,
  gdpr_requests_pending INTEGER DEFAULT 0,
  gdpr_requests_completed INTEGER DEFAULT 0,
  tax_reports_generated INTEGER DEFAULT 0,
  audit_events_count INTEGER DEFAULT 0,
  compliance_score DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(date)
);

-- RLS Policies
ALTER TABLE public.cookie_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gdpr_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_stats ENABLE ROW LEVEL SECURITY;

-- Cookie Consents Policies
CREATE POLICY "Users can manage own cookie consents" ON public.cookie_consents
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all cookie consents" ON public.cookie_consents
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
  ));

-- GDPR Requests Policies
CREATE POLICY "Users can manage own GDPR requests" ON public.gdpr_requests
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all GDPR requests" ON public.gdpr_requests
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
  ));

-- Tax Reports Policies
CREATE POLICY "Users can view own tax reports" ON public.tax_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all tax reports" ON public.tax_reports
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
  ));

-- Compliance Documents Policies
CREATE POLICY "Everyone can view published documents" ON public.compliance_documents
  FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can manage all compliance documents" ON public.compliance_documents
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
  ));

-- Compliance Stats Policies
CREATE POLICY "Admins can view compliance stats" ON public.compliance_stats
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
  ));

-- Triggers für automatische Updates
CREATE OR REPLACE FUNCTION update_compliance_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.compliance_stats (
    date,
    total_cookie_consents,
    essential_consents,
    functional_consents,
    analytics_consents,
    marketing_consents,
    gdpr_requests_pending,
    gdpr_requests_completed
  ) VALUES (
    CURRENT_DATE,
    (SELECT COUNT(*) FROM public.cookie_consents WHERE DATE(created_at) = CURRENT_DATE),
    (SELECT COUNT(*) FROM public.cookie_consents WHERE consent_type = 'essential' AND granted = true AND DATE(created_at) = CURRENT_DATE),
    (SELECT COUNT(*) FROM public.cookie_consents WHERE consent_type = 'functional' AND granted = true AND DATE(created_at) = CURRENT_DATE),
    (SELECT COUNT(*) FROM public.cookie_consents WHERE consent_type = 'analytics' AND granted = true AND DATE(created_at) = CURRENT_DATE),
    (SELECT COUNT(*) FROM public.cookie_consents WHERE consent_type = 'marketing' AND granted = true AND DATE(created_at) = CURRENT_DATE),
    (SELECT COUNT(*) FROM public.gdpr_requests WHERE status = 'pending'),
    (SELECT COUNT(*) FROM public.gdpr_requests WHERE status = 'completed' AND DATE(processed_at) = CURRENT_DATE)
  )
  ON CONFLICT (date) DO UPDATE SET
    total_cookie_consents = EXCLUDED.total_cookie_consents,
    essential_consents = EXCLUDED.essential_consents,
    functional_consents = EXCLUDED.functional_consents,
    analytics_consents = EXCLUDED.analytics_consents,
    marketing_consents = EXCLUDED.marketing_consents,
    gdpr_requests_pending = EXCLUDED.gdpr_requests_pending,
    gdpr_requests_completed = EXCLUDED.gdpr_requests_completed,
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_compliance_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.cookie_consents
  FOR EACH STATEMENT EXECUTE FUNCTION update_compliance_stats();

CREATE TRIGGER update_compliance_stats_gdpr_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.gdpr_requests
  FOR EACH STATEMENT EXECUTE FUNCTION update_compliance_stats();

-- Automatische Steuer-Report Generation Funktion
CREATE OR REPLACE FUNCTION generate_tax_report(
  p_user_id UUID,
  p_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
)
RETURNS UUID AS $$
DECLARE
  report_id UUID;
  total_trades_count INTEGER;
  total_volume DECIMAL(15,2);
  total_profit DECIMAL(15,2);
  total_loss DECIMAL(15,2);
  tax_liability DECIMAL(15,2);
BEGIN
  -- Berechne Trading-Statistiken
  SELECT 
    COUNT(*),
    COALESCE(SUM(amount * price_eur), 0),
    COALESCE(SUM(CASE WHEN amount * price_eur > 0 THEN amount * price_eur ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN amount * price_eur < 0 THEN ABS(amount * price_eur) ELSE 0 END), 0)
  INTO total_trades_count, total_volume, total_profit, total_loss
  FROM public.trades
  WHERE (buyer_id = p_user_id OR seller_id = p_user_id)
    AND EXTRACT(YEAR FROM created_at) = p_year
    AND status = 'completed';

  -- Vereinfachte Steuerberechnung (26,375% auf Gewinne über 801€)
  tax_liability := CASE 
    WHEN (total_profit - total_loss) > 801 THEN 
      ((total_profit - total_loss) - 801) * 0.26375
    ELSE 0 
  END;

  -- Erstelle Report
  INSERT INTO public.tax_reports (
    user_id,
    report_year,
    report_type,
    total_trades,
    total_volume_eur,
    total_profit_eur,
    total_loss_eur,
    tax_liability_eur,
    report_data
  ) VALUES (
    p_user_id,
    p_year,
    'annual',
    total_trades_count,
    total_volume,
    total_profit,
    total_loss,
    tax_liability,
    jsonb_build_object(
      'generated_at', now(),
      'calculation_method', 'simplified_german_tax',
      'exemption_amount', 801,
      'tax_rate', 0.26375,
      'trades_details', (
        SELECT jsonb_agg(
          jsonb_build_object(
            'date', created_at,
            'amount', amount,
            'coin', currency,
            'price_eur', price_eur,
            'type', CASE WHEN buyer_id = p_user_id THEN 'buy' ELSE 'sell' END
          )
        )
        FROM public.trades
        WHERE (buyer_id = p_user_id OR seller_id = p_user_id)
          AND EXTRACT(YEAR FROM created_at) = p_year
          AND status = 'completed'
      )
    )
  ) RETURNING id INTO report_id;

  RETURN report_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Realtime für alle Tabellen aktivieren
ALTER TABLE public.cookie_consents REPLICA IDENTITY FULL;
ALTER TABLE public.gdpr_requests REPLICA IDENTITY FULL;
ALTER TABLE public.tax_reports REPLICA IDENTITY FULL;
ALTER TABLE public.compliance_documents REPLICA IDENTITY FULL;
ALTER TABLE public.compliance_stats REPLICA IDENTITY FULL;

-- Sample Data für Demo
INSERT INTO public.compliance_documents (document_type, title, content, version, status, effective_date) VALUES
('privacy_policy', 'Datenschutzerklärung', '# Datenschutzerklärung für KRYPTOANZEIGEN.DE...', '2.1', 'published', '2024-01-01'),
('terms_of_service', 'Allgemeine Geschäftsbedingungen', '# AGB für KRYPTOANZEIGEN.DE...', '1.8', 'published', '2024-01-01'),
('imprint', 'Impressum', '# Impressum KRYPTOANZEIGEN.DE...', '1.2', 'published', '2024-01-01');

-- Initial Compliance Stats
INSERT INTO public.compliance_stats (date, compliance_score) VALUES (CURRENT_DATE, 98.5);