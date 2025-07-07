import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthContext, useAuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Login from "./pages/LoginSimple";
import Dashboard from "./pages/Dashboard";
import Browse from "./pages/Browse";
import Categories from "./pages/Categories";
import NotFound from "./pages/NotFound";
import CreateAd from "./pages/CreateAd";
import AdDetail from "./pages/AdDetail";
import { AuthGuard } from "./components/AuthGuard";

const queryClient = new QueryClient();

function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuthProvider();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<AuthGuard requireAuth><Dashboard /></AuthGuard>} />
            <Route path="/dashboard" element={<AuthGuard requireAuth><Dashboard /></AuthGuard>} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/create-ad" element={<AuthGuard requireAuth><CreateAd /></AuthGuard>} />
            <Route path="/ad/:id" element={<AdDetail />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
