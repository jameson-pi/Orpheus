"use client"

import { AuthView } from '@neondatabase/neon-js/auth/react/ui';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';

import { Stars } from '@/components/ui/stars';

export default function AuthPage() {
  const params = useParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (mounted && session) {
      router.push('/');
    }
  }, [mounted, session, router]);

  if (!mounted || isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <Stars />
        <div className="animate-pulse text-orpheus-gradient font-headline font-bold text-xl">Loading cosmic interface...</div>
      </div>
    );
  }

  // Join the pathname segments for catch-all routes
  const pathname = Array.isArray(params.pathname)
    ? params.pathname.join('/')
    : (params.pathname as string | undefined);

  return (
    <div className="flex items-center justify-center min-h-screen bg-transparent relative overflow-hidden">
      <Stars />
      {/* Decorative cosmic elements */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="w-full max-w-md p-8 bg-card/60 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden cosmic-shadow animate-in fade-in zoom-in duration-500">
        {/* Decorative background for the card */}
        <div className="absolute top-0 left-0 w-full h-1 bg-orpheus-gradient" />
        
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-orpheus-gradient mb-2 font-headline tracking-tight">Orpheus AI</h1>
          <p className="text-muted-foreground text-sm font-medium">Continue to your cosmic assistant</p>
        </div>

        <div className="auth-view-wrapper">
          <AuthView 
            pathname={pathname || ''} 
            navigate={(url) => router.push(url)}
          />
        </div>
        
        <div className="mt-8 text-center text-sm">
          <button 
            onClick={() => router.push('/')}
            className="text-muted-foreground hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
