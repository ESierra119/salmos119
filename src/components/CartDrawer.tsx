'use client';

import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { buildWhatsAppCheckoutUrl, formatCOP } from '@/lib/whatsapp';

export function CartDrawer() {
  const { items, isOpen, closeCart, changeQty, removeItem, subtotal } = useCart();

  function handleCheckout() {
    if (items.length === 0) return;
    const url = buildWhatsAppCheckoutUrl(items);
    window.open(url, '_blank');
  }

  return (
    <>
      <div
        onClick={closeCart}
        className={`fixed inset-0 z-40 bg-ink/35 transition-opacity ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-[400px] flex-col bg-cream shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-goldPale px-5 py-4">
          <h3 className="font-display text-xl">Tu carrito</h3>
          <button onClick={closeCart} className="text-2xl leading-none text-inkSoft" aria-label="Cerrar carrito">
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center text-sm text-inkSoft">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#E4D3B4" strokeWidth="1.3" className="mb-3">
                <path d="M3 3h2l2.4 12.4a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L22 6H6" />
              </svg>
              <p>
                Tu carrito está vacío.
                <br />
                Agrega productos del catálogo.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-3 border-b border-goldPale py-4">
                <div className="flex h-[74px] w-[62px] flex-shrink-0 items-center justify-center overflow-hidden rounded bg-white">
                  {item.image_url ? (
                    <Image src={item.image_url} alt={item.name} width={62} height={74} className="h-full w-full object-contain p-1" />
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B08D57" strokeWidth="1.3">
                      <path d="M4 19.5V5a2 2 0 0 1 2-2h12v16.5" />
                    </svg>
                  )}
                </div>
                <div className="flex flex-1 flex-col">
                  <h4 className="text-[13.5px] font-medium">{item.name}</h4>
                  <div className="mb-2 text-[11px] text-inkSoft">{formatCOP(item.price)} c/u</div>
                  <div className="mt-auto flex items-center gap-2.5">
                    <button
                      onClick={() => changeQty(item.id, -1)}
                      className="flex h-[22px] w-[22px] items-center justify-center rounded-full border border-goldPale bg-white text-sm"
                    >
                      &minus;
                    </button>
                    <span className="min-w-[16px] text-center text-[13px]">{item.qty}</span>
                    <button
                      onClick={() => changeQty(item.id, 1)}
                      className="flex h-[22px] w-[22px] items-center justify-center rounded-full border border-goldPale bg-white text-sm"
                    >
                      +
                    </button>
                    <button onClick={() => removeItem(item.id)} className="ml-auto text-[11px] text-inkSoft underline">
                      Quitar
                    </button>
                  </div>
                </div>
                <div className="whitespace-nowrap font-display text-[13.5px]">{formatCOP(item.price * item.qty)}</div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-goldPale px-5 pb-6 pt-5">
          <div className="mb-1.5 flex justify-between text-[15px]">
            <span>Subtotal</span>
            <span className="font-display text-xl">{formatCOP(subtotal)}</span>
          </div>
          <p className="mb-4 text-[11px] leading-relaxed text-inkSoft">
            El envío y el precio final se confirman con tu asesor por WhatsApp.
          </p>
          <button
            onClick={handleCheckout}
            disabled={items.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded bg-whatsapp py-3.5 text-[13.5px] tracking-wide text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.87.5 3.63 1.44 5.14L2 22l5.13-1.55a9.86 9.86 0 0 0 4.9 1.28h.01c5.46 0 9.9-4.45 9.9-9.91C21.94 6.45 17.5 2 12.04 2zm5.9 14.16c-.25.7-1.45 1.34-2 1.42-.51.08-1.15.11-1.86-.12-.43-.14-.98-.32-1.68-.63-2.96-1.28-4.9-4.25-5.04-4.45-.15-.2-1.2-1.6-1.2-3.05 0-1.45.76-2.16 1.03-2.46.27-.3.6-.37.8-.37h.58c.18 0 .43-.03.66.5.25.6.85 2.05.92 2.2.07.15.12.32.02.52-.1.2-.15.32-.3.5-.15.17-.31.39-.44.52-.15.15-.3.31-.13.6.17.3.77 1.27 1.65 2.06 1.14 1.02 2.1 1.33 2.4 1.48.3.15.47.13.65-.08.18-.2.75-.87.95-1.17.2-.3.4-.25.66-.15.27.1 1.7.8 2 .95.3.15.5.22.57.35.08.13.08.75-.17 1.45z" />
            </svg>
            Enviar pedido por WhatsApp
          </button>
        </div>
      </aside>
    </>
  );
}
