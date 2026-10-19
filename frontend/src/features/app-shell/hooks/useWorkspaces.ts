'use client';

import { useEffect, useState } from 'react';
import { getWorkspacesAction } from '@/core/actions/get-workspaces.action';
import type { Workspace } from '@/core/models/farm.model';

/** Un pedido por carga de pantalla: el sidebar de escritorio y el del panel del celular comparten la respuesta. */
const FRESH_FOR_MS = 30_000;
let cached: { at: number; request: Promise<Workspace[]> } | null = null;

function loadWorkspaces(): Promise<Workspace[]> {
  if (cached && Date.now() - cached.at < FRESH_FOR_MS) return cached.request;
  const request = getWorkspacesAction()
    .then((result) => (result.status === 'ok' ? result.workspaces : []))
    .catch(() => []);
  cached = { at: Date.now(), request };
  return request;
}

/**
 * Campos del usuario para el sidebar ("Mis campos") y la búsqueda. `null` mientras cargan; si la API no responde,
 * queda la lista vacía y el resto del marco sigue funcionando.
 */
export function useWorkspaces(): Workspace[] | null {
  const [workspaces, setWorkspaces] = useState<Workspace[] | null>(null);

  useEffect(() => {
    let alive = true;
    loadWorkspaces().then((list) => alive && setWorkspaces(list));
    return () => {
      alive = false;
    };
  }, []);

  return workspaces;
}
