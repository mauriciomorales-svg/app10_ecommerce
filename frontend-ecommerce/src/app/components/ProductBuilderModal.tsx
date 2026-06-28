'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { X, Package, Check, ChevronRight, Loader2, IceCream, Sparkles, Zap, Crown } from 'lucide-react';
import { formatCLP, toCLP } from '../lib/money';
import { buildPackIncludesForBuilder, linesFromComponentes } from '../lib/packIncludes';
import TarjetaSaludoPreview from './TarjetaSaludoPreview';

type HeladoKind = 'soft' | 'yogurt' | 'artesanal';

interface BundleOption {
  id: number;
  child_product_id: number;
  sku?: string;
  nombre: string;
  imagen_url: string | null;
  precio: number;
  stock_disponible: number;
}

const HELADO_ARMAR_NOMBRE = "Helado Toppi's";
const HELADO_SOFT_NOMBRE = "Soft Toppi's";
const HELADO_ARTESANAL_NOMBRE = "Artesanal Toppi's";

const HELADO_TYPE_META: Record<
  HeladoKind,
  { label: string; hint: string; extra: number; tier: string; benefit: string; icon: typeof Zap; accent: string }
> = {
  soft: {
    label: 'Helado soft',
    hint: 'Cono $1.000 · grande $1.800',
    extra: 0,
    tier: 'Entrada',
    benefit: 'Vainilla, chocolate o mixto',
    icon: Zap,
    accent: 'border-slate-200 bg-slate-50 text-slate-800',
  },
  yogurt: {
    label: 'Helado de yogurt',
    hint: 'Con fruta · desde $2.800',
    extra: 300,
    tier: 'Equilibrado',
    benefit: 'Fresco con fruta real',
    icon: Sparkles,
    accent: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  },
  artesanal: {
    label: 'Helado artesanal',
    hint: '1 bola $2.000 · 2 bolas $3.500',
    extra: 800,
    tier: 'Premium',
    benefit: 'Cremoso en bolas',
    icon: Crown,
    accent: 'border-amber-200 bg-amber-50 text-amber-900',
  },
};

function heladoDisplayTitle(nombre: string, profile: BuilderProfile): string {
  if (profile === 'helado_soft' || nombre === HELADO_SOFT_NOMBRE) return 'Helado soft';
  if (profile === 'helado_artesanal' || nombre === HELADO_ARTESANAL_NOMBRE) return 'Helado artesanal';
  if (profile === 'helado_yogen') return 'Helado de yogurt';
  if (profile === 'helado_arma' || nombre === HELADO_ARMAR_NOMBRE) return 'Arma tu helado';
  if (profile === 'helado_combo') return nombre;
  return nombre;
}

function humanizeGroupName(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('cono') || n.includes('tamaño') || n.includes('tamano')) return 'Formato';
  if (n.includes('porción') || n.includes('porcion') || n.includes('bola')) return 'Porción';
  if (n.includes('sabor') && !n.includes('salsa')) return 'Sabor';
  if (n.includes('fruta')) return 'Fruta';
  if (n.includes('salsa')) return 'Salsa';
  if (n.includes('premium') || n.includes('crocante')) return 'Extra premium';
  if (n.includes('toppi') || n.includes('extra')) return 'Extra';
  return name.replace(/^Elige tu /i, '').replace(/^Tu /i, '');
}

function heladoPhaseLabel(phase: string | null): string | null {
  if (!phase) return null;
  const map: Record<string, string> = {
    Base: 'Tipo de helado',
    Sabor: 'Sabor',
    Formato: 'Tamaño',
    Fruta: 'Fruta',
    Complementa: 'Extras',
    Extras: 'Extras',
    '¿Algo más?': '¿Algo más?',
    Resumen: 'Confirmar',
  };
  return map[phase] ?? phase;
}

function heladoKindFromOption(opt: BundleOption, typeMeta?: BuilderMeta['helado_type_meta']): HeladoKind | null {
  const sku = (opt.sku || '').toUpperCase();
  const n = opt.nombre.toLowerCase();

  if (typeMeta) {
    for (const [kind, meta] of Object.entries(typeMeta) as [HeladoKind, NonNullable<BuilderMeta['helado_type_meta']>[string]][]) {
      if (meta.sku_match && sku.includes(meta.sku_match.toUpperCase())) return kind;
      if (meta.nombre_prefix && n.startsWith(meta.nombre_prefix.toLowerCase())) return kind;
    }
  }

  if (sku.includes('TOPPI-SOFT')) return 'soft';
  if (sku.includes('TOPPI-YOG')) return 'yogurt';
  if (sku.includes('TOPPI-ART')) return 'artesanal';
  if (n.startsWith('soft ')) return 'soft';
  if (n.startsWith('yogurt ')) return 'yogurt';
  if (n.startsWith('artesanal ')) return 'artesanal';
  return null;
}

/** True si un grupo mezcla soft + yogurt + artesanal en la misma lista (sin identidad). */
function groupHasMixedHeladoBases(options: BundleOption[], typeMeta?: BuilderMeta['helado_type_meta']): boolean {
  const kinds = new Set<HeladoKind>();
  for (const opt of options) {
    const k = heladoKindFromOption(opt, typeMeta);
    if (k) kinds.add(k);
  }
  return kinds.size > 1;
}

function resolvePriceMode(
  isComboProduct: boolean,
  isHeladoExperience: boolean,
  isHeladoArmaTu: boolean,
  isRadio: boolean,
  optionPrecio: number,
): 'total' | 'extra' | 'combo' {
  if (isComboProduct) return 'combo';
  if (isHeladoExperience && !isHeladoArmaTu && isRadio && optionPrecio === 0) return 'combo';
  if (isHeladoArmaTu && isRadio) return 'extra';
  if (isRadio) return 'total';
  return 'extra';
}
function getOptionPriceLabel(
  option: BundleOption,
  priceBasis: number,
  mode: 'total' | 'extra' | 'combo'
): string {
  if (mode === 'combo' && option.precio === 0) return 'Incluido';
  if (mode === 'combo' && option.precio > 0) return `+${formatPrice(option.precio)}`;
  if (mode === 'total') return formatPrice(priceBasis + toCLP(option.precio));
  if (option.precio === 0) return 'Sin cargo extra';
  return `+${formatPrice(option.precio)}`;
}

function sortBundleGroups(groups: BundleGroup[]): BundleGroup[] {
  return [...groups].sort((a, b) => {
    const aOrder = a.sort_order ?? 50;
    const bOrder = b.sort_order ?? 50;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.group_name.localeCompare(b.group_name, 'es');
  });
}

function runningBaseForGroup(
  productBase: number,
  groupName: string,
  radioSelections: Record<string, SelectedModifier>
): number {
  let other = 0;
  for (const [gn, sel] of Object.entries(radioSelections)) {
    if (gn !== groupName) other += toCLP(sel.precio);
  }
  return productBase + other;
}

type BuilderProfile =
  | 'helado_arma'
  | 'helado_soft'
  | 'helado_artesanal'
  | 'helado_yogen'
  | 'helado_combo'
  | 'salada_base'
  | 'salada_chorrillana'
  | 'salada_wok'
  | 'salada_sandwich'
  | 'regalo'
  | 'jh_autoservicio'
  | 'generic';

function detectBuilderProfile(product: ProductDetail, isCombo: boolean): BuilderProfile {
  const n = product.nombre.toLowerCase();
  if (n === HELADO_SOFT_NOMBRE.toLowerCase()) return 'helado_soft';
  if (n === HELADO_ARTESANAL_NOMBRE.toLowerCase()) return 'helado_artesanal';
  if (n === HELADO_ARMAR_NOMBRE.toLowerCase()) return 'helado_arma';
  if (n.includes('yogen') || n.includes('helado de yogurt') || n.includes('yogurt con fruta')) return 'helado_yogen';
  if (isCombo) return 'helado_combo';
  if (product.es_pack) return 'regalo';
  if (n.includes('base salada')) return 'salada_base';
  if (n.includes('chorrillana')) return 'salada_chorrillana';
  if (n.includes('wok')) return 'salada_wok';
  if (n.includes('completo') || n.includes('churrasco')) return 'salada_sandwich';
  return 'generic';
}

