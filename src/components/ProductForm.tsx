'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import type { Category, Product, ProductImage } from '@/types/product';

export function ProductForm({
  categories,
  product,
  initialExtraImages = [],
}: {
  categories: Category[];
  product?: Product;
  initialExtraImages?: ProductImage[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState(product?.name ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [price, setPrice] = useState(product?.price?.toString() ?? '');
  const [categoryId, setCategoryId] = useState(product?.category_id ?? categories[0]?.id ?? '');
  const [stock, setStock] = useState(product?.stock?.toString() ?? '0');
  const [active, setActive] = useState(product?.active ?? true);
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? '');
  const [extraImages, setExtraImages] = useState<ProductImage[]>(initialExtraImages);
  const [uploading, setUploading] = useState(false);
  const [uploadingExtra, setUploadingExtra] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadFile(file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, file);
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
    return data.publicUrl;
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadFile(file);
      setImageUrl(url);
    } catch (err) {
      setError('No se pudo subir la imagen: ' + (err as Error).message);
    }
    setUploading(false);
  }

  async function handleExtraImagesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0 || !product) return;
    setUploadingExtra(true);
    setError(null);

    try {
      for (const file of Array.from(files)) {
        const url = await uploadFile(file);
        const { data, error: insertError } = await supabase
          .from('product_images')
          .insert({ product_id: product.id, image_url: url, sort_order: extraImages.length })
          .select()
          .single();
        if (insertError) throw insertError;
        setExtraImages((prev) => [...prev, data as ProductImage]);
      }
    } catch (err) {
      setError('No se pudo subir alguna imagen: ' + (err as Error).message);
    }
    setUploadingExtra(false);
    e.target.value = '';
  }

  async function handleRemoveExtraImage(id: string) {
    await supabase.from('product_images').delete().eq('id', id);
    setExtraImages((prev) => prev.filter((i) => i.id !== id));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      name,
      description,
      price: Number(price),
      category_id: categoryId || null,
      stock: Number(stock),
      active,
      image_url: imageUrl || null,
    };

    if (product) {
      const { error } = await supabase.from('products').update(payload).eq('id', product.id);
      setSaving(false);
      if (error) {
        setError('No se pudo guardar: ' + error.message);
        return;
      }
      router.push('/admin');
      router.refresh();
    } else {
      const { data, error } = await supabase.from('products').insert(payload).select().single();
      setSaving(false);
      if (error) {
        setError('No se pudo guardar: ' + error.message);
        return;
      }
      // Llevamos al usuario a editar el producto recién creado, donde ya puede agregar fotos adicionales.
      router.push(`/admin/productos/${data.id}`);
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-5 px-6 py-8">
      <div>
        <label className="mb-1 block text-xs text-inkSoft">Nombre del producto</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded border border-goldPale px-3 py-2.5 text-sm outline-none focus:border-gold"
          placeholder='Ej: Biblia Inspira NTV · Lavanda'
        />
      </div>

      <div>
        <label className="mb-1 block text-xs text-inkSoft">Descripción corta</label>
        <textarea
          value={description ?? ''}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded border border-goldPale px-3 py-2.5 text-sm outline-none focus:border-gold"
          placeholder="Tapa dura, diseño elegante, cinta marcadora..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs text-inkSoft">Precio (COP)</label>
          <input
            required
            type="number"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded border border-goldPale px-3 py-2.5 text-sm outline-none focus:border-gold"
            placeholder="185000"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-inkSoft">Stock</label>
          <input
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="w-full rounded border border-goldPale px-3 py-2.5 text-sm outline-none focus:border-gold"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs text-inkSoft">Categoría</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full rounded border border-goldPale px-3 py-2.5 text-sm outline-none focus:border-gold"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs text-inkSoft">Foto principal</label>
        <p className="mb-1.5 text-[11px] text-inkSoft">Esta es la que se ve en las tarjetas del catálogo.</p>
        <input type="file" accept="image/*" onChange={handleImageChange} className="text-sm" />
        {uploading && <p className="mt-1 text-xs text-inkSoft">Subiendo imagen...</p>}
        {imageUrl && (
          <Image
            src={imageUrl}
            alt="Vista previa"
            width={100}
            height={120}
            className="mt-3 rounded border border-goldPale object-contain bg-white p-1"
          />
        )}
      </div>

      <div>
        <label className="mb-1 block text-xs text-inkSoft">Fotos adicionales</label>
        {product ? (
          <>
            <p className="mb-2 text-[11px] text-inkSoft">
              Se muestran como miniaturas en la página de detalle del producto. Puedes subir varias a la vez.
            </p>
            <input type="file" accept="image/*" multiple onChange={handleExtraImagesChange} className="text-sm" />
            {uploadingExtra && <p className="mt-1 text-xs text-inkSoft">Subiendo imágenes...</p>}
            {extraImages.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-3">
                {extraImages.map((img) => (
                  <div key={img.id} className="relative">
                    <Image
                      src={img.image_url}
                      alt="Foto adicional"
                      width={80}
                      height={96}
                      className="rounded border border-goldPale object-contain bg-white p-1"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExtraImage(img.id)}
                      className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-xs text-white"
                      aria-label="Quitar imagen"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <p className="rounded border border-dashed border-goldPale px-3 py-2.5 text-[12px] text-inkSoft">
            Guarda el producto primero — después de crearlo podrás volver a editarlo para agregar fotos adicionales.
          </p>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
        Visible en la tienda pública
      </label>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving || uploading}
          className="rounded bg-ink px-6 py-3 text-sm tracking-wide text-cream hover:bg-goldDark disabled:opacity-60"
        >
          {saving ? 'Guardando...' : product ? 'Guardar cambios' : 'Crear producto'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin')}
          className="rounded border border-goldPale px-6 py-3 text-sm text-inkSoft hover:border-gold"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
