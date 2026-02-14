"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { useCartStore } from "@/stores/cartStore";
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CarritoPage() {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
  const [procesando, setProcesando] = useState(false);

  const handleCheckout = async () => {
    setProcesando(true);
    // Aquí iría la integración con Transbank
    alert("Redirigiendo a WebPay...");
    setProcesando(false);
  };

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Tu carrito está vacío</h2>
            <p className="text-gray-600 mb-4">Agrega algunos productos para comenzar</p>
            <Link
              href="/"
              className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
            >
              Ver productos
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Tu Carrito</h1>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {items.map((item) => (
              <div
                key={item.idproducto}
                className="flex items-center p-4 border-b last:border-b-0"
              >
                <div className="flex-1">
                  <h3 className="font-semibold">{item.nombre}</h3>
                  <p className="text-primary-600 font-bold">
                    ${item.precio_venta?.toLocaleString("es-CL")}
                  </p>
                </div>

                <div className="flex items-center space-x-2 mx-4">
                  <button
                    onClick={() => updateQuantity(item.idproducto, item.cantidad - 1)}
                    className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center font-semibold">{item.cantidad}</span>
                  <button
                    onClick={() => updateQuantity(item.idproducto, item.cantidad + 1)}
                    className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="text-right mr-4">
                  <p className="font-bold">
                    ${(item.precio_venta * item.cantidad)?.toLocaleString("es-CL")}
                  </p>
                </div>

                <button
                  onClick={() => removeItem(item.idproducto)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}

            <div className="p-4 bg-gray-50 border-t">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-bold">Total:</span>
                <span className="text-2xl font-bold text-primary-600">
                  ${getTotal()?.toLocaleString("es-CL")}
                </span>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={clearCart}
                  className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  Vaciar carrito
                </button>
                <button
                  onClick={handleCheckout}
                  disabled={procesando}
                  className="flex-1 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <span>{procesando ? "Procesando..." : "Pagar con WebPay"}</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