function groupNameMatches(groupName: string, keys: string[]): boolean {
  const gn = groupName.toLowerCase();
  return keys.some((k) => gn.includes(k));
}

function jhPhaseLabel(groupName: string): string | null {
  const gn = groupName.toLowerCase();
  if (gn.includes('plan mensual')) return 'Software base';
  if (gn.includes('implementación')) return '¿Te instalamos?';
  if (gn.includes('complemento')) return 'Extras software';
  if (gn.includes('terminal') || gn.includes('point')) return 'Tu Point (opcional)';
  if (gn.includes('pantalla') || gn.includes('equipo')) return 'Tu pantalla (opcional)';
  return null;
}

function jhOptionSubline(option: BundleOption): string | null {
  const sku = (option.sku || '').toUpperCase();
  if (sku.includes('JH-INT-IMP-0')) return 'Mínimo viable: solo pagas el plan mensual hoy.';
  if (sku.includes('JH-INT-IMP-30')) return 'Ahorras vs. visita completa si ya tienes tablet y Point.';
  if (sku.includes('JH-INT-HW-POINT-OWN') || sku.includes('JH-INT-HW-TAB-OWN') || sku.includes('JH-INT-HW-PC')) {
    return 'Sin cargo · usas tu equipo.';
  }
  if (sku.includes('JH-INT-HW-TAB-BUY') || sku.includes('JH-INT-HW-POINT-')) {
    return 'Te enviamos guía o link · no vendemos el hardware.';
  }
  return null;
}

function resolveBuilderProfile(product: ProductDetail, isCombo: boolean): BuilderProfile {
  const fromApi = product.builder_profile;
  if (fromApi && fromApi !== 'auto') {
    return fromApi as BuilderProfile;
  }
  return detectBuilderProfile(product, isCombo);
}

function getGroupStepCopy(
  profile: BuilderProfile,
  group: BundleGroup,
  isCombo: boolean
): { title: string; hint: string } {
  if (group.step_title && group.step_hint !== undefined) {
    return { title: group.step_title, hint: group.step_hint };
  }

  const gn = group.group_name;
  const isRadio = group.input_type === 'radio';

  if (isRadio && groupNameMatches(gn, ['tu base']) && profile === 'salada_base') {
    return { title: 'Tu base', hint: 'Papas, tortilla, tallarines o arroz — precio final por opción' };
  }
  if (isRadio && groupNameMatches(gn, ['porción', 'porcion']) && profile === 'salada_base') {
    return { title: 'Tamaño', hint: 'Personal o familiar para compartir' };
  }
  if (isRadio && groupNameMatches(gn, ['tipo de chorrillana', 'tipo de chorrillana'])) {
    return { title: 'Tipo de chorrillana', hint: 'Clásica al precio base · recetas especiales con total visible' };
  }
  if (isRadio && groupNameMatches(gn, ['tu base']) && profile === 'salada_wok') {
    return { title: 'Base del bowl', hint: 'Arroz, chaufa o fideos de arroz' };
  }
  if (isRadio && groupNameMatches(gn, ['proteína', 'proteina'])) {
    return { title: 'Proteína', hint: 'Pollo, cerdo agridulce o camarón' };
  }
  if (isRadio && groupNameMatches(gn, ['salsa']) && profile === 'salada_wok') {
    return { title: 'Salsa wok', hint: 'Swicy, teriyaki o soja y ajo' };
  }
  if (isRadio && groupNameMatches(gn, ['salsa incluida', 'salsa']) && (profile === 'helado_yogen' || profile === 'helado_combo')) {
    return { title: 'Salsa dulce', hint: 'Chocolate, manjar o frutilla — incluida en tu pedido' };
  }
  if (profile === 'helado_soft') {
    if (isRadio && (groupNameMatches(gn, ['sabor soft', 'soft de la máquina', 'sabor']) && !gn.includes('cono'))) {
      return {
        title: 'Elige sabor',
        hint: 'Vainilla, chocolate o sabor mixto',
      };
    }
    if (isRadio && groupNameMatches(gn, ['cono', 'tamaño', 'tamano'])) {
      return {
        title: 'Elige tamaño',
        hint: 'Misma porción de helado · cambia solo el cono',
      };
    }
  }
  if (profile === 'helado_artesanal') {
    if (isRadio && groupNameMatches(gn, ['sabor artesanal', 'sabor'])) {
      return { title: 'Elige sabor', hint: 'Cremoso e intenso' };
    }
    if (isRadio && groupNameMatches(gn, ['porción', 'porcion', 'bola'])) {
      return { title: 'Cuántas bolas', hint: '1 bola $2.000 · 2 bolas $3.500' };
    }
  }
  if (profile === 'helado_yogen') {
    if (isRadio && groupNameMatches(gn, ['sabor yogurt', 'base yogurt', 'sabor'])) {
      return { title: 'Sabor de yogurt', hint: 'Elige tu base' };
    }
    if (isRadio && groupNameMatches(gn, ['fruta'])) {
      return { title: 'Fruta', hint: 'Incluida en tu helado' };
    }
  }
  if (profile === 'helado_combo') {
    if (isRadio && groupNameMatches(gn, ['sabor', 'fruta', 'crocante', 'topping'])) {
      const title = gn.includes('fruta')
        ? 'Fruta'
        : gn.includes('crocante') || gn.includes('topping')
          ? 'Topping'
          : 'Sabor';
      return { title, hint: 'Ya incluido en tu combo' };
    }
    if (isRadio && groupNameMatches(gn, ['salsa'])) {
      return { title: 'Salsa dulce', hint: 'Incluida — chocolate, manjar o frutilla' };
    }
  }
  if (profile === 'helado_arma' || profile === 'helado_soft' || profile === 'helado_artesanal') {
    if (isRadio && groupNameMatches(gn, ['tamaño', 'tamano'])) {
      return {
        title: 'Tamaño',
        hint: 'Copa simple incluida · puedes subir de tamaño',
      };
    }
    if (!isRadio && groupNameMatches(gn, ['salsa'])) {
      return {
        title: 'Salsas',
        hint: 'Opcional · +$300 c/u',
      };
    }
    if (!isRadio && groupNameMatches(gn, ['extra', "toppi's", 'toppi'])) {
      return {
        title: 'Extras',
        hint: 'Opcional · maní, galleta o Nutella',
      };
    }
    if (!isRadio && groupNameMatches(gn, ['fruta'])) {
      return { title: 'Fruta extra', hint: 'Opcional' };
    }
    if (!isRadio && groupNameMatches(gn, ['crocante'])) {
      return { title: 'Crocante', hint: 'Opcional' };
    }
    if (!isRadio && groupNameMatches(gn, ['premium'])) {
      return { title: 'Premium', hint: 'Opcional' };
    }
  }
  if (isRadio && groupNameMatches(gn, ['sabor yogurt', 'base yogurt'])) {
    return { title: 'Sabor', hint: 'Helado de yogurt con fruta' };
  }
  if (isRadio && groupNameMatches(gn, ['fruta'])) {
    return { title: 'Fruta real', hint: 'Elige la fruta de tu mix' };
  }
  if (isRadio && groupNameMatches(gn, ['tamaño', 'tamano'])) {
    return { title: 'Tamaño', hint: 'Copa mediana incluida en el precio base' };
  }
  if (isRadio && groupNameMatches(gn, ['crocante', 'topping ligero'])) {
    return { title: group.group_name, hint: 'Incluido en tu combo' };
  }
  if (isRadio && groupNameMatches(gn, ['elige tu bebida', 'bebida'])) {
    return { title: 'Bebida', hint: 'Café o té sin extra · jugo con precio final' };
  }
  if (isRadio && groupNameMatches(gn, ['tipo de pan'])) {
    return { title: 'Pan', hint: 'Hallulla o marraqueta — mismo precio del pack' };
  }
  if (isRadio && groupNameMatches(gn, ['elige tu dulce', 'dulce'])) {
    return { title: 'Dulce', hint: 'Mermelada incluida · manjar o Nutella con total claro' };
  }
  if (!isRadio && groupNameMatches(gn, ['extra', "toppi's", 'toppi'])) {
    return {
      title: profile === 'salada_sandwich' ? "Toppi's" : 'Extras',
      hint: 'Opcional — suma al total del pedido',
    };
  }

  if (isRadio) {
    return {
      title: group.group_name,
      hint: profile === 'helado_combo' || profile === 'helado_yogen'
        ? 'Incluido en tu pedido'
        : isCombo
          ? 'Incluido en tu combo'
          : 'Precio final con esta opción',
    };
  }
  return { title: group.group_name, hint: 'Opcional — suma al total' };
}

