'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { apiFetch } from '../lib/api';

export type CommerceStoreInfo = {
  id: number;
  slug: string;
  name: string;
  theme: string;
  brand?: {
    title?: string;
    tagline?: string;
    whatsapp?: string;
    support_hours?: string;
    region?: string;
  };
  checkout?: {
    fulfillment_mode?: string;
    delivery_enabled?: boolean;
    packaging_default?: string;
    pickup_label?: string;
    pickup_hint?: string;
    fecha_retiro_label?: string;
    min_order_products?: number;
  };
};

type StoreContextValue = {
  store: CommerceStoreInfo | null;
  loading: boolean;
  isJobshours: boolean;
};

const StoreContext = createContext<StoreContextValue>({
  store: null,
  loading: true,
  isJobshours: false,
});

export function CommerceStoreProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<CommerceStoreInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/commerce/store')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.store) {
          setStore(data.store as CommerceStoreInfo);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <StoreContext.Provider
      value={{
        store,
        loading,
        isJobshours: store?.theme === 'jobshours',
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useCommerceStore() {
  return useContext(StoreContext);
}
