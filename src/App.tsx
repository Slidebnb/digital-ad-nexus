
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { SimpleErrorBoundary } from "@/components/SimpleErrorBoundary";
import { EnhancedNotificationSystem } from "@/components/EnhancedNotificationSystem";
import { CookieConsentManager } from "@/components/CookieConsentManager";
import { NotificationPermissionPrompt } from "@/components/NotificationPermissionPrompt";
import { useRealtimePushNotifications } from "@/hooks/useRealtimePushNotifications";
import { useGoogleAnalytics } from "@/hooks/useGoogleAnalytics";

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
      retry: 1,
      retryDelay: 1000,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const AppContent = () => {
  useGoogleAnalytics();
  useRealtimePushNotifications();
  
  return (
    <>
      <EnhancedNotificationSystem />
      <CookieConsentManager />
      <NotificationPermissionPrompt />
      <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<AuthGuard requireAuth><Dashboard /></AuthGuard>} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/favorites" element={<AuthGuard requireAuth><Favorites /></AuthGuard>} />
              <Route path="/create-ad" element={<AuthGuard requireAuth><CreateAd /></AuthGuard>} />
              <Route path="/ad/:id" element={<AdDetail />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
    </>
  );
};

const App = () => (
  <SimpleErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </AuthProvider>
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </QueryClientProvider>
  </SimpleErrorBoundary>
);

export default App;
