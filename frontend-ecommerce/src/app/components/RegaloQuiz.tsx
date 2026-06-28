'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Gift, RotateCcw, Sparkles } from 'lucide-react';
import type { RegalosExperienciaBlock } from '../context/RegalosExperienciaContext';
import { trackCommerceEvent } from '../lib/commerceEvents';
import { trackMetaCustom } from '../lib/analytics';

type Props = {
  quiz?: RegalosExperienciaBlock['quiz'];
  onOcasionSelect?: (ocasion: string) => void;
  onPackSelect?: (packNombre: string, idproducto?: number | null) => void;
  packIds?: Map<string, number | null | undefined>;
};

function tallyOcasion(
  answers: Record<string, string>,
  preguntas: NonNullable<RegalosExperienciaBlock['quiz']>['preguntas'],
): string | null {
  const counts: Record<string, number> = {};
  for (const q of preguntas ?? []) {
    if (q.id === 'presupuesto') continue;
    const optId = answers[q.id];
    const opt = q.opciones.find((o) => o.id === optId);
    if (opt?.ocasion) {
      counts[opt.ocasion] = (counts[opt.ocasion] ?? 0) + 1;
    }
  }
  let best: string | null = null;
  let max = 0;
  for (const [k, v] of Object.entries(counts)) {
    if (v > max) {
      max = v;
      best = k;
    }
  }
  return best;
}

export default function RegaloQuiz({ quiz, onOcasionSelect, onPackSelect, packIds }: Props) {
  const preguntas = quiz?.preguntas ?? [];
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const [tracked, setTracked] = useState(false);

  const current = preguntas[step];
  const progress = preguntas.length > 0 ? ((step + (done ? 1 : 0)) / preguntas.length) * 100 : 0;

  const result = useMemo(() => {
    if (!done || preguntas.length === 0) return null;
    const presupuestoQ = preguntas.find((q) => q.id === 'presupuesto');
    const presupuestoOpt = presupuestoQ?.opciones.find((o) => o.id === answers.presupuesto);
    const packNombre = presupuestoOpt?.pack ?? null;
    const ocasion = tallyOcasion(answers, preguntas);
    const idproducto = packNombre ? packIds?.get(packNombre) : undefined;
    return { ocasion, packNombre, idproducto };
  }, [done, answers, preguntas, packIds]);

  useEffect(() => {
    if (!done || !result || tracked) return;
    setTracked(true);
    trackCommerceEvent('regalo_quiz_complete', {
      ocasion: result.ocasion,
      pack: result.packNombre,
      idproducto: result.idproducto,
    });
    trackMetaCustom('RegaloQuizComplete', {
      ocasion: result.ocasion,
      pack: result.packNombre,
    });
    if (result.ocasion && onOcasionSelect) onOcasionSelect(result.ocasion);
    requestAnimationFrame(() => {
      document.getElementById('packs-premium')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [done, result, tracked, onOcasionSelect]);

  if (preguntas.length === 0) return null;

  const pick = (optId: string) => {
    const qId = current.id;
    const next = { ...answers, [qId]: optId };
    setAnswers(next);
    trackCommerceEvent('regalo_quiz_step', { question: qId, option: optId, step: step + 1 });
    if (step < preguntas.length - 1) {
      setStep(step + 1);
    } else {
      setDone(true);
    }
  };

  const reset = () => {
    setStep(0);
    setAnswers({});
    setDone(false);
    setTracked(false);
  };

  const applyResult = () => {
    if (!result) return;
    if (result.packNombre && onPackSelect) {
      onPackSelect(result.packNombre, result.idproducto);
    }
  };

  return (
    <section id="regalo-quiz" className="mb-8 scroll-mt-24">
      <div className="overflow-hidden rounded-[1.35rem] border border-violet-200/70 bg-gradient-to-br from-violet-50/90 via-white to-rose-50/60 p-4 shadow-premium sm:p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-600/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-800">
              <Sparkles className="h-3 w-3" />
              Quiz
            </span>
            <h2 className="mt-1 font-display text-lg font-extrabold text-brand-ink">
              {quiz?.titulo ?? '¿Cuál es tu regalo Toppi\'s?'}
            </h2>
            {quiz?.subtitulo && <p className="mt-0.5 text-sm text-brand-muted">{quiz.subtitulo}</p>}
          </div>
          {!done && (
            <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-violet-600">
              {step + 1}/{preguntas.length}
            </span>
          )}
        </div>

        <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-violet-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-rose-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {!done && current && (
          <>
            <p className="mb-3 font-semibold text-brand-ink">{current.texto}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {current.opciones.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => pick(opt.id)}
                  className="rounded-xl border border-violet-100 bg-white px-4 py-3 text-left text-sm font-medium text-brand-ink transition hover:border-violet-300 hover:bg-violet-50/80 hover:shadow-sm"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </>
        )}

        {done && result && (
          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/60 p-4">
            <div className="flex items-start gap-3">
              <Gift className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div className="min-w-0 flex-1">
                <p className="font-display font-extrabold text-brand-ink">Tu recomendación</p>
                {result.packNombre && (
                  <p className="mt-1 text-sm text-brand-muted">
                    Pack sugerido:{' '}
                    <strong className="text-emerald-800">{result.packNombre}</strong>
                  </p>
                )}
                {result.ocasion && (
                  <p className="text-xs text-brand-muted">
                    Filtramos packs para:{' '}
                    <span className="font-semibold capitalize">{result.ocasion.replace(/_/g, ' ')}</span>
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  {result.idproducto ? (
                    <Link
                      href={`/producto/${result.idproducto}`}
                      onClick={applyResult}
                      className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                    >
                      Ver pack sugerido
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  ) : (
                    <a
                      href="#packs-premium"
                      className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                    >
                      Ver packs filtrados
                      <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={reset}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-brand-muted hover:bg-slate-50"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Rehacer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
