'use client';

import { useCart } from '../context/CartContext';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';
import { formatCLP, toCLP } from '../lib/money';
import CartCrossSell from '../components/CartCrossSell';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, total, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#f0fdf4] py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <ShoppingCart className="h-16 w-16 text-emerald-200 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4 text-[#1a1a2e]">Tu Carrito</h1>
          <p className="text-gray-500 mb-6">A&uacute;n no tienes productos en el carrito</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-[#16a34a] text-white rounded-xl hover:bg-[#15803d] transition-colors shadow-lg shadow-emerald-500/20">
            Ver productos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0fdf4] py-8">
      <div className="max-w-6xl mx-auto px-4">
        <Link href="/" className="inline-flex items-center gap-1 text-[#16a34a] hover:text-[#15803d] text-sm font-medium mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Seguir comprando
        </Link>
        <h1 className="text-2xl font-bold mb-6 text-[#1a1a2e] flex items-center gap-2">
          <ShoppingCart className="h-6 w-6 text-[#16a34a]" /> Tu Carrito ({items.length} productos)
        </h1>
        
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div key={item.idproducto} className="bg-white p-4 rounded-2xl shadow-md border border-emerald-50 flex gap-4 hover:shadow-lg transition-shadow">
                <div className="w-24 h-24 bg-gray-200 rounded flex-shrink-0 relative overflow-hidden">
                  {item.imagen ? (
                    <Image
                      src={item.imagen}
                      alt={item.nombre}
                      fill
                      className="object-contain p-1"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">{item.nombre}</h3>
                  {item.bundle_configuration?.modifiers &&
                    Array.isArray(item.bundle_configuration.modifiers) &&
                    item.bundle_configuration.modifiers.length > 0 && (
                    <ul className="text-xs text-gray-600 mt-1 space-y-0.5">
                      {item.bundle_configuration.modifiers.map((m, idx) => {
                        const mod = m as { name?: string; price?: unknown };
                        const p = mod.price;
                        return (
                          <li key={idx} className="flex justify-between gap-2">
                            <span className="truncate">+ {mod.name || 'Opción'}</span>
                            <span className="text-gray-500 shrink-0">
                              {formatCLP(p) === '0' ? 'incluido' : `+$${formatCLP(p)}`}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  {item.bundle_configuration?.customization &&
                    Object.keys(item.bundle_configuration.customization as object).length > 0 && (
                    <p className="text-xs text-gray-500 mt-1 italic">
                      {Object.entries(item.bundle_configuration.customization as Record<string, string>)
                        .filter(([, v]) => v && String(v).trim())
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(' · ')}
                    </p>
                  )}
                  <p className="text-[#16a34a] font-bold mt-1">${formatCLP(item.precio_venta)}</p>
                  <p className="text-sm text-gray-500">Stock disponible: {item.stock}</p>
                  
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center border rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.idproducto, item.cantidad - 1)}
                        className="px-3 py-1 hover:bg-gray-100"
                        disabled={item.cantidad <= 1}
                      >
                        -
                      </button>
                      <span className="px-3 py-1 font-medium">{item.cantidad}</span>
                      <button
                        onClick={() => updateQuantity(item.idproducto, item.cantidad + 1)}
                        className="px-3 py-1 hover:bg-gray-100"
                        disabled={item.cantidad >= item.stock}
                      >
                        +
                      </button>
                    </div>
                    
                    <button
                      onClick={() => removeFromCart(item.idproducto)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-bold text-lg">
                    ${formatCLP(toCLP(item.precio_venta) * item.cantidad)}
                  </p>
                </div>
              </div>
            ))}

            <CartCrossSell cartProductIds={items.map((i) => i.idproducto)} />
            
            <button
              onClick={clearCart}
              className="inline-flex items-center gap-1 text-red-400 hover:text-red-600 text-sm transition-colors"
            >
              <Trash2 className="h-3 w-3" /> Vaciar carrito
            </button>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-emerald-100 sticky top-4">
              <h2 className="text-lg font-bold mb-4 text-[#1a1a2e]">Resumen</h2>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal productos</span>
                  <span className="font-medium">${formatCLP(total)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Empaque en checkout</span>
                  <span>desde +$290</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Entrega</span>
                  <span className="text-green-600 font-medium">Retiro en tienda</span>
                </div>
                {total > 0 && total < 10000 && (
                  <div className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 text-xs text-amber-900">
                    Suma <strong>${formatCLP(10000 - total)}</strong> y llevas bolsa reforzada gratis en checkout.
                  </div>
                )}
              </div>
              
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-[#16a34a]">${formatCLP(total)}</span>
                </div>
              </div>
              
              <Link
                href="/checkout"
                className="block w-full text-center px-6 py-3 bg-[#16a34a] text-white font-semibold rounded-xl hover:bg-[#15803d] transition-all shadow-lg shadow-emerald-500/20"
              >
                Continuar al pago
              </Link>
              
              <Link
                href="/"
                className="block w-full text-center mt-3 text-[#16a34a] hover:text-[#15803d] text-sm font-medium transition-colors"
              >
                Seguir comprando
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


