"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function PerformanceMonitor() {
  const pathname = usePathname();

  useEffect(() => {
    // Track page load performance
    const trackPerformance = () => {
      if (typeof window !== 'undefined' && 'performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          const loadTime = navigation.loadEventEnd - navigation.fetchStart;
          const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart;
          const firstPaint = performance.getEntriesByName('first-paint')[0]?.startTime || 0;
          const firstContentfulPaint = performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0;

          // Log performance metrics (in development)
          if (process.env.NODE_ENV === 'development') {
            console.log(`Page: ${pathname}`, {
              loadTime: Math.round(loadTime),
              domContentLoaded: Math.round(domContentLoaded),
              firstPaint: Math.round(firstPaint),
              firstContentfulPaint: Math.round(firstContentfulPaint),
            });
          }

          // You could send these metrics to an analytics service here
          // analytics.track('page_performance', { pathname, loadTime, ... });
        }
      }
    };

    // Track performance after page is fully loaded
    const timeoutId = setTimeout(trackPerformance, 1000);

    return () => clearTimeout(timeoutId);
  }, [pathname]);

  // Preload critical routes on page interaction
  useEffect(() => {
    const preloadRoutes = () => {
      if (typeof window !== 'undefined') {
        // Preload dashboard when user hovers over navigation
        const navLinks = document.querySelectorAll('a[href="/dashboard"], a[href="/pipeline"], a[href="/positions"]');
        
        navLinks.forEach(link => {
          link.addEventListener('mouseenter', () => {
            const href = link.getAttribute('href');
            if (href) {
              // Create a link element to trigger prefetch
              const prefetchLink = document.createElement('link');
              prefetchLink.rel = 'prefetch';
              prefetchLink.href = href;
              document.head.appendChild(prefetchLink);
            }
          }, { once: true });
        });
      }
    };

    // Delay to ensure DOM is ready
    const timeoutId = setTimeout(preloadRoutes, 500);

    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return null; // This component doesn't render anything
}