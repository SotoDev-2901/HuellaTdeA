# Despliegue en Render

El archivo `render.yaml` (en la raíz) describe todo el despliegue: una base de datos PostgreSQL, la API (Node)
y el frontend (sitio estático). Render lo lee como **Blueprint**.

## 1. Antes de empezar

1. El código debe estar en `main` de GitHub.
2. **Correo (Brevo, gratis):** Render puede bloquear los puertos SMTP en el plan gratuito, por eso el despliegue
   usa la API HTTPS de Brevo.
   - Crea una cuenta en https://www.brevo.com.
   - En *Senders, Domains & Dedicated IPs* agrega y **verifica** el correo remitente (puede ser un Gmail).
   - En *SMTP & API → API Keys* crea una clave y guárdala.
3. **IA (opcional):** clave de Groq (https://console.groq.com). Sin ella las recomendaciones usan el catálogo por reglas
   y el simulador solo permite los ejemplos.
4. Elige una **contraseña de administrador** de al menos 10 caracteres.

## 2. Crear el Blueprint

1. En Render: **New → Blueprint** y conecta el repositorio `SotoDev-2901/HuellaTdeA` (rama `main`).
2. Render te pedirá los valores marcados como secretos. Rellena:
   | Variable | Valor |
   |---|---|
   | `ADMIN_PASSWORD` | la contraseña de administrador elegida |
   | `BREVO_API_KEY` | la clave de Brevo |
   | `MAIL_FROM` | `Huella TdeA <correo-verificado-en-brevo>` |
   | `AI_API_KEY` | la clave de Groq (opcional) |
   | `FRONTEND_URL` y `VITE_API_URL` | déjalas vacías por ahora (paso 3) |
3. Crea el Blueprint. Render levanta la base de datos, la API y el frontend.

## 3. Conectar frontend y API (una sola vez)

Las dos URLs públicas solo se conocen después del primer despliegue:

1. Copia la URL de `huellatdea-web` (ej. `https://huellatdea-web.onrender.com`) y ponla en la variable
   **`FRONTEND_URL`** del servicio `huellatdea-api`.
2. Copia la URL de `huellatdea-api` y ponla, **terminada en `/api`**, en la variable **`VITE_API_URL`** de
   `huellatdea-web` (ej. `https://huellatdea-api.onrender.com/api`).
3. Redespliega ambos servicios (*Manual Deploy → Deploy latest commit*). `VITE_API_URL` se incorpora al compilar,
   así que el frontend debe reconstruirse.

## 4. Qué hace el arranque de la API

`npm run start:render` ejecuta, en orden: migraciones → crea o actualiza el administrador
(`admin@correo.tdea.edu.co` con tu `ADMIN_PASSWORD`) → carga los datos de demostración **solo si la base no tiene
usuarios** y `SEED_DEMO=true` → inicia el servidor. Cambiar `ADMIN_PASSWORD` y redesplegar actualiza la contraseña.
Para no cargar datos de demostración, pon `SEED_DEMO=false`.

## 5. Verificación

- `https://<api>/health/db` debe responder `{"status":"ok","database":"ok"}`.
- Abre el frontend, inicia sesión con el administrador y con una cuenta de demostración (`Demo12345`).
- Regístrate con un correo `@correo.tdea.edu.co` real y confirma que llega el correo de verificación.

## 6. Límites del plan gratuito

- Los servicios web **se duermen** tras un rato sin uso: la primera visita puede tardar casi un minuto. Ábrela antes de
  una demostración.
- La base de datos gratuita tiene **vigencia limitada**; confirma el plazo vigente en el panel de Render y haz una
  copia si necesitas conservar datos.
- Los datos de demostración usan correos inventados: no recibirán mensajes.

## 7. Seguridad antes de compartir el enlace

- Usa una `ADMIN_PASSWORD` propia y no la de desarrollo.
- Genera claves **nuevas** de Brevo y Groq para producción; no reutilices las que se hayan compartido en chats o capturas.
- `JWT_SECRET` lo genera Render automáticamente. CORS solo acepta el dominio configurado en `FRONTEND_URL`.
