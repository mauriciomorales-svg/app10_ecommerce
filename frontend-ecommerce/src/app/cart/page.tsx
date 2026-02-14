'use client';

import { useCart } from '../context/CartContext';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, total, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#fff5f7] py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Heart className="h-16 w-16 text-pink-200 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4 text-[#1a1a2e]">Tu Carrito</h1>
          <p className="text-gray-500 mb-6">A&uacute;n no has elegido regalos</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-[#d81b60] text-white rounded-xl hover:bg-[#ad1457] transition-colors shadow-lg shadow-pink-500/20">
            <Heart className="h-4 w-4 fill-white" /> Ver productos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff5f7] py-8">
      <div className="max-w-6xl mx-auto px-4">
        <Link href="/" className="inline-flex items-center gap-1 text-[#d81b60] hover:text-[#ad1457] text-sm font-medium mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Seguir comprando
        </Link>
        <h1 className="text-2xl font-bold mb-6 text-[#1a1a2e] flex items-center gap-2">
          <ShoppingCart className="h-6 w-6 text-[#d81b60]" /> Tu Carrito ({items.length} productos)
        </h1>
        
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div key={item.idproducto} className="bg-white p-4 rounded-2xl shadow-md border border-pink-50 flex gap-4 hover:shadow-lg transition-shadow">
                <div className="w-24 h-24 bg-gray-200 rounded flex-shrink-0 relative overflow-hidden">
                  {item.imagen ? (
                    <Image
                      src={item.imagen}
                      alt={item.nombre}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.nombre}</h3>
                  <p className="text-[#d81b60] font-bold">${item.precio_venta.toLocaleString('es-CL')}</p>
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
                    ${(item.precio_venta * item.cantidad).toLocaleString('es-CL')}
                  </p>
                </div>
              </div>
            ))}
            
            <button
              onClick={clearCart}
              className="inline-flex items-center gap-1 text-red-400 hover:text-red-600 text-sm transition-colors"
            >
              <Trash2 className="h-3 w-3" /> Vaciar carrito
            </button>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-pink-100 sticky top-4">
              <h2 className="text-lg font-bold mb-4 text-[#1a1a2e]">Resumen</h2>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${total.toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Envío</span>
                  <span className="text-green-600 font-medium">Retiro en tienda</span>
                </div>
              </div>
              
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-[#d81b60]">${total.toLocaleString('es-CL')}</span>
                </div>
              </div>
              
              <Link
                href="/checkout"
                className="block w-full text-center px-6 py-3 bg-[#d81b60] text-white font-semibold rounded-xl hover:bg-[#ad1457] transition-all shadow-lg shadow-pink-500/20"
              >
                Continuar al pago
              </Link>
              
              <Link
                href="/"
                className="block w-full text-center mt-3 text-[#d81b60] hover:text-[#ad1457] text-sm font-medium transition-colors"
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
