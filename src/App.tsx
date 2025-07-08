import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthContext, useAuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { CookieConsentManager } from "@/components/CookieConsentManager";
import Index from "./pages/Index";
import Login from "./pages/LoginSimple";
import Dashboard from "./pages/Dashboard";
import Browse from "./pages/Browse";
import Categories from "./pages/Categories";
import Favorites from "./pages/Favorites";
import NotFound from "./pages/NotFound";
import CreateAd from "./pages/CreateAd";
import AdDetail from "./pages/AdDetail";
import CryptoHub from "./pages/CryptoHub";
import { AuthGuard } from "./components/AuthGuard";

const queryClient = new QueryClient();

function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthProvider();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/profile" element={<AuthGuard requireAuth><Dashboard /></AuthGuard>} />
                <Route path="/dashboard" element={<AuthGuard requireAuth><Dashboard /></AuthGuard>} />
                <Route path="/browse" element={<Browse />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/favorites" element={<AuthGuard requireAuth><Favorites /></AuthGuard>} />
                <Route path="/crypto-hub" element={<AuthGuard requireAuth><CryptoHub /></AuthGuard>} />
                <Route path="/create-ad" element={<AuthGuard requireAuth><CreateAd /></AuthGuard>} />
                <Route path="/ad/:id" element={<AdDetail />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <CookieConsentManager />
            </BrowserRouter>
          </AuthProvider>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
