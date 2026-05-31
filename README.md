# Homenaje a Boca Juniors 💙💛

Este es un proyecto web no oficial creado por y para hinchas del Club Atlético Boca Juniors, el único grande.

## Características 🚀

- **Palmarés Histórico:** Listado completo de títulos nacionales e internacionales.
- **Ídolos y Leyendas:** Ranking de los jugadores, goleadores y técnicos más ganadores de la historia del club.
- **Plantel en Vivo:** Información del plantel y director técnico actualizada de forma automática conectada a la API de fútbol.
- **Secciones Históricas:** La Bombonera, La 12, El Superclásico y nuestra historia.

## Arquitectura y Tecnologías 🛠️

- **Frontend:** HTML5, CSS3, Vanilla JavaScript. Alojado en **Firebase Hosting**.
- **Backend (Automatización):** Node.js, Express, Docker. Alojado en **Google Cloud Run**.
- **Base de Datos / Caché:** JSON estático en **Google Cloud Storage**.
- **Activador:** **Google Cloud Scheduler** (Cron Job automatizado diario).
- **Datos:** [API-Football](https://www.api-football.com/).

## Instalación Local 💻

Para correr el proyecto localmente, simplemente abre el archivo `index.html` (o usa una extensión como Live Server en VS Code) dentro de la carpeta `public` o el directorio raíz de la web.

*“La Bombonera no tiembla, late.”*