import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface AdminComplianceStats {
  totalUsers: number;
  totalCookieConsents: number;
  essentialConsents: number;
  functionalConsents: number;
  analyticsConsents: number;
  marketingConsents: number;
  gdprRequestsPending: number;
  gdprRequestsCompleted: number;
  taxReportsGenerated: number;
  auditEventsCount: number;
  complianceScore: number;
}

interface GDPRRequestAdmin {
  id: string;
  user_id: string;
  user_email?: string;
  request_type: string;
  status: string;
  requested_at: string;
  processed_at?: string;
  admin_notes?: string;
}

interface ComplianceDocument {
  id: string;
  document_type: string;
  title: string;
  version: string;
  status: string;
  last_updated: string;
  created_by: string;
}

export function useAdminCompliance() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminComplianceStats>({
    totalUsers: 0,
    totalCookieConsents: 0,
    essentialConsents: 0,
    functionalConsents: 0,
    analyticsConsents: 0,
    marketingConsents: 0,
    gdprRequestsPending: 0,
    gdprRequestsCompleted: 0,
    taxReportsGenerated: 0,
    auditEventsCount: 0,
    complianceScore: 0
  });
  const [gdprRequests, setGdprRequests] = useState<GDPRRequestAdmin[]>([]);
  const [documents, setDocuments] = useState<ComplianceDocument[]>([]);
  const [loading, setLoading] = useState(true);

  // Lade Admin Compliance Stats
  const loadAdminStats = async () => {
    if (!isAdmin) return;

    try {
      // Lade aktuelle Compliance Stats
      const { data: complianceData } = await supabase
        .from('compliance_stats')
        .select('*')
        .eq('date', new Date().toISOString().split('T')[0])
        .single();

      // Lade User Count
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Lade Tax Reports Count
      const { count: taxReportsCount } = await supabase
        .from('tax_reports')
        .select('*', { count: 'exact', head: true })
        .gte('generated_at', new Date(new Date().getFullYear(), 0, 1).toISOString());

      // Lade Audit Events Count (aus admin_logs)
      const { count: auditCount } = await supabase
        .from('admin_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date().toISOString().split('T')[0]);

      setStats({
        totalUsers: userCount || 0,
        totalCookieConsents: complianceData?.total_cookie_consents || 0,
        essentialConsents: complianceData?.essential_consents || 0,
        functionalConsents: complianceData?.functional_consents || 0,
        analyticsConsents: complianceData?.analytics_consents || 0,
        marketingConsents: complianceData?.marketing_consents || 0,
        gdprRequestsPending: complianceData?.gdpr_requests_pending || 0,
        gdprRequestsCompleted: complianceData?.gdpr_requests_completed || 0,
        taxReportsGenerated: taxReportsCount || 0,
        auditEventsCount: auditCount || 0,
        complianceScore: complianceData?.compliance_score || 0
      });
    } catch (error) {
      console.error('Error loading admin stats:', error);
    }
  };

  // Lade alle GDPR Requests für Admin
  const loadAllGdprRequests = async () => {
    if (!isAdmin) return;

    try {
      const { data, error } = await supabase
        .from('gdpr_requests')
        .select('*')
        .order('requested_at', { ascending: false });

      if (error) throw error;

      setGdprRequests(data || []);
    } catch (error) {
      console.error('Error loading GDPR requests:', error);
    }
  };

  // Lade Compliance Documents
  const loadComplianceDocuments = async () => {
    if (!isAdmin) return;

    try {
      const { data, error } = await supabase
        .from('compliance_documents')
        .select('*')
        .order('last_updated', { ascending: false });

      if (error) throw error;

      setDocuments(data || []);
    } catch (error) {
      console.error('Error loading compliance documents:', error);
    }
  };

  // Verarbeite GDPR Request
  const processGdprRequest = async (
    requestId: string,
    status: 'processing' | 'completed' | 'rejected',
    adminNotes?: string
  ) => {
    if (!isAdmin) return false;

    try {
      const updateData: any = {
        status,
        processed_by: user?.id,
        processed_at: new Date().toISOString()
      };

      if (adminNotes) {
        updateData.admin_notes = adminNotes;
      }

      // Wenn completed und data_export, generiere Download URL
      if (status === 'completed') {
        const request = gdprRequests.find(r => r.id === requestId);
        if (request?.request_type === 'data_export') {
          updateData.data_export_url = `/api/gdpr/export/${requestId}`;
        }
      }

      const { error } = await supabase
        .from('gdpr_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) throw error;

      // Log Admin Action
      await supabase
        .from('admin_logs')
        .insert({
          admin_id: user?.id,
          action: `gdpr_request_${status}`,
          target_type: 'gdpr_request',
          target_id: requestId,
          details: { admin_notes: adminNotes, status }
        });

      await loadAllGdprRequests();

      toast({
        title: "GDPR-Anfrage bearbeitet",
        description: `Anfrage wurde als ${status} markiert.`,
      });

      return true;
    } catch (error) {
      console.error('Error processing GDPR request:', error);
      toast({
        title: "Fehler",
        description: "GDPR-Anfrage konnte nicht bearbeitet werden.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Aktualisiere Compliance Document
  const updateComplianceDocument = async (
    documentId: string,
    updates: Partial<ComplianceDocument>
  ) => {
    if (!isAdmin) return false;

    try {
      const { error } = await supabase
        .from('compliance_documents')
        .update({
          ...updates,
          last_updated: new Date().toISOString()
        })
        .eq('id', documentId);

      if (error) throw error;

      await loadComplianceDocuments();

      toast({
        title: "Dokument aktualisiert",
        description: "Das Compliance-Dokument wurde erfolgreich aktualisiert.",
      });

      return true;
    } catch (error) {
      console.error('Error updating document:', error);
      toast({
        title: "Fehler",
        description: "Dokument konnte nicht aktualisiert werden.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Erstelle neues Compliance Document
  const createComplianceDocument = async (
    documentData: {
      document_type: string;
      title: string;
      content: string;
      version: string;
      status: string;
    }
  ) => {
    if (!isAdmin) return false;

    try {
      const { error } = await supabase
        .from('compliance_documents')
        .insert({
          ...documentData,
          created_by: user?.id,
          last_updated: new Date().toISOString()
        });

      if (error) throw error;

      await loadComplianceDocuments();

      toast({
        title: "Dokument erstellt",
        description: "Das neue Compliance-Dokument wurde erstellt.",
      });

      return true;
    } catch (error) {
      console.error('Error creating document:', error);
      toast({
        title: "Fehler",
        description: "Dokument konnte nicht erstellt werden.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Lade alle Daten beim Start
  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    const loadAllData = async () => {
      setLoading(true);
      await Promise.all([
        loadAdminStats(),
        loadAllGdprRequests(),
        loadComplianceDocuments()
      ]);
      setLoading(false);
    };

    loadAllData();
  }, [isAdmin]);

  // Realtime Subscriptions für Admin
  useEffect(() => {
    if (!isAdmin) return;

    // GDPR Requests Realtime
    const gdprChannel = supabase
      .channel('admin_gdpr_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'gdpr_requests'
        },
        () => {
          loadAllGdprRequests();
          loadAdminStats();
        }
      )
      .subscribe();

    // Compliance Stats Realtime
    const statsChannel = supabase
      .channel('admin_compliance_stats_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'compliance_stats'
        },
        () => {
          loadAdminStats();
        }
      )
      .subscribe();

    // Documents Realtime
    const docsChannel = supabase
      .channel('admin_compliance_docs_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'compliance_documents'
        },
        () => {
          loadComplianceDocuments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(gdprChannel);
      supabase.removeChannel(statsChannel);
      supabase.removeChannel(docsChannel);
    };
  }, [isAdmin]);

  return {
    // Data
    stats,
    gdprRequests,
    documents,
    loading,
    
    // Actions
    processGdprRequest,
    updateComplianceDocument,
    createComplianceDocument,
    
    // Reload functions
    loadAdminStats,
    loadAllGdprRequests,
    loadComplianceDocuments
  };
}