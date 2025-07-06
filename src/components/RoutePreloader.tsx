"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const CRITICAL_ROUTES = [
  '/dashboard',
  '/pipeline', 
  '/positions'
];

export default function RoutePreloader() {
  const router = useRouter();

  useEffect(() => {
    // Preload critical routes after the initial page load
    const preloadRoutes = async () => {
      if (typeof window !== 'undefined') {
        // Wait for the page to be interactive
        await new Promise(resolve => {
          if (document.readyState === 'complete') {
            resolve(true);
          } else {
            window.addEventListener('load', () => resolve(true), { once: true });
          }
        });

        // Preload routes with a slight delay to avoid blocking the main thread
        setTimeout(() => {
          CRITICAL_ROUTES.forEach(route => {
            router.prefetch(route);
          });
        }, 2000);
      }
    };

    preloadRoutes();
  }, [router]);

  // Add intersection observer for navigation links
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const link = entry.target as HTMLElement;
            const href = link.getAttribute('href');
            if (href && href.startsWith('/')) {
              router.prefetch(href);
            }
          }
        });
      },
      { 
        rootMargin: '100px',
        threshold: 0.1 
      }
    );

    // Observe navigation links
    const observeLinks = () => {
      const navLinks = document.querySelectorAll('a[href^="/"]');
      navLinks.forEach(link => observer.observe(link));
    };

    // Delay to ensure DOM is ready
    setTimeout(observeLinks, 1000);

    return () => observer.disconnect();
  }, [router]);

  return null;
}