'use client';

import { ShieldCheck } from 'lucide-react';

type Props = {
  data?: {
    titulo?: string;
    items?: string[];
  };
};

export default function RegalosPruebaSocial({ data }: Props) {
  const items = data?.items ?? [];
  if (items.length === 0) return null;

  return (
    <div className="mb-6 rounded-[1.15rem] border border-emerald-200/60 bg-emerald-50/40 p-4">
      <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-emerald-900">
        <ShieldCheck className="h-4 w-4" />
        {data?.titulo ?? 'Por qué regalar aquí'}
      </p>
      <ul className="space-y-1.5 text-xs text-brand-muted">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="font-bold text-emerald-600">·</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
