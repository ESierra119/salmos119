'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function AdminTopbar({ title }: { title: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  }

  const isVentas = pathname?.startsWith('/admin/ventas');

  return (
    <div className="border-b border-goldPale bg-white">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Link href="/" className="text-xs text-inkSoft underline hover:text-goldDark">
            &larr; Ver tienda pública
          </Link>
          <h1 className="mt-1 font-display text-2xl">{title}</h1>
        </div>
        <button
          onClick={handleLogout}
          className="rounded border border-goldPale px-4 py-2 text-xs uppercase tracking-wider text-inkSoft hover:border-gold hover:text-goldDark"
        >
          Cerrar sesión
        </button>
      </div>
      <div className="flex gap-1 px-6">
        <Link
          href="/admin"
          className={`border-b-2 px-3 py-2.5 text-sm ${
            !isVentas ? 'border-gold text-ink' : 'border-transparent text-inkSoft hover:text-goldDark'
          }`}
        >
          Productos
        </Link>
        <Link
          href="/admin/ventas"
          className={`border-b-2 px-3 py-2.5 text-sm ${
            isVentas ? 'border-gold text-ink' : 'border-transparent text-inkSoft hover:text-goldDark'
          }`}
        >
          Ventas
        </Link>
      </div>
    </div>
  );
}
