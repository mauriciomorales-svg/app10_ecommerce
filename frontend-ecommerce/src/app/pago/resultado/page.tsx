'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2, Heart } from 'lucide-react';

function PagoResultadoContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verificando pago...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token no válido');
      return;
    }

    fetch(`/api/pagos/flow/confirm?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStatus('success');
          setMessage('¡Pago completado exitosamente!');
        } else {
          setStatus('error');
          setMessage('El pago no pudo ser procesado');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Error al verificar el pago');
      });
  }, [token]);

  return (
    <>
      {status === 'loading' && (
        <>
          <Loader2 className="h-16 w-16 text-[#d81b60] animate-spin mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2 text-[#1a1a2e]">Procesando pago</h1>
          <p className="text-gray-600">{message}</p>
        </>
      )}

      {status === 'success' && (
        <>
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2 text-green-600">&iexcl;Pago Exitoso!</h1>
          <p className="text-gray-600 mb-6">{message}</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-[#d81b60] text-white rounded-xl hover:bg-[#ad1457] transition-colors shadow-lg shadow-pink-500/20">
            <Heart className="h-4 w-4 fill-white" /> Volver a la tienda
          </Link>
        </>
      )}

      {status === 'error' && (
        <>
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2 text-red-600">Pago no completado</h1>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="space-y-2">
            <Link href="/checkout" className="block px-6 py-3 bg-[#d81b60] text-white rounded-xl hover:bg-[#ad1457] transition-colors">
              Intentar nuevamente
            </Link>
            <Link href="/cart" className="block px-6 py-3 text-[#d81b60] hover:text-[#ad1457] transition-colors">
              Volver al carrito
            </Link>
          </div>
        </>
      )}
    </>
  );
}

export default function PagoResultadoPage() {
  return (
    <div className="min-h-screen bg-[#fff5f7] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg border border-pink-100 p-8 max-w-md w-full text-center">
        <Suspense fallback={<Loader2 className="h-16 w-16 text-[#d81b60] animate-spin mx-auto" />}>
          <PagoResultadoContent />
        </Suspense>
      </div>
    </div>
  );
}
