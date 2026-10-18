'use client';

import { useState } from 'react';
import { MdLogout } from 'react-icons/md';
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
      {loading ? <Spinner data-icon="inline-start" /> : <MdLogout size={16} />}
      Cerrar sesión
    </Button>
  );
}
