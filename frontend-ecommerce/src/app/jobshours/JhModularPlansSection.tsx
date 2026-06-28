'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Boxes,
  Layers,
  MessageCircle,
  Package,
  ScanLine,
  ShoppingBag,
  Sparkles,
  Store,
} from 'lucide-react';
import {
  COMPARE_ROWS,
  formatSetupRange,
  formatUfRange,
  MODULAR_ADDONS,
  MODULAR_PACKS,
  MODULAR_SUBLINE,
  MODULAR_TAGLINE,
  MODULES,
  MIGRATION_STEPS,
  NUCLEO,
  waModularPackLink,
  WA_MODULAR_GENERAL,
  type ModularPack,
  type ModuleId,
} from './jh-modular-plans';
import { L, MARCA } from './jh-data';

const MODULE_ICONS: Record<ModuleId, typeof Package> = {
  M1: Package,
  M2: MessageCircle,
  M3: ScanLine,
  M4: Store,
  M5: ShoppingBag,
};

function CheckCell({ value }: { value: boolean | string }) {
  if (value === true) return <span className="jh-check-yes">✓</span>;
  if (value === false) return <span className="jh-check-no">—</span>;
  return <span className="text-xs font-semibold text-[var(--jh-muted)]">{value}</span>;
}

function PackCard({ pack }: { pack: ModularPack }) {
  return (
    <article
      className={`flex flex-col rounded-2xl border-2 bg-white p-5 shadow-sm transition hover:shadow-md ${
        pack.highlight
          ? 'border-[var(--jh-green)] ring-2 ring-[var(--jh-green)]/20'
          : 'border-slate-200'
      }`}
    >
      <span
        className={`inline-flex w-fit rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
          pack.highlight
            ? 'bg-[var(--jh-green)] text-white'
            : 'bg-slate-100 text-[var(--jh-muted-strong)]'
        }`}
      >
        {pack.badge}
      </span>
      <h3 className="mt-3 font-display text-lg font-extrabold text-[var(--jh-ink)]">{pack.title}</h3>
      <p className="mt-1 text-sm font-semibold text-[var(--jh-green-dark)]">{pack.tagline}</p>
      <p className="mt-2 flex-1 text-xs leading-relaxed text-[var(--jh-muted-strong)]">{pack.forWho}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {pack.modules.map((id) => (
          <span
            key={id}
            className="rounded-md border border-slate-200 bg-[var(--jh-surface-alt)] px-2 py-0.5 text-[10px] font-bold text-[var(--jh-ink)]"
          >
            {id}
          </span>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-slate-100 bg-[var(--jh-surface-alt)] px-3 py-3">
        <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--jh-muted)]">Setup (una vez)</p>
        <p className="mt-0.5 font-display text-base font-extrabold text-[var(--jh-ink)]">
          {formatSetupRange(pack.price)}
        </p>
        <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-[var(--jh-muted)]">Mensual</p>
        <p className="mt-0.5 text-sm font-bold text-[var(--jh-green-dark)]">{formatUfRange(pack.price)}</p>
        <p className="mt-2 text-[10px] font-medium text-[var(--jh-muted)]">{pack.trial}</p>
      </div>

      <ul className="mt-3 space-y-1 text-[11px] font-medium text-[var(--jh-muted-strong)]">
        <li>· {pack.limits.sku}</li>
        <li>· {pack.limits.users}</li>
        <li>· {pack.limits.support}</li>
      </ul>

      <a
        href={waModularPackLink(pack)}
        target="_blank"
        rel="noopener noreferrer"
        className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${
          pack.highlight
            ? 'jh-btn-primary'
            : 'border-2 border-[var(--jh-green)] bg-white text-[var(--jh-green-dark)] hover:bg-[var(--jh-green-soft)]'
        }`}
      >
        <MessageCircle className="h-4 w-4 shrink-0" />
        Cotizar {pack.title}
      </a>
    </article>
  );
}

export type JhModularPlansVariant = 'full' | 'teaser';

export function JhModularPlansSection({ variant = 'full' }: { variant?: JhModularPlansVariant }) {
  if (variant === 'teaser') {
    return (
      <section className="border-t border-slate-200/80 bg-gradient-to-b from-violet-50/80 to-white px-4 py-14">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-violet-700">
                <Layers className="h-3.5 w-3.5" />
                Ecosistema completo
              </span>
              <h2 className="mt-4 font-display text-2xl font-extrabold text-[var(--jh-ink)] md:text-3xl">
                {MODULAR_TAGLINE}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--jh-muted-strong)]">{MODULAR_SUBLINE}</p>
              <p className="mt-3 text-xs font-semibold text-[var(--jh-muted)]">
                Bot WhatsApp · POS · tienda web · mismo catálogo. Precios por pack, add-ons si ya tienes un módulo.
              </p>
              <Link
                href="/catalogo#modular"
                className="jh-btn-primary mt-6 inline-flex w-fit !bg-violet-700 hover:!bg-violet-800"
              >
                Ver packs y tabla comparativa
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {MODULAR_PACKS.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <p className="text-[10px] font-bold uppercase text-[var(--jh-muted)]">{p.badge}</p>
                  <p className="mt-1 font-display text-sm font-extrabold text-[var(--jh-ink)]">{p.title}</p>
                  <p className="mt-2 text-[11px] font-bold text-[var(--jh-green-dark)]">
                    {formatUfRange(p.price)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="modular"
      className="scroll-mt-24 border-y border-slate-200 bg-gradient-to-b from-violet-50/60 via-white to-[var(--jh-surface-alt)] px-4 py-14 md:py-16"
    >
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-violet-700 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Donde Morales Tech · {MARCA.madre}
          </span>
          <h2 className="jh-section-title mt-4">{MODULAR_TAGLINE}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm font-medium leading-relaxed text-[var(--jh-muted-strong)]">
            {MODULAR_SUBLINE}
          </p>
          <p className="mx-auto mt-2 max-w-xl text-xs text-[var(--jh-muted)]">
            Los módulos ya existen en código; lo que cambia por plan es implementación, límites de SKU, usuarios y
            soporte — no te vendemos funciones “apagadas”.
          </p>
        </div>

        {/* Núcleo */}
        <div className="mx-auto mt-10 max-w-3xl rounded-2xl border-2 border-dashed border-[var(--jh-green)] bg-[var(--jh-green-soft)]/50 p-5 md:p-6">
          <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
              <Boxes className="h-6 w-6 text-[var(--jh-green-dark)]" strokeWidth={2} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--jh-green-dark)]">Siempre incluido</p>
              <h3 className="font-display text-lg font-extrabold text-[var(--jh-ink)]">{NUCLEO.title}</h3>
              <p className="mt-1 text-sm text-[var(--jh-muted-strong)]">{NUCLEO.line}</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {NUCLEO.modules.map((id) => {
              const mod = MODULES[id];
              const Icon = MODULE_ICONS[id];
              return (
                <div key={id} className="flex gap-3 rounded-xl border border-white/80 bg-white/90 p-3 shadow-sm">
                  <Icon className="h-5 w-5 shrink-0 text-[var(--jh-green-dark)]" strokeWidth={2} />
                  <div>
                    <p className="text-xs font-extrabold text-[var(--jh-ink)]">
                      {mod.short} · {mod.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[var(--jh-muted)]">{mod.line}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Packs */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {MODULAR_PACKS.map((pack) => (
            <PackCard key={pack.id} pack={pack} />
          ))}
        </div>

        {/* Comparativa */}
        <div className="mt-14">
          <h3 className="text-center font-display text-xl font-extrabold text-[var(--jh-ink)]">
            Comparativa rápida
          </h3>
          <p className="mx-auto mt-2 max-w-lg text-center text-xs text-[var(--jh-muted)]">
            Precios referenciales · cotización final según SKU, usuarios y alcance de {L.instalacion}.
          </p>
          <div className="jh-compare-wrap mt-6">
            <table className="jh-compare-table">
              <thead>
                <tr>
                  <th>Módulo / servicio</th>
                  {MODULAR_PACKS.map((p) => (
                    <th key={p.id} className={p.highlight ? 'col-highlight' : undefined}>
                      {p.title.replace(' ', '\u00a0')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((row) => (
                  <tr key={row.label}>
                    <td>{row.label}</td>
                    {MODULAR_PACKS.map((p) => (
                      <td key={p.id} className={p.highlight ? 'col-highlight' : undefined}>
                        <CheckCell value={row.keys[p.id]} />
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td className="font-bold">Setup referencial</td>
                  {MODULAR_PACKS.map((p) => (
                    <td key={p.id} className={p.highlight ? 'col-highlight' : undefined}>
                      <span className="text-xs font-bold text-[var(--jh-ink)]">{formatSetupRange(p.price)}</span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="font-bold">Mensual referencial</td>
                  {MODULAR_PACKS.map((p) => (
                    <td key={p.id} className={p.highlight ? 'col-highlight' : undefined}>
                      <span className="text-xs font-bold text-[var(--jh-green-dark)]">{formatUfRange(p.price)}</span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Add-ons */}
        <div className="mt-14 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <h3 className="font-display text-lg font-extrabold text-[var(--jh-ink)]">Add-ons modulares</h3>
          <p className="mt-2 text-sm text-[var(--jh-muted-strong)]">
            ¿Ya tienes un pack y quieres sumar bot, caja o web? Contratas solo el módulo que falta — sin cambiar de
            proveedor.
          </p>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wide text-[var(--jh-muted)]">
                  <th className="pb-3 pr-4">Add-on</th>
                  <th className="pb-3 pr-4">Setup</th>
                  <th className="pb-3 pr-4">Mensual</th>
                  <th className="pb-3">Ideal si tienes</th>
                </tr>
              </thead>
              <tbody>
                {MODULAR_ADDONS.map((a) => (
                  <tr key={a.module} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 pr-4">
                      <span className="font-bold text-[var(--jh-ink)]">{a.module} · {a.title}</span>
                      <p className="mt-0.5 text-xs text-[var(--jh-muted)]">{a.line}</p>
                    </td>
                    <td className="py-3 pr-4 text-xs font-semibold">{a.setupHint}</td>
                    <td className="py-3 pr-4 text-xs font-semibold text-[var(--jh-green-dark)]">{a.ufHint}</td>
                    <td className="py-3 text-xs font-medium text-[var(--jh-muted-strong)]">{a.fitsWith}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Migración */}
        <div className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-8 text-center shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--jh-muted)]">Ruta de crecimiento</p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm font-bold text-[var(--jh-ink)]">
            {MIGRATION_STEPS.map((step, i) => (
              <span key={step} className="inline-flex items-center gap-2">
                {i > 0 && <ArrowRight className="h-4 w-4 text-[var(--jh-muted)]" />}
                <span className="rounded-lg bg-[var(--jh-surface-alt)] px-3 py-1.5">{step}</span>
              </span>
            ))}
          </div>
          <p className="max-w-lg text-xs text-[var(--jh-muted)]">
            Upgrade con fee de migración acordado · datos se mantienen en la misma BD · downgrade al renovar contrato.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <a href={WA_MODULAR_GENERAL} target="_blank" rel="noopener noreferrer" className="jh-btn-primary">
              <MessageCircle className="h-4 w-4" />
              Agendar demo modular
            </a>
            <Link href="/comida" className="jh-btn-secondary">
              Solo comida · desde {L.packAndando}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
