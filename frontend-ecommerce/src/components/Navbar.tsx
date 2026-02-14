"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, Menu, X, Store } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/stores/cartStore";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const cartItems = useCartStore((state) => state.items);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cartCount = mounted ? cartItems.reduce((sum, item) => sum + item.cantidad, 0) : 0;

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Store className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">DondeMorales</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-primary-600">Inicio</Link>
            <Link href="/productos" className="text-gray-700 hover:text-primary-600">Productos</Link>
            <Link href="/carrito" className="relative text-gray-700 hover:text-primary-600">
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <Link href="/" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Inicio</Link>
          <Link href="/productos" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Productos</Link>
          <Link href="/carrito" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
            Carrito ({cartCount})
          </Link>
        </div>
      )}
    </nav>
  );
}