interface BundleGroup {
  group_name: string;
  input_type: 'radio' | 'checkbox';
  is_required: boolean;
  sort_order?: number;
  step_title?: string;
  step_hint?: string;
  options: BundleOption[];
}

interface CustomField {
  id: number;
  label: string;
  field_key: string;
  field_type: string;
  is_required: boolean;
  extra_cost: number;
  options: { values: string[] } | null;
}

interface BuilderMeta {
  display_title?: string | null;
  line_label?: string | null;
  is_regalo?: boolean;
  is_helado_builder?: boolean;
  is_helado_experience?: boolean;
  is_jobs_hours_builder?: boolean;
  helado_arma_tipo_step?: boolean;
  hide_combo_suggestions?: boolean;
  modal_subtitle?: string | null;
  customize_title?: string | null;
  add_to_cart_label?: string | null;
  default_radio?: Array<{
    group_match: string[];
    sku_contains?: string;
    nombre_contains?: string;
  }>;
  helado_type_meta?: Record<
    string,
    {
      label: string;
      hint: string;
      extra?: number;
      tier?: string;
      benefit?: string;
      sku_match?: string;
      nombre_prefix?: string;
    }
  >;
}

interface ProductDetail {
  idproducto: number;
  nombre: string;
  precio_venta: number;
  imagen_url: string | null;
  descripcion: string | null;
  es_pack: boolean;
  builder_profile?: BuilderProfile | 'auto';
  builder_profile_setting?: string;
  builder_meta?: BuilderMeta;
  is_combo_product?: boolean;
  categorias?: { idcategoria: number; nombre: string }[];
  bundle_groups?: BundleGroup[];
  customization_fields?: CustomField[];
  componentes?: { idproducto: number; nombre: string; cantidad_incluida?: number }[];
}

interface SelectedModifier {
  optionId: number;
  childProductId: number;
  nombre: string;
  precio: number;
}

interface SuggestedProduct {
  idproducto: number;
  nombre: string;
  precio_venta: number;
  imagen_url?: string;
  stock: number;
  mensaje: string;
  tipo?: string;
}

const HELADO_CUSTOM_PROFILES: BuilderProfile[] = ['helado_soft', 'helado_artesanal', 'helado_yogen', 'helado_arma'];

function formatPrice(price: number | unknown) {
  const n = toCLP(price);
  if (!n) return '$0';
  return '$' + formatCLP(n);
}

