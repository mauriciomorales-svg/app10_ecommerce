import Link from 'next/link';

interface LogoProps {
  compact?: boolean;
  className?: string;
}

export default function Logo({ compact = false, className = '' }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 shrink-0 group ${className}`}>
      <div
        className={`flex items-center justify-center rounded-xl bg-brand-primary shadow-md shadow-brand-primary/25 group-hover:bg-brand-primary-hover transition-colors ${
          compact ? 'w-9 h-9' : 'w-10 h-10'
        }`}
      >
        <span
          className={`font-display font-extrabold text-white leading-none ${
            compact ? 'text-sm' : 'text-base'
          }`}
        >
          DM
        </span>
      </div>
      <div className={compact ? 'hidden sm:block' : 'block'}>
        <span className="font-display font-extrabold text-brand-ink leading-none tracking-tight text-base sm:text-lg">
          Donde<span className="text-brand-primary">Morales</span>
        </span>
        {!compact && (
          <p className="text-[10px] text-brand-muted font-medium leading-tight mt-0.5 hidden sm:block">
            Minimarket · Renaico
          </p>
        )}
      </div>
    </Link>
  );
}
