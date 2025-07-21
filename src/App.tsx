
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { EnhancedNotificationSystem } from "@/components/EnhancedNotificationSystem";
import { AuthProvider } from "@/hooks/useAuth";

import { EnhancedErrorBoundary } from "@/components/EnhancedErrorBoundary";
import { ProductionSecurityWrapper } from "@/components/ProductionSecurityWrapper";
import { PerformanceOptimizer } from "@/components/PerformanceOptimizer";
import { NetworkMonitor } from "@/components/NetworkMonitor";
import { CookieConsentManager } from "@/components/CookieConsentManager";
import { ProductionReadyBanner } from "@/components/ProductionReadyBanner";
import Index from "./pages/Index";
import Login from "./pages/LoginSimple";
import Dashboard from "./pages/Dashboard";
import Browse from "./pages/Browse";
import Categories from "./pages/Categories";
import Favorites from "./pages/Favorites";
import NotFound from "./pages/NotFound";
import CreateAd from "./pages/CreateAd";
import AdDetail from "./pages/AdDetail";

import { AuthGuard } from "./components/AuthGuard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: 1000,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => (
  <EnhancedErrorBoundary level="critical" context="App">
    <ProductionSecurityWrapper>
      <PerformanceOptimizer>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <AuthProvider>
              <NetworkMonitor />
              <EnhancedNotificationSystem />
              <ProductionReadyBanner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  {/* Redirect /profile to /dashboard for consistency */}
                  <Route path="/profile" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<AuthGuard requireAuth><Dashboard /></AuthGuard>} />
                  <Route path="/browse" element={<Browse />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/favorites" element={<AuthGuard requireAuth><Favorites /></AuthGuard>} />
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
        </QueryClientProvider>
      </PerformanceOptimizer>
    </ProductionSecurityWrapper>
  </EnhancedErrorBoundary>
);

export default App;
