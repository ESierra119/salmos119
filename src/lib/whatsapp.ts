import type { CartItem } from '@/types/product';

export function formatCOP(value: number) {
  return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
}

export function buildWhatsAppCheckoutUrl(items: CartItem[]) {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  if (!number) {
    throw new Error('Falta configurar NEXT_PUBLIC_WHATSAPP_NUMBER en .env.local');
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  let message = 'Hola, quiero hacer un pedido en Salmos 119:\n\n';
  items.forEach((i) => {
    message += `• ${i.name} x${i.qty} - ${formatCOP(i.price * i.qty)}\n`;
  });
  message += `\nSubtotal: ${formatCOP(subtotal)}`;
  message += '\n(Envío y total final a confirmar con el asesor)';

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
