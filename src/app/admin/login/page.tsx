'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) {
      setError('Correo o contraseña incorrectos.');
      return;
    }
    router.push('/admin');
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded border border-goldPale bg-white p-8">
        <div className="mb-6 text-center">
          <div className="font-script text-2xl">Salmos 119</div>
          <p className="mt-1 text-xs uppercase tracking-wider text-inkSoft">Panel de administrador</p>
        </div>

        <label className="mb-1 block text-xs text-inkSoft">Correo</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded border border-goldPale px-3 py-2.5 text-sm outline-none focus:border-gold"
          placeholder="tu@correo.com"
        />

        <label className="mb-1 block text-xs text-inkSoft">Contraseña</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-5 w-full rounded border border-goldPale px-3 py-2.5 text-sm outline-none focus:border-gold"
          placeholder="••••••••"
        />

        {error && <p className="mb-4 text-xs text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-ink py-3 text-sm tracking-wide text-cream transition hover:bg-goldDark disabled:opacity-60"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
