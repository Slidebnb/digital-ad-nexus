import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: object) => void;
  }
}

// Google Analytics event tracking
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    });
  }
};

// Page view tracking
export const trackPageView = (path: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: path,
      anonymize_ip: true
    });
  }
};

// Hook for automatic page view tracking
export const useGoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

  return { trackEvent, trackPageView };
};

// Common event tracking functions
export const analytics = {
  // User events
  signUp: () => trackEvent('sign_up', 'engagement'),
  signIn: () => trackEvent('login', 'engagement'),
  
  // Ad events
  createAd: (category?: string) => trackEvent('create_ad', 'ads', category),
  viewAd: (adId: string) => trackEvent('view_item', 'ads', adId),
  contactSeller: (adId: string) => trackEvent('contact_seller', 'engagement', adId),
  favoriteAd: (adId: string) => trackEvent('add_to_favorites', 'engagement', adId),
  
  // Search and browse
  search: (query: string) => trackEvent('search', 'engagement', query),
  browseCategory: (category: string) => trackEvent('view_category', 'navigation', category),
  
  // Premium features
  upgradePremium: () => trackEvent('purchase', 'premium'),
  boostAd: (adId: string) => trackEvent('boost_ad', 'premium', adId),
  
  // Crypto events
  cryptoPayment: (currency: string, amount: number) => 
    trackEvent('crypto_payment', 'conversion', currency, amount),
  walletConnect: (walletType: string) => trackEvent('wallet_connect', 'crypto', walletType),
  
  // Social features
  sendMessage: () => trackEvent('send_message', 'social'),
  rateUser: (rating: number) => trackEvent('rate_user', 'social', undefined, rating),
  reportUser: () => trackEvent('report_user', 'safety'),
  
  // Navigation
  viewProfile: () => trackEvent('view_profile', 'navigation'),
  viewDashboard: () => trackEvent('view_dashboard', 'navigation'),
  viewFavorites: () => trackEvent('view_favorites', 'navigation')
};