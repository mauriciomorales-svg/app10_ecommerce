'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarHeart, ChevronRight, Flame, Sparkles, UtensilsCrossed } from 'lucide-react';
import PackPremiumCard, { type PackPremiumCardData } from './PackPremiumCard';
import ExperienceSectionFallback from './ExperienceSectionFallback';
import { matchesOcasion } from './RegalosOcasionLanding';
import { useRegalosExperienciaOptional } from '../context/RegalosExperienciaContext';

type DiaPadreCfg = {
  activo?: boolean;
  fecha_label?: string;
  headline?: string;
  subheadline?: string;
};

type ShowcaseData = {
  title?: string;
  tagline?: string;
  dia_padre?: DiaPadreCfg;
  dia_padre_comida?: DiaPadreCfg;
  cocina_casa_facebook?: DiaPadreCfg & { whatsapp_cta?: string };
  tarjetas?: PackPremiumCardData[];
};

type Props = {
  variant?: 'home' | 'page';
  ocasionFilter?: string;
  /** Si se define, solo muestra packs de esa colección (ej. cocina_casa_facebook) */
  coleccionOnly?: string;
};

function ColeccionPacksSection({
  id,
  cfg,
  packs,
  isHome,
  badgeClass,
  BadgeIcon,
}: {
  id: string;
  cfg?: DiaPadreCfg & { whatsapp_cta?: string };
  packs: PackPremiumCardData[];
  isHome: boolean;
  badgeClass: string;
  BadgeIcon: typeof UtensilsCrossed;
}) {
  if (!cfg?.activo || packs.length === 0) return null;

  const spotlight = packs.find((p) => p.spotlight) ?? packs[0];
  const grid = packs.filter((p) => p.nombre !== spotlight?.nombre);

  return (
    <div id={id} className="mt-10 scroll-mt-24 border-t border-slate-200/80 pt-8">
      <div className={`mb-5 ${isHome ? '' : 'premium-section-head'}`}>
        <span
          className={`mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] ring-1 ${badgeClass}`}
        >
          <BadgeIcon className="h-3.5 w-3.5" />
          {cfg.fecha_label ?? 'Cocina a pedido'}
        </span>
        <h2 className={`font-display font-extrabold text-brand-ink ${isHome ? 'text-2xl sm:text-3xl' : 'premium-heading'}`}>
          {cfg.headline ?? 'Combos cocina'}
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-brand-muted">{cfg.subheadline}</p>
        {cfg.whatsapp_cta && (
          <a
            href={cfg.whatsapp_cta}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex text-xs font-bold text-emerald-700 hover:underline"
          >
            Compartir por WhatsApp →
          </a>
        )}
      </div>

      {!isHome && spotlight && (
        <div className="mb-6">
          <PackPremiumCard pack={spotlight} variant="spotlight" />
        </div>
      )}

      <div className={`grid gap-4 ${isHome ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2 xl:grid-cols-3'}`}>
        {(isHome ? packs : grid).map((pack) => (
          <PackPremiumCard key={pack.nombre} pack={pack} variant="card" compact={isHome} />
        ))}
      </div>
    </div>
  );
}

