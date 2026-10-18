'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { IconType } from 'react-icons';
import {
  MdOutlineAccountCircle,
  MdOutlineBadge,
  MdOutlineEco,
  MdOutlineExplore,
  MdOutlinePlace,
  MdOutlineSchedule,
  MdOutlineWorkOutline,
  MdSearch,
  MdVerified,
  MdWhatsapp,
} from 'react-icons/md';
import type { PreviewData, PreviewIcon } from '../config/types';

const ICONS: Record<PreviewIcon, IconType> = {
  map: MdOutlinePlace,
  briefcase: MdOutlineWorkOutline,
  clock: MdOutlineSchedule,
  users: MdOutlineAccountCircle,
  leaf: MdOutlineEco,
  compass: MdOutlineExplore,
  phone: MdWhatsapp,
  badge: MdOutlineBadge,
  search: MdSearch,
};

const initials = (name?: string) =>
  name
    ?.split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

const Skeleton = ({ className }: { className: string }) => (
  <span className={`bg-sage-50/10 block h-2 rounded-full ${className}`} aria-hidden />
);

/** Ilustración del panel derecho: el perfil se va completando a medida que avanza el registro. */
export default function ProfilePreviewCard({ data }: { data: PreviewData }) {
  const reduce = useReducedMotion();
  const fade = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 4 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0 },
        transition: { duration: 0.25 },
      };

  return (
    <div className="border-sage-50/10 bg-sage-50/[0.04] w-[300px] rounded-xl border p-6 backdrop-blur-sm xl:w-[340px]">
      <div className="bg-sage-50/10 text-body-lg text-sage-50 mx-auto flex h-16 w-16 items-center justify-center rounded-xl font-semibold">
        {initials(data.name) || <MdOutlineAccountCircle size={28} className="text-sage-50/50" />}
      </div>

      <div className="mt-4 flex min-h-6 items-center justify-center gap-1.5">
        {data.name ? (
          <>
            <span className="text-body-sm text-sage-50 truncate font-medium">{data.name}</span>
            <MdVerified
              size={16}
              className="text-field-300 shrink-0"
              aria-label="Perfil verificado"
            />
          </>
        ) : (
          <Skeleton className="w-28" />
        )}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={data.badge}
          {...fade}
          className="bg-sage-50/10 text-caption text-sage-50/80 mx-auto mt-2 block w-fit rounded-full px-2.5 py-0.5 font-medium"
        >
          {data.badge}
        </motion.span>
      </AnimatePresence>

      <ul className="mt-5 flex flex-col gap-3">
        {data.rows.map((row, i) => {
          const RowIcon = ICONS[row.icon];
          return (
            <li key={i} className="flex h-5 items-center gap-2.5">
              <RowIcon
                size={14}
                className={row.text ? 'text-field-300 shrink-0' : 'text-sage-50/25 shrink-0'}
              />
              <AnimatePresence mode="wait" initial={false}>
                {row.text ? (
                  <motion.span key="text" {...fade} className="text-caption text-sage-50/80 truncate">
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
