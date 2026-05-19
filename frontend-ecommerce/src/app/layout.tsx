import type { Metadata } from "next";
import { Barlow } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./context/CartContext";

const barlow = Barlow({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "DondeMorales - Tienda Online",
  description: "Tu minimarket de confianza en Renaico",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={barlow.className}>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
