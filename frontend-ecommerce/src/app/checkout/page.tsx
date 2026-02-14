'use client';

import { useCart } from '../context/CartContext';
import { useState } from 'react';
import Link from 'next/link';
import { Heart, Lock, ArrowLeft } from 'lucide-react';

interface ClienteData {
  nombre: string;
  email: string;
  telefono: string;
  fecha_retiro: string;
}

function getNextDays(count: number) {
  const days = [];
  const now = new Date();
  for (let i = 1; i <= count; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const label = d.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
    const value = d.toISOString().split('T')[0];
    days.push({ label, value });
  }
  return days;
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const availableDays = getNextDays(7);
  const [cliente, setCliente] = useState<ClienteData>({
    nombre: '',
    email: '',
    telefono: '+569',
    fecha_retiro: availableDays[0]?.value || '',
  });

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#fff5f7] py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Heart className="h-16 w-16 text-pink-200 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4 text-[#1a1a2e]">Checkout</h1>
          <p className="text-gray-500 mb-6">Tu carrito est&aacute; vac&iacute;o</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-[#d81b60] text-white rounded-xl hover:bg-[#ad1457] transition-colors">
            <Heart className="h-4 w-4 fill-white" /> Ver productos
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/pagos/flow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          cliente,
          total
        })
      });

      const data = await response.json();
      
      if (data.success && data.url && data.token) {
        clearCart();
        window.location.href = data.url + '?token=' + data.token;
      } else {
        alert('Error al crear el pago');
      }
    } catch (error) {
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff5f7] py-8">
      <div className="max-w-6xl mx-auto px-4">
        <Link href="/cart" className="inline-flex items-center gap-1 text-[#d81b60] hover:text-[#ad1457] text-sm font-medium mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Volver al carrito
        </Link>
        <h1 className="text-2xl font-bold mb-6 text-[#1a1a2e] flex items-center gap-2">
          <Lock className="h-6 w-6 text-[#d81b60]" /> Finalizar Compra
        </h1>
        
        <div className="grid lg:grid-cols-2 gap-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-pink-100">
              <h2 className="text-lg font-semibold mb-4 text-[#1a1a2e]">Datos del cliente</h2>
              
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={cliente.nombre}
                    onChange={e => setCliente({...cliente, nombre: e.target.value})}
                    className="w-full px-4 py-2 border border-pink-100 rounded-xl focus:ring-2 focus:ring-[#d81b60]/20 focus:border-[#d81b60] outline-none transition-all"
                    placeholder="Juan Pérez"
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={cliente.email}
                      onChange={e => setCliente({...cliente, email: e.target.value})}
                      className="w-full px-4 py-2 border border-pink-100 rounded-xl focus:ring-2 focus:ring-[#d81b60]/20 focus:border-[#d81b60] outline-none transition-all"
                      placeholder="juan@email.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      required
                      value={cliente.telefono}
                      onChange={e => setCliente({...cliente, telefono: e.target.value})}
                      className="w-full px-4 py-2 border border-pink-100 rounded-xl focus:ring-2 focus:ring-[#d81b60]/20 focus:border-[#d81b60] outline-none transition-all"
                      placeholder="+56 9 1234 5678"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de retiro *
                  </label>
                  <select
                    required
                    value={cliente.fecha_retiro}
                    onChange={e => setCliente({...cliente, fecha_retiro: e.target.value})}
                    className="w-full px-4 py-2 border border-pink-100 rounded-xl focus:ring-2 focus:ring-[#d81b60]/20 focus:border-[#d81b60] outline-none transition-all"
                  >
                    {availableDays.map(day => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">Retiro en tienda: Santiago Watt 205, Renaico</p>
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#d81b60] text-white font-bold rounded-xl hover:bg-[#ad1457] disabled:opacity-50 transition-all shadow-lg shadow-pink-500/20 flex items-center justify-center gap-2"
            >
              <Lock className="h-4 w-4" />
              {loading ? 'Procesando...' : `Pagar $${total.toLocaleString('es-CL')}`}
            </button>
            
            <p className="text-center text-sm text-gray-400 flex items-center justify-center gap-1">
              <Lock className="h-3 w-3" /> Pago seguro con Flow
            </p>
          </form>
          
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-pink-100 h-fit">
            <h2 className="text-lg font-semibold mb-4 text-[#1a1a2e]">Resumen del pedido</h2>
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.idproducto} className="flex justify-between text-sm">
                  <span>{item.nombre} x{item.cantidad}</span>
                  <span className="font-medium">
                    ${(item.precio_venta * item.cantidad).toLocaleString('es-CL')}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-[#d81b60]">${total.toLocaleString('es-CL')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
