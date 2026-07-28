'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function DeleteProductButton({ id }: { id: string }) {
  const router = useRouter();
  const supabase = createClient();

  async function handleDelete() {
    if (!confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) return;
    await supabase.from('products').delete().eq('id', id);
    router.refresh();
  }

  return (
    <button onClick={handleDelete} className="text-xs text-red-600 underline">
      Eliminar
    </button>
  );
}
