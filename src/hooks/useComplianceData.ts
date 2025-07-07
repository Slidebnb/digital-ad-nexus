import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface CookieConsent {
  id: string;
  user_id: string;
  consent_type: string;
  granted: boolean;
  timestamp: string;
  ip_address: any;
  user_agent: string;
}

interface GDPRRequest {
  id: string;
  user_id: string;
  request_type: string;
  status: string;
  requested_at: string;
  processed_at?: string;
  data_export_url?: string;
  admin_notes?: string;
}

interface TaxReport {
  id: string;
  user_id: string;
  report_year: number;
  report_type: string;
  total_trades: number;
  total_volume_eur: number;
  total_profit_eur: number;
  total_loss_eur: number;
  tax_liability_eur: number;
  generated_at: string;
  file_url?: string;
  status: string;
}

interface ComplianceStats {
  id: string;
  date: string;
  total_cookie_consents: number;
  essential_consents: number;
  functional_consents: number;
  analytics_consents: number;
  marketing_consents: number;
  gdpr_requests_pending: number;
  gdpr_requests_completed: number;
  tax_reports_generated: number;
  audit_events_count: number;
  compliance_score: number;
}

export function useComplianceData() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cookieConsents, setCookieConsents] = useState<CookieConsent[]>([]);
  const [gdprRequests, setGdprRequests] = useState<GDPRRequest[]>([]);
  const [taxReports, setTaxReports] = useState<TaxReport[]>([]);
  const [complianceStats, setComplianceStats] = useState<ComplianceStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Lade Cookie Consents
  const loadCookieConsents = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('cookie_consents')
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error loading cookie consents:', error);
      return;
    }

    setCookieConsents(data || []);
  };

  // Lade GDPR Requests
  const loadGdprRequests = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('gdpr_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('requested_at', { ascending: false });

    if (error) {
      console.error('Error loading GDPR requests:', error);
      return;
    }

    setGdprRequests(data || []);
  };

  // Lade Tax Reports
  const loadTaxReports = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('tax_reports')
      .select('*')
      .eq('user_id', user.id)
      .order('report_year', { ascending: false });

    if (error) {
      console.error('Error loading tax reports:', error);
      return;
    }

    setTaxReports(data || []);
  };

  // Lade Compliance Stats (nur für Admins)
  const loadComplianceStats = async () => {
    const { data, error } = await supabase
      .from('compliance_stats')
      .select('*')
      .eq('date', new Date().toISOString().split('T')[0])
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error loading compliance stats:', error);
      return;
    }

    if (data) {
      setComplianceStats(data);
    }
  };

  // Speichere Cookie Consent
  const saveCookieConsent = async (
    consentType: 'essential' | 'functional' | 'analytics' | 'marketing',
    granted: boolean
  ) => {
    if (!user) return false;

    try {
      // Hole IP-Adresse und User-Agent vom Browser
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const { ip } = await ipResponse.json();

      const { error } = await supabase
        .from('cookie_consents')
        .upsert({
          user_id: user.id,
          consent_type: consentType,
          granted,
          ip_address: ip,
          user_agent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }, {
          onConflict: 'user_id,consent_type'
        });

      if (error) throw error;

      // Aktualisiere lokalen State
      await loadCookieConsents();
      
      toast({
        title: "Cookie-Einstellungen gespeichert",
        description: `${consentType} wurde ${granted ? 'aktiviert' : 'deaktiviert'}.`,
      });

      return true;
    } catch (error) {
      console.error('Error saving cookie consent:', error);
      toast({
        title: "Fehler",
        description: "Cookie-Einstellungen konnten nicht gespeichert werden.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Erstelle GDPR Request
  const createGdprRequest = async (
    requestType: 'data_export' | 'data_deletion' | 'rectification' | 'portability'
  ) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('gdpr_requests')
        .insert({
          user_id: user.id,
          request_type: requestType,
          status: 'pending',
          requested_at: new Date().toISOString()
        });

      if (error) throw error;

      await loadGdprRequests();

      const typeNames = {
        data_export: 'Datenexport',
        data_deletion: 'Datenlöschung',
        rectification: 'Datenberichtigung',
        portability: 'Datenübertragung'
      };

      toast({
        title: "DSGVO-Anfrage erstellt",
        description: `Ihre ${typeNames[requestType]}-Anfrage wurde eingereicht.`,
      });

      return true;
    } catch (error) {
      console.error('Error creating GDPR request:', error);
      toast({
        title: "Fehler",
        description: "DSGVO-Anfrage konnte nicht erstellt werden.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Generiere Tax Report
  const generateTaxReport = async (year: number = new Date().getFullYear()) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('generate_tax_report', {
        p_user_id: user.id,
        p_year: year
      });

      if (error) throw error;

      await loadTaxReports();

      toast({
        title: "Steuer-Report erstellt",
        description: `Ihr Steuer-Report für ${year} wurde erfolgreich generiert.`,
      });

      return data; // Report ID
    } catch (error) {
      console.error('Error generating tax report:', error);
      toast({
        title: "Fehler",
        description: "Steuer-Report konnte nicht erstellt werden.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Lade alle Daten beim Start
  useEffect(() => {
    const loadAllData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      
      await Promise.all([
        loadCookieConsents(),
        loadGdprRequests(),
        loadTaxReports(),
        loadComplianceStats()
      ]);
      
      setLoading(false);
    };

    loadAllData();
  }, [user]);

  // Realtime Subscriptions
  useEffect(() => {
    if (!user) return;

    // Cookie Consents Realtime
    const cookieChannel = supabase
      .channel('cookie_consents_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cookie_consents',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          loadCookieConsents();
        }
      )
      .subscribe();

    // GDPR Requests Realtime
    const gdprChannel = supabase
      .channel('gdpr_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'gdpr_requests',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          loadGdprRequests();
        }
      )
      .subscribe();

    // Tax Reports Realtime
    const taxChannel = supabase
      .channel('tax_reports_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tax_reports',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          loadTaxReports();
        }
      )
      .subscribe();

    // Compliance Stats Realtime (für alle)
    const statsChannel = supabase
      .channel('compliance_stats_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'compliance_stats'
        },
        () => {
          loadComplianceStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(cookieChannel);
      supabase.removeChannel(gdprChannel);
      supabase.removeChannel(taxChannel);
      supabase.removeChannel(statsChannel);
    };
  }, [user]);

  return {
    // Data
    cookieConsents,
    gdprRequests,
    taxReports,
    complianceStats,
    loading,
    
    // Actions
    saveCookieConsent,
    createGdprRequest,
    generateTaxReport,
    
    // Reload functions
    loadCookieConsents,
    loadGdprRequests,
    loadTaxReports,
    loadComplianceStats
  };
}