export default function PacksPremiumShowcase({
  variant = 'page',
  ocasionFilter = 'todos',
  coleccionOnly,
}: Props) {
  const ctx = useRegalosExperienciaOptional();
  const [localData, setLocalData] = useState<ShowcaseData | null>(null);
  const [localLoading, setLocalLoading] = useState(!ctx);
  const [fetchError, setFetchError] = useState(false);
  const isHome = variant === 'home';
  const useShared = Boolean(ctx);

  const loadData = () => {
    if (useShared) {
      ctx!.reload();
      return;
    }
    setLocalLoading(true);
    setFetchError(false);
    fetch('/api/tienda/experiencias-home')
      .then((r) => {
        if (!r.ok) throw new Error('fetch failed');
        return r.json();
      })
      .then((json) => setLocalData(json.packs_tarjetas_premium ?? null))
      .catch(() => {
        setLocalData(null);
        setFetchError(true);
      })
      .finally(() => setLocalLoading(false));
  };

  useEffect(() => {
    if (!useShared) {
      loadData();
    }
  }, [useShared]);

  const loading = useShared ? ctx!.loading : localLoading;
  const data = useShared ? ctx!.data?.packs_tarjetas_premium ?? null : localData;
  const error = useShared ? ctx!.error : fetchError;

  const tarjetasBase = coleccionOnly
    ? (data?.tarjetas ?? []).filter((t) => t.coleccion === coleccionOnly)
    : (data?.tarjetas ?? []);

  if (loading || error || !tarjetasBase.length) {
    return (
      <ExperienceSectionFallback
        loading={loading}
        error={error}
        empty={!loading && !error && !tarjetasBase.length}
        emptyMessage={
          coleccionOnly
            ? 'Los packs Cocina de la casa se publicarán pronto.'
            : 'Los packs premium se publicarán pronto.'
        }
        onRetry={loadData}
      />
    );
  }

  const tarjetasFiltradas = tarjetasBase.filter((t) => matchesOcasion(t.ocasion, ocasionFilter));

  if (!isHome && ocasionFilter !== 'todos' && tarjetasFiltradas.length === 0) {
    return null;
  }

  const tarjetas = isHome ? tarjetasBase : tarjetasFiltradas;

  if (coleccionOnly === 'cocina_casa_facebook') {
    const cfg = data?.cocina_casa_facebook;
    const packs = tarjetas;
    return (
      <section id="coleccion-cocina-casa-facebook" className="scroll-mt-24 mb-8">
        <ColeccionPacksSection
          id="cocina-casa-packs"
          cfg={cfg}
          packs={packs}
          isHome={false}
          badgeClass="bg-gradient-to-r from-emerald-900 to-green-950 text-emerald-100 ring-emerald-400/30"
          BadgeIcon={Flame}
        />
      </section>
    );
  }

  const diaPadrePacks = tarjetas.filter((t) => t.coleccion === 'dia_padre');
  const diaPadreComidaPacks = tarjetas.filter((t) => t.coleccion === 'dia_padre_comida');
  const cocinaCasaPacks = tarjetas.filter((t) => t.coleccion === 'cocina_casa_facebook');
  const coleccionesEspeciales = new Set(['dia_padre', 'dia_padre_comida', 'cocina_casa_facebook']);
  const spotlight =
    diaPadrePacks.find((t) => t.spotlight) ??
    tarjetas.find((t) => t.spotlight && !coleccionesEspeciales.has(t.coleccion ?? '')) ??
    diaPadrePacks[0];
  const grid = tarjetas.filter(
    (t) =>
      t.nombre !== spotlight?.nombre &&
      !coleccionesEspeciales.has(t.coleccion ?? ''),
  );
  const diaPadre = data.dia_padre;
  const diaPadreComida = data.dia_padre_comida;
  const cocinaCasaFacebook = data.cocina_casa_facebook;
  const showDiaPadreGrid = Boolean(diaPadre?.activo && diaPadrePacks.length > 0);

  return (
    <section
      id="packs-premium"
      className={`scroll-mt-24 ${isHome ? 'mx-auto mb-6 max-w-7xl px-3 sm:px-4' : 'mb-8'}`}
    >
      <div className={`mb-5 ${isHome ? '' : 'premium-section-head'}`}>
        {diaPadre?.activo && ocasionFilter === 'todos' && (
          <span className="mb-2 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-slate-800 to-blue-900 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-amber-200 ring-1 ring-amber-400/30">
            <CalendarHeart className="h-3.5 w-3.5" />
            {diaPadre.fecha_label ?? 'Día del Padre'}
          </span>
        )}
        <h2 className={`font-display font-extrabold text-brand-ink ${isHome ? 'text-2xl sm:text-3xl' : 'premium-heading'}`}>
          {ocasionFilter !== 'todos' ? 'Packs para esta ocasión' : diaPadre?.headline ?? data.title ?? 'Packs regalo premium'}
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-brand-muted">
          {diaPadre?.subheadline ?? data.tagline}
        </p>
        {isHome && (
          <Link
            href="/regalos"
            className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-rose-700 hover:underline"
          >
            Ver todos los regalos
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {showDiaPadreGrid && ocasionFilter === 'todos' ? (
        <>
          {!isHome && diaPadrePacks.find((p) => p.spotlight) && (
            <div className="mb-6">
              <PackPremiumCard pack={diaPadrePacks.find((p) => p.spotlight)!} variant="spotlight" />
            </div>
          )}
          <div className={`mb-6 grid gap-4 ${isHome ? 'md:grid-cols-3' : 'lg:grid-cols-3'}`}>
            {diaPadrePacks.map((pack) => (
              <PackPremiumCard key={pack.nombre} pack={pack} variant="card" compact />
            ))}
          </div>
        </>
      ) : (
        spotlight && (
          <div className="mb-6">
            <PackPremiumCard pack={spotlight} variant="spotlight" />
          </div>
        )
      )}

      {ocasionFilter === 'todos' && (
        <ColeccionPacksSection
          id="coleccion-dia-padre-comida"
          cfg={diaPadreComida}
          packs={diaPadreComidaPacks}
          isHome={isHome}
          badgeClass="bg-gradient-to-r from-red-900 to-orange-950 text-amber-100 ring-orange-400/30"
          BadgeIcon={UtensilsCrossed}
        />
      )}

      {ocasionFilter === 'todos' && (
        <ColeccionPacksSection
          id="coleccion-cocina-casa-facebook"
          cfg={cocinaCasaFacebook}
          packs={cocinaCasaPacks}
          isHome={isHome}
          badgeClass="bg-gradient-to-r from-emerald-900 to-green-950 text-emerald-100 ring-emerald-400/30"
          BadgeIcon={Flame}
        />
      )}

      {!isHome && grid.length > 0 && (
        <>
          {ocasionFilter === 'todos' && (
            <div className="mb-4 mt-10 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-rose-500" />
              <h3 className="text-sm font-bold text-brand-ink">Más packs con contenido visible</h3>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {grid.map((pack) => (
              <PackPremiumCard key={pack.nombre} pack={pack} variant="card" />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
