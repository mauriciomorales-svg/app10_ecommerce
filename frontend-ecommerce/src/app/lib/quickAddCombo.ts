import { buildPackIncludesForBuilder, linesFromComponentes } from './packIncludes';

type BundleOption = {
  id: number;
  child_product_id: number;
  nombre: string;
  precio: number;
};

type BundleGroup = {
  group_name: string;
  input_type: string;
  is_required?: boolean;
  options: BundleOption[];
};

type PackComponente = {
  nombre: string;
  cantidad_incluida?: number;
};

export type ProductQuickAddPayload = {
  idproducto: number;
  nombre: string;
  precio_venta?: number;
  precio?: number;
  imagen_url?: string | null;
  stock?: number;
  stock_disponible?: number;
  idcategoria?: number | null;
  categorias?: { idcategoria: number }[];
  es_pack?: boolean;
  is_combo_product?: boolean;
  quick_add?: boolean;
  componentes?: PackComponente[];
  bundle_groups?: BundleGroup[];
  customization_fields?: unknown[];
};

export type QuickAddCartInput = {
  idproducto: number;
  nombre: string;
  precio_venta: number;
  imagen: string | null;
  stock: number;
  idcategoria: number | null;
  pack_includes?: string[];
  bundle_configuration?: {
    modifiers: { name: string; price: number; child_product_id: number }[];
    customization: Record<string, string>;
    suggestions: never[];
  };
};

export function canQuickAdd(product: ProductQuickAddPayload): boolean {
  if (product.quick_add === true) return true;
  if (product.quick_add === false) return false;
  if (product.customization_fields?.length) return false;
  if (product.is_combo_product) return true;
  if (product.es_pack && !product.bundle_groups?.length) return true;
  return false;
}

export function buildQuickAddCartItem(product: ProductQuickAddPayload): QuickAddCartInput {
  const radioSelections: Record<string, { nombre: string; precio: number; childProductId: number }> = {};
  let extraTotal = 0;

  for (const group of product.bundle_groups ?? []) {
    if (group.input_type !== 'radio') continue;
    const opt = group.options[0];
    if (!opt) continue;
    radioSelections[group.group_name] = {
      nombre: opt.nombre,
      precio: opt.precio,
      childProductId: opt.child_product_id,
    };
    extraTotal += opt.precio ?? 0;
  }

  const base = Number(product.precio_venta ?? product.precio ?? 0);
  const total = product.is_combo_product ? base : base + extraTotal;
  const packIncludes = buildPackIncludesForBuilder({
    componentes: product.componentes,
    radioSelections: Object.fromEntries(
      Object.entries(radioSelections).map(([k, v]) => [k, { nombre: v.nombre }]),
    ),
    checkboxSelections: {},
    selectedSuggestionIds: [],
    suggestions: [],
  });

  const includes =
    packIncludes.length > 0
      ? packIncludes
      : linesFromComponentes(product.componentes);

  const modifiers = Object.values(radioSelections).map((s) => ({
    name: s.nombre,
    price: s.precio,
    child_product_id: s.childProductId,
  }));

  return {
    idproducto: product.idproducto,
    nombre: product.nombre,
    precio_venta: total,
    imagen: product.imagen_url ?? null,
    stock: product.stock ?? product.stock_disponible ?? 99,
    idcategoria: product.idcategoria ?? product.categorias?.[0]?.idcategoria ?? null,
    pack_includes: includes.length ? includes : undefined,
    bundle_configuration:
      modifiers.length > 0
        ? { modifiers, customization: {}, suggestions: [] }
        : undefined,
  };
}
