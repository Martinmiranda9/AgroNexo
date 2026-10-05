'use client';

import { useState } from 'react';
import { SignOut } from '@phosphor-icons/react';
import { Button, Spinner } from '@/ui/components';
import { signOutSession } from '@/core/auth/firebase-actions';

/** Cierra la sesión (Firebase + cookie) y vuelve al login. */
export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOutSession();
    } finally {
      window.location.assign('/login');
    }
  };

  return (
    <Button type="button" variant="outline" size="sm" disabled={loading} onClick={handleLogout}>
      {loading ? <Spinner data-icon="inline-start" /> : <SignOut size={16} weight="bold" />}
      Cerrar sesión
    </Button>
  );
}
