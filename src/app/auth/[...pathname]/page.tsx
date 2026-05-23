"use client"

import { AuthView } from '@neondatabase/neon-js/auth/react/ui';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';

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
        <div className="animate-pulse text-orpheus-gradient">Loading...</div>
      </div>
    );
  }

  // Join the pathname segments for catch-all routes
  const pathname = Array.isArray(params.pathname)
    ? params.pathname.join('/')
    : (params.pathname as string | undefined);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 bg-card rounded-xl border border-border shadow-2xl relative overflow-hidden">
        {/* Decorative background for the card */}
        <div className="absolute top-0 left-0 w-full h-1 bg-orpheus-gradient" />
        
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-orpheus-gradient mb-2">Orpheus AI</h1>
          <p className="text-muted-foreground">Continue to your cosmic assistant</p>
        </div>

        <AuthView 
          pathname={pathname || ''} 
          navigate={(url) => router.push(url)}
        />
        
        <div className="mt-6 text-center text-sm">
          <button 
            onClick={() => router.push('/')}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