export default function ProductBuilderModal({
  productId,
  onClose,
  onAddToCart,
}: {
  productId: number;
  onClose: () => void;
  onAddToCart: (item: {
    idproducto: number;
    nombre: string;
    precio_venta: number;
    imagen: string | null;
    idcategoria?: number | null;
    pack_includes?: string[];
    bundle_configuration: {
      modifiers?: object[];
      customization?: object;
      suggestions?: SuggestedProduct[];
    };
  }) => void;
}) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [step, setStep] = useState(0); // 0 = bundle groups, last = customization, last+1 = summary

  // Selections
  const [radioSelections, setRadioSelections] = useState<Record<string, SelectedModifier>>({});
  const [checkboxSelections, setCheckboxSelections] = useState<Record<string, SelectedModifier[]>>({});
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [suggestions, setSuggestions] = useState<SuggestedProduct[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<number[]>([]);
  const [heladoTipo, setHeladoTipo] = useState<HeladoKind | null>(null);
  const [heladoSubPaso, setHeladoSubPaso] = useState<'tipo' | 'sabor'>('tipo');

  const fetchProduct = useCallback(async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const [productRes, suggestionsRes] = await Promise.all([
        fetch(`/api/productos/${productId}`),
        fetch(`/api/productos/${productId}/sugerencias`),
      ]);
      if (!productRes.ok) throw new Error('Error');
      const productData = await productRes.json();
      const suggestionsData = suggestionsRes.ok ? await suggestionsRes.json() : [];
      setProduct(productData);
      setSuggestions(suggestionsData);
    } catch (e) {
      console.error('Error fetching product:', e);
      setProduct(null);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  useEffect(() => {
    document.body.setAttribute('data-builder-open', 'true');
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.removeAttribute('data-builder-open');
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const bundleGroups = product?.bundle_groups || [];
  const customFields = product?.customization_fields || [];
  const builderMeta = product?.builder_meta;

  const heladoTypeMeta = useMemo(() => {
    const fromApi = builderMeta?.helado_type_meta;
    if (fromApi && Object.keys(fromApi).length > 0) {
      return fromApi as Record<HeladoKind, (typeof HELADO_TYPE_META)[HeladoKind]>;
    }
    return HELADO_TYPE_META;
  }, [builderMeta?.helado_type_meta]);

  const isHeladoArmaTu =
    Boolean(builderMeta?.helado_arma_tipo_step) ||
    product?.builder_profile === 'helado_arma' ||
    product?.nombre === HELADO_ARMAR_NOMBRE;
  const heladoFlavorGroup = useMemo(() => {
    if (!isHeladoArmaTu) return null;
    return (
      bundleGroups.find((g) => {
        if (g.input_type !== 'radio') return false;
        const gn = g.group_name.toLowerCase();
        if (gn.includes('tu helado') || gn.includes('tipo y sabor')) return true;
        if (g.options.length >= 4 && groupHasMixedHeladoBases(g.options, builderMeta?.helado_type_meta)) return true;
        return gn.includes('tipo') || gn.includes('sabor');
      }) ?? null
    );
  }, [isHeladoArmaTu, bundleGroups, builderMeta?.helado_type_meta]);

  const isComboProduct =
    product?.is_combo_product ??
    (!isHeladoArmaTu &&
      bundleGroups.length > 0 &&
      bundleGroups.every(
        (g) => g.input_type === 'radio' && g.options.length === 1
      ));

  const isRegaloPack = Boolean(product?.es_pack) && bundleGroups.length > 0;

  const builderProfile = useMemo(
    () => (product ? resolveBuilderProfile(product, isComboProduct) : 'generic'),
    [product, isComboProduct]
  );

  const isRegaloBuilder = builderMeta?.is_regalo ?? builderProfile === 'regalo';
  const fixedPackLines = useMemo(
    () => linesFromComponentes(product?.componentes),
    [product?.componentes],
  );
  const heladoLineLabel =
    builderMeta?.line_label ??
    (builderProfile === 'helado_yogen'
      ? 'Helado de yogurt'
      : builderProfile === 'helado_combo'
        ? 'Combo · todo incluido'
        : builderProfile === 'helado_soft'
          ? 'Helado soft'
          : builderProfile === 'helado_artesanal'
            ? 'Helado artesanal'
            : builderProfile === 'helado_arma'
              ? 'Arma tu helado'
              : null);

  const isHeladoBuilder =
    builderMeta?.is_helado_builder ??
    (HELADO_CUSTOM_PROFILES.includes(builderProfile) || builderProfile === 'helado_combo');

  const isHeladoExperience =
    builderMeta?.is_helado_experience ??
    (() => {
      if (!product) return false;
      const cats = product.categorias?.map((c) => c.nombre.toLowerCase()) ?? [];
      if (cats.some((c) => c.includes('helado') || c.includes('toppi'))) return true;
      const n = product.nombre.toLowerCase();
      return /(yogen|combo|mix|bomba|crunch|berry|galleta|antojo|supreme|fit fresh)/.test(n);
    })();

  const isJobsHoursBuilder =
    builderMeta?.is_jobs_hours_builder ?? builderProfile === 'jh_autoservicio';

  const jhSavingsTip = useMemo(() => {
    if (!isJobsHoursBuilder) return null;
    const impl = Object.entries(radioSelections).find(([gn]) => gn.toLowerCase().includes('implementación'));
    const implSku = impl?.[1] ? bundleGroups
      .flatMap((g) => g.options)
      .find((o) => o.id === impl[1].optionId)?.sku ?? '' : '';
    const hasOwnPoint = Object.values(radioSelections).some((s) =>
      /ya tengo point|uso mi tablet|uso mi pc/i.test(s.nombre),
    );
    const implIsFull = implSku.includes('IMP-80') || implSku.includes('IMP-100');
    if (hasOwnPoint && implIsFull) {
      return 'Tip: si ya tienes tablet y Point, en el paso 2 puedes elegir «Solo activación software» por $30.000 y ahorrar.';
    }
    return null;
  }, [isJobsHoursBuilder, radioSelections, bundleGroups]);

  const displaySuggestions = useMemo(() => {
    if (builderMeta?.hide_combo_suggestions) {
      return [];
    }
    if (isHeladoExperience && builderProfile === 'helado_combo') {
      return [];
    }
    const isHeladoCustom = HELADO_CUSTOM_PROFILES.includes(builderProfile);
    return suggestions
      .filter((s) => {
        if (toCLP(s.precio_venta) <= 0) return false;
        if (s.tipo === 'popular') return false;
        if (isHeladoCustom) {
          return ['topping_minimarket', 'complemento', 'sugerencia'].includes(s.tipo ?? '');
        }
        return true;
      })
      .slice(0, 4);
  }, [suggestions, isHeladoExperience, builderProfile, builderMeta?.hide_combo_suggestions]);

  const visibleBundleGroups = useMemo(() => {
    let groups = bundleGroups;
    if (isHeladoArmaTu && heladoFlavorGroup) {
      groups = groups.filter((g) => g.group_name !== heladoFlavorGroup.group_name);
    }
    groups = groups.filter(
      (g) => !(g.input_type === 'radio' && g.options.length === 1)
    );
    return sortBundleGroups(groups);
  }, [bundleGroups, isHeladoArmaTu, heladoFlavorGroup]);

  const isClosedRegaloPack =
    isRegaloBuilder && fixedPackLines.length > 0 && visibleBundleGroups.length === 0;

  const stepPlan = useMemo(() => {
    const items: Array<'helado-base' | BundleGroup> = [];
    if (isHeladoArmaTu && heladoFlavorGroup) items.push('helado-base');
    for (const g of visibleBundleGroups) items.push(g);
    return items;
  }, [isHeladoArmaTu, heladoFlavorGroup, visibleBundleGroups]);

  const totalSteps =
    stepPlan.length +
    (customFields.length > 0 ? 1 : 0) +
    (displaySuggestions.length > 0 ? 1 : 0) +
    1;

  const heladoFunnelPhase = useMemo(() => {
    const customProfiles: BuilderProfile[] = ['helado_arma', 'helado_soft', 'helado_artesanal', 'helado_yogen'];
    if (!customProfiles.includes(builderProfile)) return null;

    if (step >= totalSteps - 1) return 'Resumen';

    const suggestionsStepIdx =
      stepPlan.length + (customFields.length > 0 ? 1 : 0);
    if (displaySuggestions.length > 0 && step === suggestionsStepIdx) {
      return '¿Algo más?';
    }

    const item = step < stepPlan.length ? stepPlan[step] : null;
    if (item === 'helado-base') return heladoSubPaso === 'tipo' ? 'Base' : 'Sabor';

    if (item && typeof item !== 'string') {
      const gn = item.group_name.toLowerCase();
      if (gn.includes('máquina') || gn.includes('maquina') || (gn.includes('sabor') && !gn.includes('salsa'))) {
        return 'Base';
      }
      if (gn.includes('cono') || gn.includes('porción') || gn.includes('porcion') || gn.includes('bola') || gn.includes('tamaño') || gn.includes('tamano')) {
        return 'Formato';
      }
      if (gn.includes('fruta')) return 'Fruta';
      if (gn.includes('salsa')) return 'Complementa';
      if (gn.includes('extra') || gn.includes('toppi') || gn.includes('crocante') || gn.includes('premium')) {
        return 'Complementa';
      }
      return 'Extras';
    }

    return null;
  }, [builderProfile, step, stepPlan, heladoSubPaso, totalSteps, customFields.length, displaySuggestions.length]);

  useEffect(() => {
    if (!product) return;
    const auto: Record<string, SelectedModifier> = {};
    for (const group of bundleGroups) {
      if (group.input_type === 'radio' && group.options.length === 1) {
        const o = group.options[0];
        auto[group.group_name] = {
          optionId: o.id,
          childProductId: o.child_product_id,
          nombre: o.nombre,
          precio: o.precio,
        };
      }
      if (product && group.input_type === 'radio' && group.options.length > 1) {
        const gn = group.group_name.toLowerCase();
        const defaultRules = builderMeta?.default_radio ?? [];
        for (const rule of defaultRules) {
          const groupMatches = rule.group_match.some((m) => gn.includes(m.toLowerCase()));
          if (!groupMatches) continue;
          const o = group.options.find((opt) => {
            const sku = (opt.sku || '').toUpperCase();
            const nombre = opt.nombre.toLowerCase();
            if (rule.sku_contains && sku.includes(rule.sku_contains.toUpperCase())) return true;
            if (rule.nombre_contains && nombre.includes(rule.nombre_contains.toLowerCase())) return true;
            return false;
          });
          if (o) {
            auto[group.group_name] = {
              optionId: o.id,
              childProductId: o.child_product_id,
              nombre: o.nombre,
              precio: o.precio,
            };
            break;
          }
        }
        // Compatibilidad si la API aún no envía default_radio
        if (!auto[group.group_name] && product.nombre === HELADO_SOFT_NOMBRE && (gn.includes('cono') || gn.includes('tamaño') || gn.includes('tamano'))) {
          const o = group.options.find(
            (opt) => (opt.sku || '').includes('CONO-1') || opt.nombre.includes('$1.000')
          );
          if (o) {
            auto[group.group_name] = {
              optionId: o.id,
              childProductId: o.child_product_id,
              nombre: o.nombre,
              precio: o.precio,
            };
          }
        }
        if (!auto[group.group_name] && product.nombre === HELADO_ARTESANAL_NOMBRE && (gn.includes('porción') || gn.includes('porcion') || gn.includes('bola'))) {
          const o = group.options.find(
            (opt) => (opt.sku || '').includes('BOLA-1') || opt.nombre.toLowerCase().includes('1 bola')
          );
          if (o) {
            auto[group.group_name] = {
              optionId: o.id,
              childProductId: o.child_product_id,
              nombre: o.nombre,
              precio: o.precio,
            };
          }
        }
      }
    }
    if (Object.keys(auto).length > 0) {
      setRadioSelections((prev) => ({ ...auto, ...prev }));
    }
    setHeladoTipo(null);
    setHeladoSubPaso('tipo');
  }, [product, bundleGroups, builderMeta?.default_radio]);

  const heladoSaboresPorTipo = useMemo(() => {
    if (!heladoFlavorGroup) {
      return { soft: [], yogurt: [], artesanal: [] as BundleOption[] };
    }
    const buckets: Record<HeladoKind, BundleOption[]> = {
      soft: [],
      yogurt: [],
      artesanal: [],
    };
    for (const opt of heladoFlavorGroup.options) {
      const kind = heladoKindFromOption(opt, builderMeta?.helado_type_meta);
      if (kind) buckets[kind].push(opt);
    }
    return buckets;
  }, [heladoFlavorGroup, builderMeta?.helado_type_meta]);

  const basePrice = toCLP(product?.precio_venta);

  const radioExtraTotal = useMemo(
    () => Object.values(radioSelections).reduce((sum, s) => sum + toCLP(s.precio), 0),
    [radioSelections]
  );

  const checkboxExtraTotal = useMemo(
    () => Object.values(checkboxSelections).flat().reduce((sum, s) => sum + toCLP(s.precio), 0),
    [checkboxSelections]
  );

  const checkboxExtraCount = useMemo(
    () => Object.values(checkboxSelections).flat().length,
    [checkboxSelections]
  );

  /** Base del producto + opciones radio (cono, porción, sabor incluido en precio). */
  const packagePrice = basePrice + radioExtraTotal;

  const suggestionsTotal = useMemo(
    () =>
      displaySuggestions
        .filter((s) => selectedSuggestions.includes(s.idproducto))
        .reduce((sum, s) => sum + toCLP(s.precio_venta), 0),
    [displaySuggestions, selectedSuggestions]
  );

  const customizationExtraTotal = useMemo(
    () =>
      customFields.reduce((sum, field) => {
        const value = customValues[field.field_key]?.trim();
        if (!value) return sum;
        return sum + toCLP(field.extra_cost);
      }, 0),
    [customFields, customValues]
  );

  /** Total visible en todo momento (extras checkbox + sugerencias + campos incluidos). */
  const displayTotal = packagePrice + checkboxExtraTotal + suggestionsTotal + customizationExtraTotal;

  const formatSummaryItemPrice = (precio: number) => {
    if (toCLP(precio) === 0) {
      return { label: 'Incluido', className: 'text-emerald-600' };
    }
    return { label: `+${formatPrice(precio)}`, className: 'text-brand-primary' };
  };

  const heladoSummaryTitle = useMemo(() => {
    const parts: string[] = [heladoDisplayTitle(product?.nombre ?? 'Tu pedido', builderProfile)];
    const cono = Object.entries(radioSelections).find(([gn]) =>
      /cono|tamaño|tamano|porción|porcion|bola/i.test(gn)
    );
    const sabor = Object.entries(radioSelections).find(([gn]) =>
      /sabor|máquina|maquina|soft de/i.test(gn)
    );
    if (sabor) parts.push(sabor[1].nombre);
    if (cono) parts.push(cono[1].nombre);
    return parts.join(' · ');
  }, [product?.nombre, builderProfile, radioSelections]);

  const isCurrentStepValid = () => {
    if (step < stepPlan.length) {
      const item = stepPlan[step];
      if (item === 'helado-base') {
        if (heladoSubPaso === 'tipo') return heladoTipo !== null;
        return heladoFlavorGroup
          ? !!radioSelections[heladoFlavorGroup.group_name]
          : false;
      }
      const group = item as BundleGroup;
      if (group.is_required && group.input_type === 'radio') {
        return !!radioSelections[group.group_name];
      }
      if (group.is_required && group.input_type === 'checkbox') {
        return (checkboxSelections[group.group_name] || []).length > 0;
      }
      return true;
    }
    if (step === stepPlan.length && customFields.length > 0) {
      return customFields.filter((f) => f.is_required).every((f) => customValues[f.field_key]?.trim());
    }
    return true;
  };

  const allRequiredValid = () => {
    for (const group of bundleGroups) {
      if (group.is_required && group.input_type === 'radio' && !radioSelections[group.group_name]) {
        return false;
      }
      if (group.is_required && group.input_type === 'checkbox' && (checkboxSelections[group.group_name] || []).length === 0) {
        return false;
      }
    }
    for (const field of customFields) {
      if (field.is_required && !customValues[field.field_key]?.trim()) {
        return false;
      }
    }
    return true;
  };

  const handleRadioSelect = (groupName: string, option: BundleOption) => {
    setRadioSelections(prev => ({
      ...prev,
      [groupName]: {
        optionId: option.id,
        childProductId: option.child_product_id,
        nombre: option.nombre,
        precio: option.precio,
      },
    }));
  };

  const handleCheckboxToggle = (groupName: string, option: BundleOption) => {
    setCheckboxSelections(prev => {
      const current = prev[groupName] || [];
      const exists = current.find(s => s.optionId === option.id);
      if (exists) {
        return { ...prev, [groupName]: current.filter(s => s.optionId !== option.id) };
      }
      return {
        ...prev,
        [groupName]: [...current, {
          optionId: option.id,
          childProductId: option.child_product_id,
          nombre: option.nombre,
          precio: option.precio,
        }],
      };
    });
  };

  const toggleSuggestion = (id: number) => {
    setSelectedSuggestions(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleAddToCart = () => {
    if (!product || !allRequiredValid()) return;

    const selectedSuggestionObjects = displaySuggestions.filter((s) =>
      selectedSuggestions.includes(s.idproducto)
    );

    const bundleConfig = {
      modifiers: [
        ...Object.values(radioSelections).map(s => ({ name: s.nombre, price: s.precio, child_product_id: s.childProductId })),
        ...Object.values(checkboxSelections).flat().map(s => ({ name: s.nombre, price: s.precio, child_product_id: s.childProductId })),
      ],
      customization: customValues,
      suggestions: selectedSuggestionObjects,
    };

    const packIncludes = buildPackIncludesForBuilder({
      componentes: product.componentes,
      radioSelections,
      checkboxSelections,
      selectedSuggestionIds: selectedSuggestions,
      suggestions: displaySuggestions,
    });

    onAddToCart({
      idproducto: product.idproducto,
      nombre: product.nombre,
      precio_venta: displayTotal,
      imagen: product.imagen_url,
      idcategoria: product.categorias?.[0]?.idcategoria ?? null,
      pack_includes: packIncludes.length ? packIncludes : undefined,
      bundle_configuration: bundleConfig,
    });
    onClose();
  };

  if (loading) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="builder-modal-title"
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={onClose}
      >
        <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg p-8 flex flex-col items-center" onClick={e => e.stopPropagation()}>
          <Loader2 className="h-10 w-10 text-brand-primary animate-spin mb-4" />
          <p id="builder-modal-title" className="text-gray-400">Cargando producto…</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="builder-error-title"
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={onClose}
      >
        <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg p-8 text-center" onClick={e => e.stopPropagation()}>
          <p id="builder-error-title" className="font-display text-lg font-bold text-brand-ink">
            {fetchError ? 'No pudimos cargar este producto' : 'Producto no disponible'}
          </p>
          <p className="mt-2 text-sm text-brand-muted">
            Revisa tu conexión o intenta de nuevo en unos segundos.
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
            {fetchError && (
              <button
                type="button"
                onClick={() => fetchProduct()}
                className="rounded-xl bg-brand-primary px-5 py-3 text-sm font-bold text-white hover:bg-brand-primary-hover"
              >
                Reintentar
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-brand-ink hover:bg-slate-50"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const headerGradient = isRegaloBuilder
    ? 'from-rose-500 to-fuchsia-700'
    : isJobsHoursBuilder
      ? 'from-emerald-600 to-teal-700'
    : isHeladoBuilder
      ? 'from-[#2d1020] via-fuchsia-900 to-brand-primary'
      : 'from-brand-primary-light to-brand-primary';
  const displayTitle =
    builderMeta?.display_title ??
    heladoDisplayTitle(product.nombre, builderProfile);
  const phaseLabel = heladoPhaseLabel(heladoFunnelPhase);
  const stepHint = builderMeta?.modal_subtitle
    ? builderMeta.modal_subtitle
    : isRegaloBuilder
      ? 'Diseña tu regalo paso a paso'
      : isHeladoBuilder && phaseLabel
        ? `${displayTitle} · ${phaseLabel}`
        : heladoLineLabel ?? undefined;

  const isSummaryStep = step === totalSteps - 1;
  const isCustomStep = customFields.length > 0 && step === stepPlan.length;
  const isSuggestionsStep =
    displaySuggestions.length > 0 &&
    step === stepPlan.length + (customFields.length > 0 ? 1 : 0);
  const currentStepItem = step < stepPlan.length ? stepPlan[step] : null;
  const currentGroup =
    currentStepItem && currentStepItem !== 'helado-base'
      ? (currentStepItem as BundleGroup)
      : null;
  const isHeladoBaseStep = currentStepItem === 'helado-base';

  const selectHeladoFlavor = (option: BundleOption) => {
    if (!heladoFlavorGroup) return;
    handleRadioSelect(heladoFlavorGroup.group_name, option);
  };

  const advanceStep = () => {
    if (isHeladoBaseStep && heladoSubPaso === 'tipo' && heladoTipo) {
      setHeladoSubPaso('sabor');
      return;
    }
    setStep((s) => s + 1);
  };

  const goBackStep = () => {
    if (isHeladoBaseStep && heladoSubPaso === 'sabor') {
      setHeladoSubPaso('tipo');
      return;
    }
    setStep((s) => Math.max(0, s - 1));
  };

  const jhCurrentPhase =
    isJobsHoursBuilder && currentGroup ? jhPhaseLabel(currentGroup.group_name) : null;

  const nextButtonLabel = (() => {
    if (isHeladoBaseStep && heladoSubPaso === 'tipo') return 'Elegir sabor';
    if (isSuggestionsStep) return 'Continuar sin extras';
    if (currentGroup && !currentGroup.is_required && currentGroup.input_type === 'checkbox') {
      return 'Continuar sin extras';
    }
    if (currentGroup && !currentGroup.is_required && currentGroup.input_type === 'radio') {
      return isJobsHoursBuilder ? 'Omitir · no aplica a mí' : 'Continuar';
    }
    return 'Continuar';
  })();

  const addToCartLabel = builderMeta?.add_to_cart_label
    ? builderMeta.add_to_cart_label
    : isHeladoBuilder
      ? `Agregar al pedido · ${formatPrice(displayTotal)}`
      : isRegaloBuilder
        ? 'Agregar regalo al pedido'
        : 'Agregar al pedido';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="builder-modal-title"
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[100dvh] sm:max-h-[90vh] h-[100dvh] sm:h-auto overflow-hidden flex flex-col animate-fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${headerGradient} p-5 flex items-center justify-between`}>
          <div className="flex items-center gap-3 min-w-0">
            {isHeladoBuilder ? (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                <IceCream className="h-5 w-5 text-toppis-mustard" />
              </span>
            ) : (
              <Package className="h-5 w-5 shrink-0 text-emerald-200" />
            )}
            <div className="min-w-0">
              <h2 id="builder-modal-title" className="font-display font-extrabold text-white text-lg leading-tight truncate">{displayTitle}</h2>
              <p className="text-white/75 text-xs mt-0.5">
                {stepHint
                  ? `${stepHint} · ${step + 1}/${totalSteps}`
                  : `Paso ${step + 1} de ${totalSteps}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="touch-target -mr-2 flex shrink-0 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-emerald-100">
          <div
            className={`h-full transition-all duration-300 ${isHeladoBuilder ? 'bg-gradient-to-r from-toppis-mustard to-brand-primary' : 'bg-brand-primary'}`}
            style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          />
        </div>
        {isHeladoBuilder && phaseLabel && !isSummaryStep && (
          <p className="border-b border-slate-100 bg-slate-50/80 px-5 py-2 text-center text-[11px] font-semibold text-brand-muted">
            Ahora: <span className="text-brand-ink">{phaseLabel}</span>
          </p>
        )}
        {isJobsHoursBuilder && jhCurrentPhase && !isSummaryStep && (
          <p className="border-b border-emerald-100 bg-emerald-50/90 px-5 py-2 text-center text-[11px] font-semibold text-emerald-800">
            Ahora: <span className="text-emerald-950">{jhCurrentPhase}</span>
            {currentGroup && !currentGroup.is_required && (
              <span className="ml-1 font-normal text-emerald-700">· puedes omitir</span>
            )}
          </p>
        )}
        {isRegaloBuilder && fixedPackLines.length > 0 && (
          <div className="border-b border-rose-100 bg-rose-50/90 px-5 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wide text-rose-800">
              Siempre incluye
            </p>
            <p className="mt-0.5 text-[11px] leading-snug text-brand-ink/90 line-clamp-3">
              {fixedPackLines.slice(0, 6).join(' · ')}
              {fixedPackLines.length > 6 ? ` · +${fixedPackLines.length - 6} más` : ''}
            </p>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Helado "arma el tuyo": tipo → sabor con precio total */}
          {isHeladoBaseStep && heladoFlavorGroup && (
            <div>
              <span className="premium-kicker mb-2 block">
                {heladoSubPaso === 'tipo' ? 'Paso 1' : 'Paso 2'}
              </span>
              <h3 className="font-display text-xl font-extrabold text-brand-ink mb-1">
                {heladoSubPaso === 'tipo' ? '¿Qué helado quieres?' : 'Elige tu sabor'}
              </h3>
              <p className="text-brand-muted text-sm mb-5">
                {heladoSubPaso === 'tipo'
                  ? 'Una opción — después eliges sabor y tamaño.'
                  : `${heladoTypeMeta[heladoTipo!].label} · sabor incluido`}
              </p>

              {heladoSubPaso === 'tipo' && (
                <div className="space-y-3">
                  {(Object.keys(heladoTypeMeta) as HeladoKind[]).map((kind) => {
                    const meta = heladoTypeMeta[kind];
                    const selected = heladoTipo === kind;
                    const totalTipo = basePrice + meta.extra;
                    const Icon = meta.icon;
                    return (
                      <button
                        key={kind}
                        type="button"
                        onClick={() => setHeladoTipo(kind)}
                        className={`w-full flex items-center gap-4 rounded-[1.25rem] border-2 p-4 text-left transition-all ${
                          selected
                            ? 'border-brand-primary bg-emerald-50/80 shadow-premium ring-1 ring-brand-primary/20'
                            : 'border-slate-100 hover:border-emerald-200 hover:bg-slate-50/80'
                        }`}
                      >
                        <span
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${meta.accent}`}
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-brand-muted">{meta.tier}</p>
                          <p className="text-sm font-bold text-brand-ink">{meta.label}</p>
                          <p className="mt-0.5 text-xs text-brand-muted">{meta.benefit}</p>
                        </div>
                        <p className="font-display text-lg font-extrabold tabular-nums text-brand-primary">
                          {formatPrice(totalTipo)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}

              {heladoSubPaso === 'sabor' && heladoTipo && (
                <div className="space-y-3">
                  {heladoSaboresPorTipo[heladoTipo].map((option) => {
                    const selected =
                      radioSelections[heladoFlavorGroup.group_name]?.optionId === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => selectHeladoFlavor(option)}
                        className={`flex w-full items-center gap-4 rounded-[1.25rem] border-2 p-4 text-left transition-all ${
                          selected
                            ? 'border-brand-primary bg-emerald-50/80 shadow-premium ring-1 ring-brand-primary/20'
                            : 'border-slate-100 hover:border-emerald-200 hover:bg-slate-50/80'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-brand-ink">{option.nombre}</p>
                          <p className="mt-0.5 text-xs text-emerald-700">Incluido</p>
                        </div>
                        <div
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                            selected ? 'border-brand-primary bg-brand-primary' : 'border-slate-300'
                          }`}
                        >
                          {selected && <Check className="h-3.5 w-3.5 text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Bundle Group Step */}
          {currentGroup && (() => {
            const stepCopy = getGroupStepCopy(builderProfile, currentGroup, isComboProduct);
            return (
            <div>
              <span className="premium-kicker mb-2 block">
                {currentGroup.is_required ? 'Obligatorio' : 'Opcional'}
              </span>
              <h3 className="font-display text-xl font-extrabold text-brand-ink mb-1">{stepCopy.title}</h3>
              <p className="text-brand-muted text-sm mb-4">
                {stepCopy.hint}
                {currentGroup.is_required && <span className="text-brand-primary ml-1">*</span>}
                {!currentGroup.is_required && currentGroup.input_type === 'checkbox' && (
                  <span className="mt-1 block text-xs text-brand-muted">
                    Puedes saltar este paso si no quieres extras
                  </span>
                )}
                {!currentGroup.is_required && currentGroup.input_type === 'radio' && isJobsHoursBuilder && (
                  <span className="mt-1 block text-xs text-emerald-700">
                    JobsHours no vende tablet ni Point. Solo registramos tu situación para orientarte.
                  </span>
                )}
              </p>
              {jhSavingsTip && currentGroup.group_name.toLowerCase().includes('implementación') && (
                <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
                  {jhSavingsTip}
                </div>
              )}
              <div className="space-y-3">
                {currentGroup.options.map(option => {
                  const isRadio = currentGroup.input_type === 'radio';
                  const isSelected = isRadio
                    ? radioSelections[currentGroup.group_name]?.optionId === option.id
                    : (checkboxSelections[currentGroup.group_name] || []).some(s => s.optionId === option.id);
                  const priceMode = resolvePriceMode(
                    isComboProduct,
                    isHeladoExperience,
                    isHeladoArmaTu,
                    isRadio,
                    toCLP(option.precio),
                  );
                  const priceBasis = isRadio
                    ? runningBaseForGroup(basePrice, currentGroup.group_name, radioSelections)
                    : basePrice;

                  return (
                    <button
                      key={option.id}
                      onClick={() => isRadio
                        ? handleRadioSelect(currentGroup.group_name, option)
                        : handleCheckboxToggle(currentGroup.group_name, option)
                      }
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                        isSelected
                          ? 'border-brand-primary bg-emerald-50 shadow-md'
                          : 'border-gray-100 hover:border-emerald-200 hover:bg-gray-50'
                      }`}
                    >
                      {option.imagen_url ? (
                        <img src={option.imagen_url} alt={option.nombre} className="w-16 h-16 rounded-xl object-cover" />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-300" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-brand-ink text-sm">{option.nombre}</p>
                        {isJobsHoursBuilder && jhOptionSubline(option) && (
                          <p className="mt-0.5 text-xs text-emerald-700">{jhOptionSubline(option)}</p>
                        )}
                        <p className={`text-sm font-bold mt-0.5 ${
                          option.precio === 0 && (priceMode === 'combo' || (priceMode === 'total' && isRegaloPack))
                            ? 'text-emerald-600'
                            : 'text-brand-primary'
                        }`}>
                          {getOptionPriceLabel(option, priceBasis, priceMode)}
                        </p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected ? 'border-brand-primary bg-brand-primary' : 'border-gray-300'
                      }`}>
                        {isSelected && <Check className="h-4 w-4 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            );
          })()}

          {/* Customization Step */}
          {isCustomStep && (
            <div>
              <h3 className="font-bold text-brand-ink text-lg mb-1">
                {builderMeta?.customize_title ??
                  (isRegaloBuilder ? 'Personaliza tu regalo' : 'Personaliza tu pedido')}
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                {isRegaloBuilder
                  ? 'Nombre, hora o mensaje — quien recibe lo verá en el pedido'
                  : 'Agrega un toque especial'}
              </p>
              <div className="space-y-4">
                {customFields.map(field => (
                  <div key={field.id}>
                    <label className="block text-sm font-semibold text-brand-ink mb-1.5">
                      {field.label}
                      {field.is_required && <span className="text-brand-primary ml-1">*</span>}
                      {field.extra_cost > 0 && (
                        <span className="text-brand-primary font-normal ml-2">(+{formatPrice(field.extra_cost)})</span>
                      )}
                    </label>
                    {field.field_type === 'text' && (
                      <input
                        type="text"
                        value={customValues[field.field_key] || ''}
                        onChange={e => setCustomValues(prev => ({ ...prev, [field.field_key]: e.target.value }))}
                        placeholder={field.label}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-emerald-100 outline-none text-sm transition-all"
                        maxLength={100}
                      />
                    )}
                    {field.field_type === 'textarea' && (
                      <textarea
                        value={customValues[field.field_key] || ''}
                        onChange={e => setCustomValues(prev => ({ ...prev, [field.field_key]: e.target.value }))}
                        placeholder={field.label}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-emerald-100 outline-none text-sm transition-all resize-none"
                        maxLength={500}
                      />
                    )}
                    {field.field_type === 'select' && field.options?.values && (
                      <div className="grid grid-cols-2 gap-2">
                        {field.options.values.map(val => (
                          <button
                            key={val}
                            onClick={() => setCustomValues(prev => ({ ...prev, [field.field_key]: val }))}
                            className={`px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                              customValues[field.field_key] === val
                                ? 'border-brand-primary bg-emerald-50 text-brand-primary'
                                : 'border-gray-100 text-gray-600 hover:border-emerald-200'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {isRegaloBuilder && (
                <div className="mt-5">
                  <TarjetaSaludoPreview
                    nombreDestinatario={
                      customValues.nombre_destinatario ??
                      customValues.destinatario ??
                      customValues.nombre ??
                      ''
                    }
                    mensaje={
                      customValues.mensaje_tarjeta ??
                      customValues.mensaje ??
                      customValues.dedicatoria ??
                      ''
                    }
                  />
                </div>
              )}
            </div>
          )}

          {/* Suggestions Step */}
          {isSuggestionsStep && (
            <div>
              <span className="premium-kicker mb-2 block">Opcional</span>
              <h3 className="font-display text-xl font-extrabold text-brand-ink mb-1">
                {isHeladoBuilder ? '¿Llevas algo más?' : '¿Algo para acompañar?'}
              </h3>
              <p className="text-brand-muted text-sm mb-4">
                {isHeladoBuilder
                  ? 'Golosina, jugo o extra Toppi\'s — puedes continuar sin agregar nada'
                  : 'Complementos sugeridos para tu pedido'}
              </p>
              <div className="space-y-3">
                {displaySuggestions.map(suggestion => {
                  const isSelected = selectedSuggestions.includes(suggestion.idproducto);
                  return (
                    <button
                      key={suggestion.idproducto}
                      onClick={() => toggleSuggestion(suggestion.idproducto)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                        isSelected
                          ? 'border-brand-primary bg-emerald-50 shadow-md'
                          : 'border-gray-100 hover:border-emerald-200 hover:bg-gray-50'
                      }`}
                    >
                      {suggestion.imagen_url ? (
                        <img src={suggestion.imagen_url} alt={suggestion.nombre} className="w-16 h-16 rounded-xl object-cover" />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-300" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-brand-ink text-sm">{suggestion.nombre}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{suggestion.mensaje}</p>
                        <p className="text-sm font-bold mt-1 text-brand-primary">{formatPrice(suggestion.precio_venta)}</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected ? 'border-brand-primary bg-brand-primary' : 'border-gray-300'
                      }`}>
                        {isSelected && <Check className="h-4 w-4 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Summary Step */}
          {isSummaryStep && (
            <div>
              <span className="premium-kicker mb-2 block">Listo</span>
              <h3 className="font-display text-xl font-extrabold text-brand-ink mb-1">Confirma tu pedido</h3>
              <p className="mb-4 text-sm text-brand-muted">
                Revisa abajo — el total es el precio final, sin sorpresas al pagar.
              </p>

              <div className="mb-4 rounded-2xl border-2 border-brand-primary/25 bg-gradient-to-br from-emerald-50 to-white px-4 py-4 shadow-premium">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-brand-ink">Total a pagar</span>
                  <span className="font-display text-3xl font-extrabold tabular-nums text-brand-primary">
                    {formatPrice(displayTotal)}
                  </span>
                </div>
                {(checkboxExtraTotal > 0 || suggestionsTotal > 0) && (
                  <p className="mt-1 text-[11px] text-gray-600">
                    Helado {formatPrice(packagePrice)}
                    {checkboxExtraTotal > 0 && ` + extras ${formatPrice(checkboxExtraTotal)}`}
                    {suggestionsTotal > 0 && ` + acompañamiento ${formatPrice(suggestionsTotal)}`}
                  </p>
                )}
              </div>

              {(isRegaloBuilder || fixedPackLines.length > 0) && (
                <div className="mb-4 rounded-2xl border border-rose-100 bg-rose-50/60 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-rose-800">
                    {isClosedRegaloPack ? 'Contenido fijo del pack' : 'Tu pack incluye'}
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-brand-ink">{product?.nombre}</p>
                  <ul className="mt-2 space-y-1 text-xs leading-relaxed text-brand-ink/90">
                    {(fixedPackLines.length > 0
                      ? fixedPackLines
                      : buildPackIncludesForBuilder({
                          componentes: product?.componentes,
                          radioSelections,
                          checkboxSelections,
                          selectedSuggestionIds: selectedSuggestions,
                          suggestions: displaySuggestions,
                        })
                    ).map((line) => (
                      <li key={line} className="flex gap-1.5">
                        <span className="font-bold text-brand-primary">·</span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="overflow-hidden rounded-2xl border border-gray-100">
                <div className="grid grid-cols-[1fr_auto] gap-x-3 border-b border-gray-100 bg-gray-50 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  <span>Detalle</span>
                  <span className="text-right">Precio</span>
                </div>

                <div className="flex justify-between gap-3 border-b border-gray-50 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      {isComboProduct ? 'Combo' : 'Helado'}
                    </p>
                    <p className="text-sm font-bold text-brand-ink">{heladoSummaryTitle}</p>
                    {Object.entries(radioSelections).map(([group, sel]) => (
                      <p key={group} className="mt-0.5 text-xs text-gray-500">
                        {humanizeGroupName(group)}: {sel.nombre}
                      </p>
                    ))}
                  </div>
                  <span className="shrink-0 font-bold text-brand-ink">{formatPrice(packagePrice)}</span>
                </div>

                {Object.entries(checkboxSelections).flatMap(([group, sels]) =>
                  sels.map((sel) => {
                    const priceFmt = formatSummaryItemPrice(sel.precio);
                    return (
                      <div
                        key={sel.optionId}
                        className="flex justify-between gap-3 border-b border-gray-50 px-4 py-3"
                      >
                        <div>
                          <p className="text-xs text-gray-400">{humanizeGroupName(group)}</p>
                          <p className="text-sm font-medium text-brand-ink">{sel.nombre}</p>
                        </div>
                        <span className={`shrink-0 text-sm font-bold ${priceFmt.className}`}>{priceFmt.label}</span>
                      </div>
                    );
                  })
                )}

                {displaySuggestions
                  .filter((s) => selectedSuggestions.includes(s.idproducto))
                  .map((s) => (
                    <div
                      key={s.idproducto}
                      className="flex justify-between gap-3 border-b border-gray-50 px-4 py-3"
                    >
                      <div>
                        <p className="text-xs text-gray-400">Acompañamiento</p>
                        <p className="text-sm font-medium text-brand-ink">{s.nombre}</p>
                      </div>
                      <span className="shrink-0 text-sm font-bold text-brand-primary">
                        +{formatPrice(s.precio_venta)}
                      </span>
                    </div>
                  ))}

                {Object.entries(customValues)
                  .filter(([, v]) => v.trim())
                  .map(([key, val]) => {
                    const field = customFields.find((f) => f.field_key === key);
                    return (
                      <div key={key} className="border-b border-gray-50 px-4 py-3">
                        <p className="text-xs text-gray-400">{field?.label || key}</p>
                        <p className="text-sm italic text-brand-ink">&ldquo;{val}&rdquo;</p>
                      </div>
                    );
                  })}
              </div>

              {isRegaloBuilder && (
                <p className="mt-3 text-xs text-rose-700/90">
                  En checkout podrás elegir bolsa estándar, reforzada o caja regalo.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer — total en vivo siempre visible */}
        <div className="border-t-2 border-brand-primary/15 bg-gradient-to-b from-emerald-50/95 to-white pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between gap-3 px-5 py-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Tu total</p>
              <p className="truncate text-xs text-brand-muted">
                {isJobsHoursBuilder
                  ? 'Modular · pagas solo lo que marcas'
                  : isHeladoBuilder
                  ? 'Precio final · se actualiza al elegir'
                  : checkboxExtraTotal > 0 || suggestionsTotal > 0
                    ? `Base ${formatPrice(packagePrice)}${
                        checkboxExtraCount > 0
                          ? ` + ${checkboxExtraCount} extra${checkboxExtraCount > 1 ? 's' : ''} (${formatPrice(checkboxExtraTotal)})`
                          : ''
                      }${suggestionsTotal > 0 ? ` + acompañamiento` : ''}`
                    : 'Elige opciones para ver el total'}
              </p>
            </div>
            <span
              key={displayTotal}
              className="shrink-0 font-black text-2xl tabular-nums text-brand-primary animate-fade-in-up"
            >
              {formatPrice(displayTotal)}
            </span>
          </div>
          <div className="flex gap-3 border-t border-emerald-100/80 bg-gray-50/50 p-5 pt-3">
            {(step > 0 || (isHeladoBaseStep && heladoSubPaso === 'sabor')) && (
              <button
                type="button"
                onClick={goBackStep}
                className="touch-target min-h-[48px] px-5 py-3 rounded-xl border border-emerald-200 text-brand-primary font-semibold text-sm hover:bg-emerald-50 transition-all"
              >
                Atr&aacute;s
              </button>
            )}
            {!isSummaryStep ? (
              <button
                type="button"
                onClick={advanceStep}
                disabled={!isCurrentStepValid()}
                className={`touch-target flex-1 flex min-h-[48px] items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  isHeladoBuilder
                    ? 'bg-toppis-mustard text-brand-ink hover:bg-toppis-mustard-hover shadow-lg shadow-amber-900/15'
                    : 'bg-brand-primary text-white hover:bg-brand-primary-hover'
                }`}
              >
                {nextButtonLabel} <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!allRequiredValid()}
                className={`touch-target flex-1 flex min-h-[48px] items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  isHeladoBuilder
                    ? 'bg-toppis-mustard text-brand-ink hover:bg-toppis-mustard-hover shadow-lg shadow-amber-900/15'
                    : 'bg-brand-primary text-white hover:bg-brand-primary-hover'
                }`}
              >
                <Check className="h-4 w-4" /> {addToCartLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

