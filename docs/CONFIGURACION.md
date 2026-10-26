# Configuración de correo real e IA

Ambas funciones se activan con variables de entorno en el archivo `.env` de la raíz (no se versiona).
Sin ellas el sistema sigue funcionando: los correos van a Mailpit y las recomendaciones usan un catálogo por reglas.

## Correo real (SMTP)

```env
MAIL_HOST=smtp.office365.com      # o smtp.gmail.com, smtp.sendgrid.net, etc.
MAIL_PORT=587
MAIL_SECURE=false                 # true solo para el puerto 465
MAIL_USER=cuenta@dominio.edu.co
MAIL_PASSWORD=contraseña-o-app-password
MAIL_FROM="Huella TdeA <cuenta@dominio.edu.co>"
```

- Con `MAIL_USER` definido se autentica contra el proveedor y los correos de verificación y recuperación llegan a los buzones reales (`@correo.tdea.edu.co`).
- Sin `MAIL_USER` se usa Mailpit (http://localhost:8025), útil en desarrollo.
- Gmail y Office 365 suelen exigir una "contraseña de aplicación" o habilitar SMTP autenticado; en una cuenta institucional lo gestiona el área de TI.
- Las pruebas automatizadas de autenticación leen el correo desde Mailpit: córrelas con el valor por defecto.

## Recomendaciones con IA (gratis con Groq)

Usa cualquier proveedor con API compatible con OpenAI. Por defecto es **Groq**, que ofrece un plan gratuito sin tarjeta de crédito:

1. Crea una cuenta en https://console.groq.com y genera una API key.
2. Agrégala al `.env` y reinicia el backend (`docker compose up -d backend`):

```env
AI_API_KEY=gsk_...
# Opcionales (valores por defecto):
AI_BASE_URL=https://api.groq.com/openai/v1
AI_MODEL=openai/gpt-oss-120b
```

Otras opciones gratuitas: OpenRouter (`AI_BASE_URL=https://openrouter.ai/api/v1`, modelos con sufijo `:free`) o la API de Gemini en modo compatible con OpenAI (`https://generativelanguage.googleapis.com/v1beta/openai`). Los límites del plan gratuito cambian con el tiempo; revísalos en la consola del proveedor.

- El endpoint `GET /api/questionnaire/recommendations` envía solo los hábitos y la huella de la última respuesta (sin nombre ni correo) y pide 3 recomendaciones, una por categoría.
- El resultado se guarda en memoria por respuesta, así que cada respuesta del cuestionario consulta a la IA una sola vez (importa por los límites del plan gratuito).
- Sin clave, o si la API falla o responde 429, devuelve el catálogo por reglas (`source: "rules"`) y la interfaz sigue mostrando recomendaciones.

## Datos de demostración

```bash
docker compose exec backend npm run seed:demo
```

Borra zonas, usuarios no administradores y todos sus registros, y crea 120 estudiantes y 25 docentes (contraseña `Demo12345`) con hasta 12 meses de cuestionarios, más 10 zonas con 24 meses de consumo y residuos. Los datos son deterministas: cada ejecución genera lo mismo.

## Proveedor de correo por API (Brevo)

Donde el hosting bloquea SMTP (por ejemplo, algunos planes gratuitos) se puede enviar por la API HTTPS de Brevo:

```env
MAIL_PROVIDER=brevo
BREVO_API_KEY=xkeysib-...
MAIL_FROM="Huella TdeA <remitente-verificado@dominio.co>"
```

El remitente debe estar verificado en Brevo. Ver [DESPLIEGUE_RENDER.md](DESPLIEGUE_RENDER.md).
