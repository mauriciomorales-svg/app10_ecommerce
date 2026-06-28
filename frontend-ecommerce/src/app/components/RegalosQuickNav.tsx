'use client';

const LINKS = [
  { href: '#regalo-quiz', label: 'Quiz' },
  { href: '#packs-premium', label: 'Packs' },
  { href: '#comparar-packs', label: 'Comparar' },
  { href: '#regalos-destacados', label: 'Personalizar' },
  { href: '#regalos-catalogo-extra', label: 'Catálogo' },
];

export default function RegalosQuickNav() {
  return (
    <nav
      aria-label="Secciones regalos"
      className="premium-chip-row mb-5 overflow-x-auto pb-1"
    >
      {LINKS.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className="premium-chip premium-chip-idle shrink-0 hover:border-rose-300 hover:bg-rose-50"
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}
