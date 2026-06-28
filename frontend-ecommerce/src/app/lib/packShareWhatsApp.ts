import { toCLP } from './money';

export const WHATSAPP_DM = '56975647756';
export const PICKUP_ADDRESS = 'Santiago Watt 205, Renaico';

export type PackSharePayload = {
  nombre: string;
  precio?: number | null;
  siempre_incluye?: string[];
  idproducto?: number | null;
  ocasion?: string;
};

export function packWebLink(payload: PackSharePayload): string {
  const base =
    typeof window !== 'undefined' ? window.location.origin : 'https://dondemorales.cl';
  if (payload.idproducto) {
    return `${base}/producto/${payload.idproducto}`;
  }
  if (payload.ocasion && payload.ocasion !== 'todos') {
    return `${base}/regalos?ocasion=${encodeURIComponent(payload.ocasion)}`;
  }
  return `${base}/regalos`;
}

export function buildPackWhatsAppMessage(payload: PackSharePayload): string {
  const lines: string[] = [
    `🎁 *${payload.nombre}* — DondeMorales`,
  ];

  if (payload.precio != null && payload.precio > 0) {
    lines.push(`💰 ${toCLP(payload.precio)}`);
  }

  const incluye = payload.siempre_incluye ?? [];
  if (incluye.length > 0) {
    lines.push('', '*Incluye:*');
    incluye.slice(0, 8).forEach((item) => lines.push(`• ${item}`));
    if (incluye.length > 8) {
      lines.push(`• y ${incluye.length - 8} ítems más`);
    }
  }

  lines.push(
    '',
    `📍 Retiro: ${PICKUP_ADDRESS}`,
    'Envío gratis packs regalo en Renaico.',
    '',
    `Reservar: ${packWebLink(payload)}`,
  );

  return lines.join('\n');
}

export function packWhatsAppHref(payload: PackSharePayload): string {
  return `https://wa.me/${WHATSAPP_DM}?text=${encodeURIComponent(buildPackWhatsAppMessage(payload))}`;
}
