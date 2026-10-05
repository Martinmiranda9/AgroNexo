'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { createMatchAction } from '@/core/actions/create-match.action';
import type { CreateMatchResult, SearchLocation } from '@/core/models/match.model';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import BrandGlow from '@/ui/components/BrandGlow';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/ui/components/Sheet';
import { useMatchDiscovery } from '../hooks/useMatchDiscovery';
import { fullName, type ResultView } from '../lib/build-results';
import type { MatchDiscoveryUser } from '../types';
import MatchDiscoveryHeader from './MatchDiscoveryHeader';
import MatchRequestDialog from './MatchRequestDialog';
import NeedSummary from './NeedSummary';
import ProfessionalDetail from './ProfessionalDetail';
import ResultsSection from './ResultsSection';
import SearchHero from './SearchHero';
import SearchingState from './SearchingState';

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
  const [sheetOpen, setSheetOpen] = useState(false);
  const [requestFor, setRequestFor] = useState<ResultView | null>(null);

  const { phase, need, selected } = discovery;
  const requested = selected ? discovery.sentTo.has(selected.recommendation.professionalId) : false;

  const confirmMatch = async (result: ResultView): Promise<CreateMatchResult> => {
    if (discovery.isSample) {
      await new Promise((resolve) => setTimeout(resolve, SAMPLE_SEND_DELAY_MS));
      return { status: 'created', matchId: 'sample-match' };
    }
    return createMatchAction(result.recommendation.professionalId);
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
        <MatchDiscoveryHeader user={user} />

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
                <SearchingState />
              </motion.div>
            )}

            {phase === 'results' && need && (
              <motion.div key="results" className="pt-10" {...fade}>
                <NeedSummary
                  need={need}
                  location={location}
                  onEdit={discovery.edit}
                  onRoleChange={discovery.changeRole}
                  onRemoveTopic={discovery.removeTopic}
                />
                <ResultsSection
                  results={discovery.results}
                  selected={selected}
                  sentTo={discovery.sentTo}
                  refreshing={discovery.refreshing}
                  error={discovery.error}
                  isSample={discovery.isSample}
                  onSelect={(id) => {
                    discovery.select(id);
                    if (!isDesktop) setSheetOpen(true);
                  }}
                  onRequest={setRequestFor}
                  onEdit={discovery.edit}
                  onRetry={discovery.retry}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* En celular la ficha se abre desde abajo; en escritorio vive al costado de la lista. */}
      <Sheet open={sheetOpen && !isDesktop && selected !== null} onOpenChange={setSheetOpen}>
        <SheetContent
          side="bottom"
          className="bg-surface max-h-[90dvh] overflow-y-auto rounded-t-[22px] p-5 pt-10"
        >
          {selected && (
            <>
              <SheetTitle className="sr-only">
                Perfil de {fullName(selected.recommendation)}
              </SheetTitle>
              <SheetDescription className="sr-only">
                Por qué aparece en tu búsqueda y cómo pedir el match.
              </SheetDescription>
              <ProfessionalDetail
                key={selected.recommendation.id}
                result={selected}
                requested={requested}
                onRequest={() => {
                  setSheetOpen(false);
                  setRequestFor(selected);
                }}
              />
            </>
          )}
        </SheetContent>
      </Sheet>

      <MatchRequestDialog
        result={requestFor}
        onClose={() => setRequestFor(null)}
        onConfirm={confirmMatch}
        onSent={discovery.markSent}
      />
    </div>
  );
}
