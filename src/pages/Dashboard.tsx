import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { UserDashboard } from "@/components/UserDashboard";
import { AdminDashboard } from "@/components/AdminDashboard";
import { MobileBottomNavigation } from "@/components/MobileBottomNavigation";

export default function Dashboard() {
  const { user, loading, isAdmin, userRole } = useAuth();

  console.log('Dashboard render - user:', user?.id, 'loading:', loading, 'isAdmin:', isAdmin, 'userRole:', userRole);

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

  console.log('Rendering dashboard for role:', userRole, 'isAdmin:', isAdmin);
  
  // Admin Dashboard
  if (isAdmin) {
    return <AdminDashboard />;
  }

  // User Dashboard - simplified without duplicate tabs
  return (
    <div className="min-h-screen bg-background">
      {isAdmin ? <AdminDashboard /> : <UserDashboard />}
      <MobileBottomNavigation />
    </div>
  );
}
