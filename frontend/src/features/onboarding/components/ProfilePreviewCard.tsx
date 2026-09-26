'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  Briefcase,
  Clock,
  Compass,
  IdentificationBadge,
  Leaf,
  MagnifyingGlass,
  MapPin,
  SealCheck,
  UserCircle,
  WhatsappLogo,
} from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';
import type { PreviewData, PreviewIcon } from '../config/types';

const ICONS: Record<PreviewIcon, Icon> = {
  map: MapPin,
  briefcase: Briefcase,
  clock: Clock,
  users: UserCircle,
  leaf: Leaf,
  compass: Compass,
  phone: WhatsappLogo,
  badge: IdentificationBadge,
  search: MagnifyingGlass,
};

const initials = (name?: string) =>
  name
    ?.split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

const Skeleton = ({ className }: { className: string }) => (
  <span className={`block h-2 rounded-full bg-beige/10 ${className}`} aria-hidden />
);

/** Ilustración del panel derecho: el perfil se va completando a medida que avanza el registro. */
export default function ProfilePreviewCard({ data }: { data: PreviewData }) {
  const reduce = useReducedMotion();
  const fade = reduce
    ? {}
    : { initial: { opacity: 0, y: 4 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 }, transition: { duration: 0.25 } };

  return (
    <div className="w-[300px] rounded-2xl border border-beige/10 bg-beige/[0.04] p-6 backdrop-blur-sm xl:w-[340px]">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-beige/10 text-body-lg font-semibold text-beige">
        {initials(data.name) || <UserCircle size={28} weight="light" className="text-beige/50" />}
      </div>

      <div className="mt-4 flex min-h-6 items-center justify-center gap-1.5">
        {data.name ? (
          <>
            <span className="truncate text-body-sm font-medium text-beige">{data.name}</span>
            <SealCheck size={16} weight="fill" className="shrink-0 text-accent-light" aria-label="Perfil verificado" />
          </>
        ) : (
          <Skeleton className="w-28" />
        )}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={data.badge}
          {...fade}
          className="mx-auto mt-2 block w-fit rounded-full bg-beige/10 px-2.5 py-0.5 text-caption font-medium text-beige/80"
        >
          {data.badge}
        </motion.span>
      </AnimatePresence>

      <ul className="mt-5 flex flex-col gap-3">
        {data.rows.map((row, i) => {
          const RowIcon = ICONS[row.icon];
          return (
            <li key={i} className="flex h-5 items-center gap-2.5">
              <RowIcon size={14} className={row.text ? 'shrink-0 text-accent-light' : 'shrink-0 text-beige/25'} />
              <AnimatePresence mode="wait" initial={false}>
                {row.text ? (
                  <motion.span key="text" {...fade} className="truncate text-caption text-beige/80">
                    {row.text}
                  </motion.span>
                ) : (
                  <motion.span key="skeleton" {...fade} className="flex-1">
                    <Skeleton className={i % 2 ? 'w-2/5' : 'w-3/5'} />
                  </motion.span>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
