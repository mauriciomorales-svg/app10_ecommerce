import type { CartItem } from '../context/CartContext';

export type PackComponente = {
  nombre: string;
  cantidad_incluida?: number;
};

export function formatComponenteLine(c: PackComponente): string {
  const qty = c.cantidad_incluida ?? 1;
  return qty > 1 ? `${c.nombre} (×${qty})` : c.nombre;
}

export function linesFromComponentes(componentes?: PackComponente[] | null): string[] {
  if (!componentes?.length) return [];
  return componentes.map(formatComponenteLine);
}

export function linesFromBundleModifiers(
  modifiers?: { name?: string; nombre?: string }[] | null,
): string[] {
  if (!modifiers?.length) return [];
  return modifiers
    .map((m) => (m.name || m.nombre || '').trim())
    .filter(Boolean);
}

/** Contenido visible de una línea de carrito (pack cerrado o personalizado). */
export function resolveCartLineIncludes(item: CartItem): string[] {
  if (item.pack_includes?.length) {
    return item.pack_includes;
  }

  const fromModifiers = linesFromBundleModifiers(
    item.bundle_configuration?.modifiers as { name?: string; nombre?: string }[] | undefined,
  );
  const fromSuggestions =
    item.bundle_configuration?.suggestions?.map((s) => s.nombre).filter(Boolean) ?? [];

  const merged = [...fromModifiers, ...fromSuggestions];
  return merged.length ? Array.from(new Set(merged)) : [];
}

export function buildAddToCartToastCopy(nombre: string, includes: string[]): {
  message: string;
  detail?: string;
  includes?: string[];
} {
  if (includes.length === 0) {
    return { message: `Agregado: ${nombre}` };
  }

  return {
    message: 'Pack agregado al carrito',
    detail: nombre,
    includes,
  };
}

export function buildPackIncludesForBuilder(input: {
  componentes?: PackComponente[] | null;
  radioSelections: Record<string, { nombre: string }>;
  checkboxSelections: Record<string, { nombre: string }[]>;
  selectedSuggestionIds: number[];
  suggestions: { idproducto: number; nombre: string }[];
}): string[] {
  const lines = [
    ...linesFromComponentes(input.componentes),
    ...Object.values(input.radioSelections).map((s) => s.nombre),
    ...Object.values(input.checkboxSelections)
      .flat()
      .map((s) => s.nombre),
    ...input.selectedSuggestionIds
      .map((id) => input.suggestions.find((s) => s.idproducto === id)?.nombre)
      .filter((name): name is string => Boolean(name)),
  ];

  return Array.from(new Set(lines.map((l) => l.trim()).filter(Boolean)));
}
