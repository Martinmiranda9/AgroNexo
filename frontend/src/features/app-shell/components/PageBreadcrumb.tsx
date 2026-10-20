'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { farmRoute } from '@/shared/constants/routes';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/ui/components/Breadcrumb';
import { useWorkspaces } from '../hooks/useWorkspaces';
import { NAV, isActiveHref } from '../navigation';
import type { AppUser } from '../types';

/**
 * Dónde está el usuario, a la izquierda de la barra de arriba (el título de página de la referencia de tabla):
 * la sección y, dentro de un campo, su nombre. Sin sección conocida no muestra nada.
 */
export default function PageBreadcrumb({ user }: { user: AppUser }) {
  const pathname = usePathname();
  const farms = useWorkspaces();
  const section = NAV[user.role].find(({ href }) => isActiveHref(pathname, href));
  if (!section) return null;

  const farm =
    pathname === section.href
      ? null
      : (farms?.find((workspace) => pathname === farmRoute(workspace.farmId)) ?? null);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          {farm ? (
            <BreadcrumbLink asChild>
              <Link href={section.href}>{section.label}</Link>
            </BreadcrumbLink>
          ) : (
            <BreadcrumbPage>{section.label}</BreadcrumbPage>
          )}
        </BreadcrumbItem>
        {farm && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{farm.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
