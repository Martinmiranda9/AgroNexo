'use client';

import { useState } from 'react';
import { MdLogout } from 'react-icons/md';
import { Button } from '@/ui/components/Button';
import { Spinner } from '@/ui/components/Spinner';

/** Cierra la sesión (Firebase + cookie) y vuelve al login. */
export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      // El SDK de Firebase se baja recién al cerrar sesión.
      const { signOutSession } = await import('@/core/auth/firebase-actions');
      await signOutSession();
    } finally {
      window.location.assign('/login');
    }
  };

  return (
    <Button type="button" variant="outline" size="sm" disabled={loading} onClick={handleLogout}>
      {loading ? <Spinner data-icon="inline-start" /> : <MdLogout size={16} />}
      Cerrar sesión
    </Button>
  );
}
