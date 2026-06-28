'use client';

import { Suspense } from 'react';
import ExperiencePageShell from '../components/ExperiencePageShell';
import SaladaDestacadosSection from '../components/SaladaDestacadosSection';
import SaladaCategoryCatalog from '../components/SaladaCategoryCatalog';
import ComidaPorcionesGuide from '../components/ComidaPorcionesGuide';
import ExperienceSearchResults from '../components/ExperienceSearchResults';
import { useRegalosExperienciaFetch } from '../context/RegalosExperienciaContext';

function SaladaPageInner() {
  const experiencia = useRegalosExperienciaFetch();

  return (
    <ExperiencePageShell
      theme="salada"
      title="Comida Toppi's"
      subtitle="Elige tu base, ponle tu Toppi's — chorrillana, completo, wok o plato listo. Precio claro en cada paso."
      note="Retiro Santiago Watt 205, Renaico · Salsas en mostrador: mayo, mostaza, ketchup y ají"
    >
      <div className="mx-auto max-w-7xl px-3 sm:px-4">
        <Suspense fallback={null}>
          <ExperienceSearchResults scope="salada" title="Comida encontrada" />
        </Suspense>
        <ComidaPorcionesGuide data={experiencia?.comida_porciones} />
        <SaladaDestacadosSection variant="page" />
        <Suspense fallback={null}>
          <SaladaCategoryCatalog />
        </Suspense>
      </div>
    </ExperiencePageShell>
  );
}

export default function SaladaPage() {
  return (
    <Suspense fallback={null}>
      <SaladaPageInner />
    </Suspense>
  );
}
