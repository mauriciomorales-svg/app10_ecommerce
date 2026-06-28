export type PackagingOption = {
  key: string;
  label: string;
  description: string;
  amount: number;
  base_amount: number;
  recommended: boolean;
  free_applied: boolean;
};

export type DeliveryQuote = {
  amount: number;
  distance_km: number;
  distance_km_adjusted: number;
  within_radius: boolean;
  max_radius_km: number;
  breakdown: {
    label: string;
    base_commune_clp: number;
    included_km: number;
    per_extra_km_clp: number;
    final_clp: number;
  };
  store: {
    lat: number;
    lng: number;
    name: string;
    address: string;
  };
};

export type DeliveryRenaicoMessaging = {
  activo?: boolean;
  min_pedido_delivery_clp?: number;
  min_pedido_delivery_nota?: string;
  ventanas?: { nombre: string; horario: string; dias: string }[];
  retiro?: { direccion?: string; horario?: string; nota?: string };
};

export type DeliveryConfig = {
  success?: boolean;
  store: { name: string; address: string; lat: number; lng: number };
  pricing: {
    base_commune_clp: number;
    included_km: number;
    per_extra_km_clp: number;
    max_radius_km: number;
    hint: string;
  };
  renaico?: DeliveryRenaicoMessaging;
};

export type FulfillmentType = 'pickup' | 'delivery';

export type CheckoutOptionsResponse = {
  success: boolean;
  pickup: {
    address: string;
    hours: string;
    whatsapp: string;
    label?: string | null;
    hint?: string | null;
  };
  thresholds: { free_reinforced_from: number; free_gift_box_from: number };
  min_order_products?: number;
  amount_to_free_gift_box?: number;
  packaging_options: PackagingOption[];
  packaging_default?: string;
  delivery_enabled?: boolean;
  fulfillment_mode?: string;
  fecha_retiro_label?: string | null;
};

export type VentaPickupPublic = {
  idventa: number;
  estado: string;
  total: number;
  subtotal_productos: number;
  packaging_amount: number;
  packaging_label: string | null;
  cliente_nombre: string | null;
  fecha_retiro: string | null;
  fecha_retiro_label: string | null;
  codigo_retiro: string | null;
  estado_retiro?: string | null;
  pickup_address: string;
  pickup_hours: string;
  whatsapp: string;
  ticket_url?: string | null;
  tracking_url?: string | null;
  fulfillment_type?: FulfillmentType;
  delivery_amount?: number;
  delivery_address?: string | null;
  delivery_distance_km?: number | null;
  jobshours_request_id?: number | null;
  jobshours_delivery_url?: string | null;
  jobshours_publish_status?: string | null;
  jobshours_delivery_status?: string | null;
  jobshours_request_status?: string | null;
  jobshours_payment_status?: string | null;
  jobshours_publish_error?: string | null;
  whatsapp_delivery_url?: string | null;
};
