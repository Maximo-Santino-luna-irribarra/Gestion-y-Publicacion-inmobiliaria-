# Despliegue en Hostinger

1. Crear MariaDB y usuario; completar variables del backend.
2. Ejecutar `pnpm install --frozen-lockfile`, `pnpm db:migrate`, opcionalmente el seeder inicial, y `pnpm build`.
3. Publicar `backend/dist`, dependencias de producción y `uploads`; iniciar `node dist/main.js` con el gestor Node disponible.
4. Ejecutar build Angular y publicar `frontend/dist/frontend/browser`; configurar fallback a `index.html`.
5. Usar dominio para web y subdominio o proxy `/api` para Nest; ajustar `FRONTEND_URL`, certificado TLS y CORS.
6. Reemplazar URLs del sitemap, comprobar login, upload persistente, formularios, permisos de carpeta, migraciones y backups.

No todos los planes compartidos ejecutan Node. Si el plan no lo permite, desplegar frontend estático en Hostinger y API Nest en un servicio Node compatible, manteniendo MariaDB de Hostinger. No exponer Swagger en producción si no es necesario.
