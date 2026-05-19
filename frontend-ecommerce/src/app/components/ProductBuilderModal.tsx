'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, Package, Check, ChevronRight, Loader2 } from 'lucide-react';
import { formatCLP, toCLP } from '../lib/money';

interface BundleOption {
  id: number;
  child_product_id: number;
  nombre: string;
  imagen_url: string | null;
  precio: number;
  stock_disponible: number;
}

interface BundleGroup {
  group_name: string;
  input_type: 'radio' | 'checkbox';
  is_required: boolean;
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

interface ProductDetail {
  idproducto: number;
  nombre: string;
  precio_venta: number;
  imagen_url: string | null;
  descripcion: string | null;
  es_pack: boolean;
  categorias?: { idcategoria: number; nombre: string }[];
  bundle_groups?: BundleGroup[];
  customization_fields?: CustomField[];
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
}

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
    bundle_configuration: {
      modifiers?: object[];
      customization?: object;
      suggestions?: SuggestedProduct[];
    };
  }) => void;
}) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0); // 0 = bundle groups, last = customization, last+1 = summary

  // Selections
  const [radioSelections, setRadioSelections] = useState<Record<string, SelectedModifier>>({});
  const [checkboxSelections, setCheckboxSelections] = useState<Record<string, SelectedModifier[]>>({});
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [suggestions, setSuggestions] = useState<SuggestedProduct[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<number[]>([]);

  const fetchProduct = useCallback(async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // Calculate total steps
  const bundleGroups = product?.bundle_groups || [];
  const customFields = product?.customization_fields || [];
  const totalSteps = bundleGroups.length + (customFields.length > 0 ? 1 : 0) + (suggestions.length > 0 ? 1 : 0) + 1; // +1 for summary

  // Calculate dynamic price
  const basePrice = toCLP(product?.precio_venta);
  const modifierTotal = Object.values(radioSelections).reduce((sum, s) => sum + toCLP(s.precio), 0)
    + Object.values(checkboxSelections).flat().reduce((sum, s) => sum + toCLP(s.precio), 0);
  const totalPrice = basePrice + modifierTotal;

  // Validation
  const isCurrentStepValid = () => {
    if (step < bundleGroups.length) {
      const group = bundleGroups[step];
      if (group.is_required) {
        if (group.input_type === 'radio') {
          return !!radioSelections[group.group_name];
        }
      }
      return true;
    }
    if (step === bundleGroups.length && customFields.length > 0) {
      return customFields.filter(f => f.is_required).every(f => customValues[f.field_key]?.trim());
    }
    return true;
  };

  const allRequiredValid = () => {
    for (const group of bundleGroups) {
      if (group.is_required && group.input_type === 'radio' && !radioSelections[group.group_name]) {
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

    const selectedSuggestionObjects = suggestions.filter(s => selectedSuggestions.includes(s.idproducto));
    const suggestionsTotal = selectedSuggestionObjects.reduce((sum, s) => sum + toCLP(s.precio_venta), 0);

    const bundleConfig = {
      modifiers: [
        ...Object.values(radioSelections).map(s => ({ name: s.nombre, price: s.precio, child_product_id: s.childProductId })),
        ...Object.values(checkboxSelections).flat().map(s => ({ name: s.nombre, price: s.precio, child_product_id: s.childProductId })),
      ],
      customization: customValues,
      suggestions: selectedSuggestionObjects,
    };

    onAddToCart({
      idproducto: product.idproducto,
      nombre: product.nombre,
      precio_venta: totalPrice + suggestionsTotal,
      imagen: product.imagen_url,
      idcategoria: product.categorias?.[0]?.idcategoria ?? null,
      bundle_configuration: bundleConfig,
    });
    onClose();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
        <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg p-8 flex flex-col items-center" onClick={e => e.stopPropagation()}>
          <Loader2 className="h-10 w-10 text-[#16a34a] animate-spin mb-4" />
          <p className="text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const isSummaryStep = step === totalSteps - 1;
  const isCustomStep = customFields.length > 0 && step === bundleGroups.length;
  const isSuggestionsStep = suggestions.length > 0 && step === bundleGroups.length + (customFields.length > 0 ? 1 : 0);
  const currentGroup = step < bundleGroups.length ? bundleGroups[step] : null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#166534] to-[#16a34a] p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5 text-emerald-200" />
            <div>
              <h2 className="font-bold text-white text-lg leading-tight">{product.nombre}</h2>
              <p className="text-emerald-200 text-xs mt-0.5">Paso {step + 1} de {totalSteps}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-emerald-100">
          <div
            className="h-full bg-[#16a34a] transition-all duration-300"
            style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Bundle Group Step */}
          {currentGroup && (
            <div>
              <h3 className="font-bold text-[#1a1a2e] text-lg mb-1">{currentGroup.group_name}</h3>
              <p className="text-gray-400 text-sm mb-4">
                {currentGroup.input_type === 'radio' ? 'Selecciona una opci\u00f3n' : 'Puedes elegir varias'}
                {currentGroup.is_required && <span className="text-[#16a34a] ml-1">*</span>}
              </p>
              <div className="space-y-3">
                {currentGroup.options.map(option => {
                  const isRadio = currentGroup.input_type === 'radio';
                  const isSelected = isRadio
                    ? radioSelections[currentGroup.group_name]?.optionId === option.id
                    : (checkboxSelections[currentGroup.group_name] || []).some(s => s.optionId === option.id);

                  return (
                    <button
                      key={option.id}
                      onClick={() => isRadio
                        ? handleRadioSelect(currentGroup.group_name, option)
                        : handleCheckboxToggle(currentGroup.group_name, option)
                      }
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                        isSelected
                          ? 'border-[#16a34a] bg-emerald-50 shadow-md'
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
                        <p className="font-semibold text-[#1a1a2e] text-sm">{option.nombre}</p>
                        <p className={`text-sm font-bold mt-0.5 ${option.precio === 0 ? 'text-emerald-500' : 'text-[#16a34a]'}`}>
                          {option.precio === 0 ? 'Incluido' : `+${formatPrice(option.precio)}`}
                        </p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected ? 'border-[#16a34a] bg-[#16a34a]' : 'border-gray-300'
                      }`}>
                        {isSelected && <Check className="h-4 w-4 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Customization Step */}
          {isCustomStep && (
            <div>
              <h3 className="font-bold text-[#1a1a2e] text-lg mb-1">Personaliza tu pedido</h3>
              <p className="text-gray-400 text-sm mb-4">Agrega un toque especial</p>
              <div className="space-y-4">
                {customFields.map(field => (
                  <div key={field.id}>
                    <label className="block text-sm font-semibold text-[#1a1a2e] mb-1.5">
                      {field.label}
                      {field.is_required && <span className="text-[#16a34a] ml-1">*</span>}
                      {field.extra_cost > 0 && (
                        <span className="text-[#16a34a] font-normal ml-2">(+{formatPrice(field.extra_cost)})</span>
                      )}
                    </label>
                    {field.field_type === 'text' && (
                      <input
                        type="text"
                        value={customValues[field.field_key] || ''}
                        onChange={e => setCustomValues(prev => ({ ...prev, [field.field_key]: e.target.value }))}
                        placeholder={field.label}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#16a34a] focus:ring-2 focus:ring-emerald-100 outline-none text-sm transition-all"
                        maxLength={100}
                      />
                    )}
                    {field.field_type === 'textarea' && (
                      <textarea
                        value={customValues[field.field_key] || ''}
                        onChange={e => setCustomValues(prev => ({ ...prev, [field.field_key]: e.target.value }))}
                        placeholder={field.label}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#16a34a] focus:ring-2 focus:ring-emerald-100 outline-none text-sm transition-all resize-none"
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
                                ? 'border-[#16a34a] bg-emerald-50 text-[#16a34a]'
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
            </div>
          )}

          {/* Suggestions Step */}
          {isSuggestionsStep && (
            <div>
              <h3 className="font-bold text-[#1a1a2e] text-lg mb-1">Agrega a tu pedido</h3>
              <p className="text-gray-400 text-sm mb-4">Los que compraron esto también llevaron...</p>
              <div className="space-y-3">
                {suggestions.map(suggestion => {
                  const isSelected = selectedSuggestions.includes(suggestion.idproducto);
                  return (
                    <button
                      key={suggestion.idproducto}
                      onClick={() => toggleSuggestion(suggestion.idproducto)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                        isSelected
                          ? 'border-[#16a34a] bg-emerald-50 shadow-md'
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
                        <p className="font-semibold text-[#1a1a2e] text-sm">{suggestion.nombre}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{suggestion.mensaje}</p>
                        <p className="text-sm font-bold mt-1 text-[#16a34a]">{formatPrice(suggestion.precio_venta)}</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected ? 'border-[#16a34a] bg-[#16a34a]' : 'border-gray-300'
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
              <h3 className="font-bold text-[#1a1a2e] text-lg mb-4">Resumen de tu pedido</h3>

              <div className="space-y-3">
                {/* Base */}
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Precio base</span>
                  <span className="font-bold text-[#1a1a2e]">{formatPrice(basePrice)}</span>
                </div>

                {/* Radio selections */}
                {Object.entries(radioSelections).map(([group, sel]) => (
                  <div key={group} className="flex justify-between items-center py-2 border-t border-gray-50">
                    <div>
                      <p className="text-xs text-gray-400">{group}</p>
                      <p className="text-sm font-medium text-[#1a1a2e]">{sel.nombre}</p>
                    </div>
                    <span className={`font-bold text-sm ${sel.precio === 0 ? 'text-emerald-500' : 'text-[#16a34a]'}`}>
                      {sel.precio === 0 ? 'Incluido' : `+${formatPrice(sel.precio)}`}
                    </span>
                  </div>
                ))}

                {/* Checkbox selections */}
                {Object.entries(checkboxSelections).map(([group, sels]) =>
                  sels.map(sel => (
                    <div key={sel.optionId} className="flex justify-between items-center py-2 border-t border-gray-50">
                      <div>
                        <p className="text-xs text-gray-400">{group}</p>
                        <p className="text-sm font-medium text-[#1a1a2e]">{sel.nombre}</p>
                      </div>
                      <span className="font-bold text-sm text-[#16a34a]">+{formatPrice(sel.precio)}</span>
                    </div>
                  ))
                )}

                {/* Customization */}
                {Object.entries(customValues).filter(([, v]) => v.trim()).map(([key, val]) => {
                  const field = customFields.find(f => f.field_key === key);
                  return (
                    <div key={key} className="py-2 border-t border-gray-50">
                      <p className="text-xs text-gray-400">{field?.label || key}</p>
                      <p className="text-sm text-[#1a1a2e] italic">&ldquo;{val}&rdquo;</p>
                    </div>
                  );
                })}

                {/* Total */}
                <div className="flex justify-between items-center pt-4 border-t-2 border-[#16a34a]/20">
                  <span className="font-bold text-lg text-[#1a1a2e]">Total</span>
                  <span className="font-black text-2xl text-[#16a34a]">{formatPrice(totalPrice)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">Total</span>
            <span className="font-black text-xl text-[#16a34a]">{formatPrice(totalPrice)}</span>
          </div>
          <div className="flex gap-3">
            {step > 0 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="px-5 py-3 rounded-xl border border-emerald-200 text-[#16a34a] font-semibold text-sm hover:bg-emerald-50 transition-all"
              >
                Atr&aacute;s
              </button>
            )}
            {!isSummaryStep ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!isCurrentStepValid()}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#16a34a] text-white font-semibold text-sm hover:bg-[#15803d] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Siguiente <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={!allRequiredValid()}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#16a34a] text-white font-bold text-sm hover:bg-[#15803d] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Check className="h-4 w-4" /> Agregar al pedido
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

