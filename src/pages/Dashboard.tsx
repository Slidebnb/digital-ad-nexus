import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { UserDashboard } from "@/components/UserDashboard";
import { AdminDashboard } from "@/components/AdminDashboard";
import { MobileBottomNavigation } from "@/components/MobileBottomNavigation";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { logger } from "@/utils/logger";
import { PageLayout } from "@/components/PageLayout";

export default function Dashboard() {
  const { user, loading, isAdmin, userRole } = useAuth();

  logger.debug('Dashboard render', 'Dashboard', { userId: user?.id, loading, isAdmin, userRole });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Wait for role to be loaded before deciding which dashboard to show
  if (userRole === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  logger.debug('Rendering dashboard for role', 'Dashboard', { userRole, isAdmin });
  
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-6 md:py-8">
        {isAdmin ? <AdminDashboard /> : <UserDashboard />}
      </div>
    </PageLayout>
  );
}
