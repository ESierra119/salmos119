import type { Metadata } from 'next';
import { Cormorant_Garamond, Dancing_Script, Jost } from 'next/font/google';
import { CartProvider } from '@/context/CartContext';
import './globals.css';

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-display',
});
const script = Dancing_Script({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-script',
});
const body = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'Salmos 119 · Tienda Cristiana',
  description: 'Biblias, libros, devocionales y papelería cristiana. Inspiración · Fe · Propósito.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${display.variable} ${script.variable} ${body.variable} font-body`}>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
