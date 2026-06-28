'use client';

import { Suspense } from 'react';
import ExperiencePageShell from '../components/ExperiencePageShell';
import PacksPremiumShowcase from '../components/PacksPremiumShowcase';

export default function CocinaCasaPage() {
  return (
    <ExperiencePageShell
      theme="salada"
      title="Cocina de la casa"
      subtitle="Lo más pedido en Facebook de la zona — elige listo para calentar o kit con verduras para cocinar en casa."
      note="Retiro Santiago Watt 205, Renaico · Paga online en dondemorales.cl · ideal para compartir en redes"
    >
      <div className="mx-auto max-w-7xl px-3 sm:px-4">
        <Suspense fallback={null}>
          <PacksPremiumShowcase variant="page" ocasionFilter="todos" coleccionOnly="cocina_casa_facebook" />
        </Suspense>
      </div>
    </ExperiencePageShell>
  );
}
