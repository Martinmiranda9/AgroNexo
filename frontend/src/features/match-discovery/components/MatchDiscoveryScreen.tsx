'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { createMatchAction } from '@/core/actions/create-match.action';
import type { CreateMatchResult, NeedBrief, SearchLocation } from '@/core/models/match.model';
import { AppHeader } from '@/features/app-shell';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import BrandGlow from '@/ui/components/BrandGlow';
import { Drawer, DrawerContent } from '@/ui/components/Drawer';
import { useMatchDiscovery } from '../hooks/useMatchDiscovery';
import type { ResultView } from '../lib/build-results';
import type { MatchDiscoveryUser } from '../types';
import MatchRequestDialog from './MatchRequestDialog';
import NeedSummary from './NeedSummary';
import ProfessionalDetail, { detailTitleId } from './ProfessionalDetail';
import ResultsSection from './ResultsSection';
import SearchHero from './SearchHero';
import SearchingState, { SEARCH_STEPS } from './SearchingState';
import ThoughtLine from '@/ui/components/ThoughtLine';

interface MatchDiscoveryScreenProps {
  user: MatchDiscoveryUser;
  /** Punto desde el que se busca: la ubicación del campo del productor. */
  location: SearchLocation;
}

/** Con los datos ficticios no hay backend al que pedirle el match: se simula el alta para poder ver el flujo. */
const SAMPLE_SEND_DELAY_MS = 500;

/**
 * Pantalla de entrada del productor tras registrarse: describe lo que necesita y ve qué profesionales encajan y por qué.
 * Pide el match con `createMatchAction`; el ranking sale del backend (`searchProfessionalsAction`).
 */
export default function MatchDiscoveryScreen({ user, location }: MatchDiscoveryScreenProps) {
  const discovery = useMatchDiscovery(location);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const reduceMotion = useReducedMotion();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [requestFor, setRequestFor] = useState<ResultView | null>(null);

  const { phase, need, selected } = discovery;
  const requested = selected ? discovery.sentTo.has(selected.recommendation.professionalId) : false;

  const confirmMatch = async (result: ResultView, brief: NeedBrief): Promise<CreateMatchResult> => {
    if (discovery.isSample) {
      await new Promise((resolve) => setTimeout(resolve, SAMPLE_SEND_DELAY_MS));
      return { status: 'created', matchId: 'sample-match' };
    }
    return createMatchAction(result.recommendation.professionalId, brief);
  };

  const requestProps = {
    result: requestFor,
    need,
    placeLabel: discovery.zone.location.label,
    producerName: `${user.firstName} ${user.lastName}`.trim(),
    onClose: () => setRequestFor(null),
    onConfirm: confirmMatch,
    onSent: discovery.markSent,
  };

  const fade = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -6 },
        transition: { duration: 0.25 },
      };

  return (
    <div className="bg-paper relative min-h-[100dvh]">
      <BrandGlow quiet={phase === 'results'} />

      <div className="relative z-10">
        <AppHeader user={user} />

        <main className="mx-auto max-w-[1180px] px-4 pb-16 sm:px-6">
          <AnimatePresence mode="wait" initial={false}>
            {phase === 'describe' && (
              <motion.div key="describe" {...fade}>
                <SearchHero
                  value={discovery.draft}
                  onChange={discovery.setDraft}
                  onSubmit={discovery.submit}
                />
              </motion.div>
            )}

            {phase === 'searching' && (
              <motion.div key="searching" {...fade}>
                <SearchingState query={discovery.draft} />
              </motion.div>
            )}

            {phase === 'results' && need && (
              <motion.div key="results" className="pt-8" {...fade}>
                {/* La misma línea de la búsqueda, ya resuelta y plegada: se despliega para ver qué se hizo. */}
                <ThoughtLine
                  working={false}
                  elapsed={discovery.searchSeconds}
                  label="Buscando profesionales…"
                  doneLabel="Buscamos en"
                  steps={SEARCH_STEPS}
                  glyph="sparkle"
                  fontSize={14}
                  className="text-olive mb-5"
                />
                <NeedSummary
                  need={need}
                  location={discovery.zone.location}
                  fromPrompt={discovery.zone.fromPrompt}
                  unresolvedPlace={discovery.zone.unresolved}
                  onEdit={discovery.edit}
                  onRoleChange={discovery.changeRole}
                  onRemoveTopic={discovery.removeTopic}
                  onClearDetail={discovery.clearDetail}
                />
                <ResultsSection
                  results={discovery.results}
                  selected={selected}
                  sentTo={discovery.sentTo}
                  refreshing={discovery.refreshing}
                  error={discovery.error}
                  isSample={discovery.isSample}
                  zoneLabel={discovery.zone.fromPrompt ? discovery.zone.location.label : 'tu campo'}
                  allRoles={need.role === null}
                  onSelect={(id) => {
                    discovery.select(id);
                    if (!isDesktop) setDrawerOpen(true);
                  }}
                  onRequest={setRequestFor}
                  onEdit={discovery.edit}
                  onRetry={discovery.retry}
                  onShowAllRoles={() => discovery.changeRole(null)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* En celular la ficha se abre en un drawer desde abajo; en escritorio vive al costado de la lista. */}
      <Drawer
        open={drawerOpen && !isDesktop && selected !== null}
        onOpenChange={setDrawerOpen}
        showSwipeHandle
      >
        <DrawerContent
          className="bg-surface"
          aria-labelledby={selected ? detailTitleId(selected.recommendation.id) : undefined}
        >
          {selected && (
            <ProfessionalDetail
              key={selected.recommendation.id}
              result={selected}
              requested={requested}
              onRequest={() => setRequestFor(selected)}
            />
          )}
          {/* La solicitud se apila sobre la ficha: al cancelarla o deslizarla, la ficha sigue debajo. */}
          {!isDesktop && <MatchRequestDialog {...requestProps} side="down" />}
        </DrawerContent>
      </Drawer>

      {isDesktop && <MatchRequestDialog {...requestProps} side="right" />}
    </div>
  );
}
