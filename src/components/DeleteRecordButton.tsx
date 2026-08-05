'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function DeleteRecordButton({ table, id, confirmText }: { table: string; id: string; confirmText: string }) {
  const router = useRouter();
  const supabase = createClient();

  async function handleDelete() {
    if (!confirm(confirmText)) return;
    await supabase.from(table).delete().eq('id', id);
    router.refresh();
  }

  return (
    <button onClick={handleDelete} className="text-xs text-red-600 underline">
      Eliminar
    </button>
  );
}
