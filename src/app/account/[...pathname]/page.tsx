"use client"

import { AccountView } from '@neondatabase/neon-js/auth/react/ui';
import { useParams } from 'next/navigation';

export default function AccountPage() {
  const params = useParams();
  const pathname = Array.isArray(params.pathname) ? params.pathname.join('/') : params.pathname;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}
    >
      <AccountView pathname={pathname} />
    </div>
  );
}

