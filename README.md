# Salmos 119 · Tienda Cristiana

Catálogo público + carrito + checkout por WhatsApp + panel de administrador,
construido con Next.js y Supabase. Se despliega gratis en Vercel.

## 1. Crear el proyecto en Supabase

1. Ve a https://supabase.com y crea una cuenta / inicia sesión.
2. **New project** → ponle un nombre (ej. `salmos119`) → elige una contraseña de base de datos → espera a que se cree (1-2 min).
3. Ve a **SQL Editor** → **New query**, pega todo el contenido del archivo `supabase/schema.sql` de este proyecto, y dale **Run**.
   Esto crea las tablas de productos y categorías, las reglas de seguridad, y el bucket de almacenamiento para las fotos.
4. Ve a **Project Settings → API**. Copia:
   - `Project URL`
   - `anon public` key

## 2. Crear tu usuario administrador

1. En Supabase, ve a **Authentication → Users → Add user**.
2. Crea un usuario con tu correo y una contraseña segura. Esa será tu cuenta para entrar a `/admin`.
   (No hay registro público — solo tú puedes crear usuarios administradores desde aquí.)

## 3. Configurar el proyecto localmente

```bash
npm install
cp .env.local.example .env.local
```

Abre `.env.local` y pega los valores reales:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
NEXT_PUBLIC_WHATSAPP_NUMBER=573001234567
```

`NEXT_PUBLIC_WHATSAPP_NUMBER` es el número del asesor que recibirá los pedidos —
indicativo de país + número, sin espacios ni símbolos.

Corre el proyecto:

```bash
npm run dev
```

Abre http://localhost:3000 para la tienda, y http://localhost:3000/admin para el panel
(te pedirá el correo y contraseña que creaste en el paso 2).

## 4. Subir a GitHub (cuenta esierra119)

Desde la carpeta del proyecto:

```bash
git init
git add .
git commit -m "Primera versión de Salmos 119"
git branch -M main
git remote add origin https://github.com/esierra119/salmos119.git
git push -u origin main
```

Si el repo `salmos119` todavía no existe en tu cuenta, créalo primero en
https://github.com/new (sin agregar README, para que no choque con este).

## 5. Desplegar en Vercel

1. Ve a https://vercel.com → **Add New → Project** → conecta tu cuenta de GitHub → elige el repo `salmos119`.
2. En **Environment Variables**, agrega las mismas 3 variables de tu `.env.local`.
3. Dale **Deploy**. En 1-2 minutos tendrás una URL pública (`salmos119.vercel.app`).
4. Para tu dominio propio: **Project Settings → Domains** → agrega tu dominio y sigue las
   instrucciones de DNS que te da Vercel.

## Cómo se administra el catálogo

- Entra a `/admin` con tu correo y contraseña.
- **+ Agregar producto**: nombre, descripción, precio, categoría, stock, foto — todo desde el navegador, sin tocar código.
- Puedes editar o eliminar cualquier producto, y ocultarlo de la tienda pública desactivando "Visible en la tienda pública" en vez de borrarlo.
- Las categorías (Biblias, Libros y devocionales, Papelería) están en la tabla `categories` de Supabase.
  Si quieres agregar una nueva categoría, por ahora se hace desde Supabase → Table Editor → categories → Insert row
  (en una siguiente fase se puede agregar esto también al panel).

## Estructura del proyecto

```
src/
  app/
    page.tsx              → catálogo público (Server Component, lee de Supabase)
    admin/
      login/page.tsx       → login del administrador
      page.tsx             → dashboard con la lista de productos
      productos/nuevo/     → formulario de creación
      productos/[id]/      → formulario de edición
  components/              → Header, ProductCard, CartDrawer, ProductForm, etc.
  context/CartContext.tsx  → estado del carrito (en memoria, por sesión de navegador)
  lib/
    supabase/              → clientes de Supabase (browser y server)
    whatsapp.ts             → arma el link de checkout wa.me
  middleware.ts             → protege /admin, redirige a /admin/login si no hay sesión
supabase/schema.sql          → tablas, seguridad (RLS) y bucket de imágenes
```

## Siguientes pasos sugeridos

- Agregar más fotos y variantes de producto según crezca el catálogo.
- Métricas simples (cuántas veces se agregó cada producto al carrito) si más adelante quieres saber qué se mueve más.
- Un campo de "destacado" para resaltar productos en la página de inicio.
