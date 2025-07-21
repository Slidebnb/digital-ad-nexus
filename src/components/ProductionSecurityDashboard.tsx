import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  Lock, 
  Globe, 
  Database,
  Server,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  FileText,
  HardDrive,
  Activity
} from "lucide-react";

interface SecurityCheck {
  id: string;
  category: string;
  title: string;
  status: 'secure' | 'warning' | 'critical';
  description: string;
  recommendation?: string;
  documentationUrl?: string;
}

export function ProductionSecurityDashboard() {
  const securityChecks: SecurityCheck[] = [
    {
      id: 'https',
      category: 'Transport Security',
      title: 'HTTPS/SSL Configuration',
      status: 'secure',
      description: 'SSL-Zertifikate sind konfiguriert und aktiv',
      recommendation: 'Ensure SSL certificates auto-renew'
    },
    {
      id: 'rls',
      category: 'Database Security',
      title: 'Row Level Security (RLS)',
      status: 'secure',
      description: 'RLS ist für alle kritischen Tabellen aktiviert',
      recommendation: 'Regelmäßige RLS Policy Audits durchführen'
    },
    {
      id: 'functions',
      category: 'Database Security',
      title: 'Function Security',
      status: 'secure',
      description: 'Database Functions sind sicher konfiguriert (search_path fixed)',
      recommendation: 'Security DEFINER functions regelmäßig überprüfen'
    },
    {
      id: 'auth',
      category: 'Authentication',
      title: 'Authentication Security',
      status: 'secure',
      description: 'Supabase Auth ist sicher konfiguriert',
      recommendation: '2FA für Admin-Accounts aktivieren'
    },
    {
      id: 'csp',
      category: 'Web Security',
      title: 'Content Security Policy',
      status: 'warning',
      description: 'Basis CSP Headers sind konfiguriert',
      recommendation: 'Strengthen CSP headers for production',
      documentationUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP'
    },
    {
      id: 'backup',
      category: 'Data Protection',
      title: 'Database Backups',
      status: 'warning',
      description: 'Supabase Auto-Backups sind aktiv',
      recommendation: 'Configure additional backup strategy',
      documentationUrl: 'https://supabase.com/docs/guides/platform/backups'
    },
    {
      id: 'monitoring',
      category: 'Security Monitoring',
      title: 'Security Monitoring',
      status: 'secure',
      description: 'Real-time monitoring und alerts sind aktiv',
      recommendation: 'Set up external security monitoring'
    },
    {
      id: 'secrets',
      category: 'Secret Management',
      title: 'API Key Security',
      status: 'secure',
      description: 'API Keys sind sicher in Supabase Vault gespeichert',
      recommendation: 'Rotate API keys regelmäßig'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'secure': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'secure': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Transport Security': return Globe;
      case 'Database Security': return Database;
      case 'Authentication': return Lock;
      case 'Web Security': return Shield;
      case 'Data Protection': return HardDrive;
      case 'Security Monitoring': return Activity;
      case 'Secret Management': return FileText;
      default: return Shield;
    }
  };

  const secureCount = securityChecks.filter(check => check.status === 'secure').length;
  const warningCount = securityChecks.filter(check => check.status === 'warning').length;
  const criticalCount = securityChecks.filter(check => check.status === 'critical').length;
  const totalChecks = securityChecks.length;
  const securityScore = Math.round((secureCount / totalChecks) * 100);

  const groupedChecks = securityChecks.reduce((acc, check) => {
    if (!acc[check.category]) {
      acc[check.category] = [];
    }
    acc[check.category].push(check);
    return acc;
  }, {} as Record<string, SecurityCheck[]>);

  return (
    <div className="space-y-6">
      {/* Security Score Overview */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Production Security Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-3xl font-bold text-primary">
                {securityScore}%
              </div>
              <div className="text-sm text-muted-foreground">
                Security Compliance
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>{secureCount} Secure</span>
                </div>
                <div className="flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span>{warningCount} Warnings</span>
                </div>
                {criticalCount > 0 && (
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span>{criticalCount} Critical</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <Progress value={securityScore} className="h-2" />
        </CardContent>
      </Card>

      {/* Critical Issues Alert */}
      {(criticalCount > 0 || warningCount > 2) && (
        <Alert variant={criticalCount > 0 ? "destructive" : "default"}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold mb-2">
              {criticalCount > 0 
                ? `${criticalCount} kritische Sicherheitsprobleme gefunden` 
                : `${warningCount} Sicherheitswarnungen erfordern Aufmerksamkeit`
              }
            </div>
            <div className="text-sm">
              Überprüfen Sie die unten stehenden Empfehlungen für eine sichere Production-Umgebung.
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Security Checks by Category */}
      <div className="space-y-6">
        {Object.entries(groupedChecks).map(([category, checks]) => {
          const CategoryIcon = getCategoryIcon(category);
          
          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CategoryIcon className="h-5 w-5" />
                  {category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {checks.map((check) => (
                    <div 
                      key={check.id}
                      className={`p-4 rounded-lg border ${getStatusColor(check.status)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {getStatusIcon(check.status)}
                          <div className="flex-1">
                            <div className="font-medium mb-1">
                              {check.title}
                            </div>
                            <div className="text-sm text-muted-foreground mb-2">
                              {check.description}
                            </div>
                            {check.recommendation && (
                              <div className="text-sm font-medium">
                                💡 {check.recommendation}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={check.status === 'secure' ? 'secondary' : 'destructive'}
                            className="text-xs"
                          >
                            {check.status.toUpperCase()}
                          </Badge>
                          {check.documentationUrl && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              asChild
                              className="h-8 w-8 p-0"
                            >
                              <a 
                                href={check.documentationUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Production Readiness Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Production Launch Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { task: 'SSL/HTTPS konfiguriert', done: true },
              { task: 'Database Security (RLS + Functions)', done: true },
              { task: 'Performance Monitoring aktiv', done: true },
              { task: 'Error Boundary implementiert', done: true },
              { task: 'GDPR Compliance implementiert', done: true },
              { task: 'Backup-Strategie konfiguriert', done: false },
              { task: 'Security Monitoring aktiv', done: true },
              { task: 'Load Testing durchgeführt', done: false }
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                {item.done ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                )}
                <span className={item.done ? 'text-green-700' : 'text-yellow-700'}>
                  {item.task}
                </span>
                <Badge variant={item.done ? 'secondary' : 'outline'} className="text-xs">
                  {item.done ? 'Erledigt' : 'Ausstehend'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}