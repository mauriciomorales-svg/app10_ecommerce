'use client';

import { Suspense } from 'react';
import ExperiencePageShell from '../components/ExperiencePageShell';
import HeladosCombosSection from '../components/HeladosCombosSection';
import ExperienceSearchResults from '../components/ExperienceSearchResults';

export default function HeladosPage() {
  return (
    <ExperiencePageShell
      theme="helados"
      title="Helado Toppi's"
      subtitle="Elige tu base, ponle tu Toppi's — combos listos o arma el tuyo."
    >
      <div className="mx-auto max-w-7xl px-3 sm:px-4">
        <Suspense fallback={null}>
          <ExperienceSearchResults scope="helados" title="Helados encontrados" />
        </Suspense>
        <HeladosCombosSection variant="page" />
      </div>
    </ExperiencePageShell>
  );
}
