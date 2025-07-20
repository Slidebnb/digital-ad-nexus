
import React from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';

interface PageLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
  className?: string;
}

export function PageLayout({ children, showFooter = true, className = "" }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className={`${className}`}>
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
}
