'use client';

import { Suspense, useMemo } from 'react';
import Link from 'next/link';
import ExperiencePageShell from '../components/ExperiencePageShell';
import PacksPremiumShowcase from '../components/PacksPremiumShowcase';
import RegalosDestacadosSection from '../components/RegalosDestacadosSection';
import RegalosCategoryCatalog from '../components/RegalosCategoryCatalog';
import RegalosOcasionLanding, { useRegaloOcasionFilter } from '../components/RegalosOcasionLanding';
import RegaloQuiz from '../components/RegaloQuiz';
import PackCompareSection from '../components/PackCompareSection';
import RegalosRetiroPanel from '../components/RegalosRetiroPanel';
import RegalosStickyCta from '../components/RegalosStickyCta';
import RegalosQuickNav from '../components/RegalosQuickNav';
import RegalosMasPedidosStrip from '../components/RegalosMasPedidosStrip';
import RegalosPruebaSocial from '../components/RegalosPruebaSocial';
import ExperienceSearchResults from '../components/ExperienceSearchResults';
import { RegalosExperienciaProvider, useRegalosExperiencia } from '../context/RegalosExperienciaContext';
import { PICKUP_LINE } from '../lib/brandCopy';

function RegalosPageInner() {
  const { ocasion, setOcasion } = useRegaloOcasionFilter();
  const { data, experiencia } = useRegalosExperiencia();

  const landingMeta = data?.regalos_destacados
    ? {
        ocasiones: data.regalos_destacados.ocasiones,
        corporativo: data.regalos_destacados.corporativo,
        confianza: data.regalos_destacados.confianza,
        corporativo_form: experiencia?.corporativo_form,
        retiro: experiencia?.retiro,
      }
    : null;

  const packIds = useMemo(() => {
    const map = new Map<string, number | null | undefined>();
    for (const t of data?.packs_tarjetas_premium?.tarjetas ?? []) {
      map.set(t.nombre, t.idproducto);
    }
    for (const d of data?.regalos_destacados?.destacados ?? []) {
      const nombre = String((d as { nombre?: string }).nombre ?? '');
      const id = (d as { idproducto?: number | null }).idproducto;
      if (nombre && id) map.set(nombre, id);
    }
    return map;
  }, [data]);

  const handleQuizOcasion = (id: string) => {
    setOcasion(id);
    document.getElementById('packs-premium')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleQuizPack = (nombre: string, idproducto?: number | null) => {
    if (idproducto) {
      window.location.href = `/producto/${idproducto}`;
      return;
    }
    document.getElementById('packs-premium')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <ExperiencePageShell
      theme="regalos"
      title="¿Cuál es tu regalo Toppi's?"
      subtitle={`Tu ocasión + tu mensaje — productos reales del local. Retiro ${PICKUP_LINE}.`}
      note={
        <>
          Packs listos o personalizables —{' '}
          <Link href="/packs#packs-regalos" className="font-semibold underline hover:text-white">
            ver todos en reservas
          </Link>
        </>
      }
    >
      <div className="mx-auto max-w-7xl px-3 pb-20 sm:px-4 sm:pb-8">
        <ExperienceSearchResults scope="regalos" title="Regalos encontrados" />

        <RegalosOcasionLanding data={landingMeta} ocasion={ocasion} onOcasionChange={setOcasion} />

        <RegalosQuickNav />

        <RegalosMasPedidosStrip nombres={experiencia?.mas_pedidos} packIds={packIds} />

        <RegaloQuiz
          quiz={experiencia?.quiz}
          packIds={packIds}
          onOcasionSelect={handleQuizOcasion}
          onPackSelect={handleQuizPack}
        />

        <RegalosRetiroPanel retiro={experiencia?.retiro} />

        <RegalosPruebaSocial data={experiencia?.prueba_social} />

        <PacksPremiumShowcase variant="page" ocasionFilter={ocasion} />

        <PackCompareSection
          compare={experiencia?.compare}
          masPedidos={experiencia?.mas_pedidos}
        />

        <RegalosDestacadosSection variant="page" ocasionFilter={ocasion} />

        <Suspense fallback={null}>
          <RegalosCategoryCatalog />
        </Suspense>
      </div>

      <RegalosStickyCta />
    </ExperiencePageShell>
  );
}

export default function RegalosPage() {
  return (
    <Suspense fallback={null}>
      <RegalosExperienciaProvider>
        <RegalosPageInner />
      </RegalosExperienciaProvider>
    </Suspense>
  );
}
