# Horizonte Propiedades

Aplicación web full stack para una inmobiliaria ficticia de zona sur. Incluye catálogo público con filtros/favoritos/consultas y panel privado para propiedades, imágenes, clientes, visitas y configuración.

## Stack y arquitectura

Angular standalone + TypeScript estricto + Tailwind CSS → API REST NestJS + JWT + Swagger → Sequelize (`sequelize-typescript`) → MariaDB/MySQL. Las imágenes usan almacenamiento desacoplado y MariaDB conserva sólo URL y metadatos.

## Requisitos

- Node.js 22 LTS recomendado (el entorno de desarrollo también debe ser compatible con Angular)
- pnpm 10+
- MariaDB 10.6+ o MySQL 8

## Instalación

```bash
cp backend/.env.example backend/.env
cd backend && pnpm install
cd ../frontend && pnpm install
```

Complete `backend/.env`; nunca confirme ese archivo. Variables esenciales:

```dotenv
DB_HOST=localhost
DB_PORT=3306
DB_NAME=inmobiliaria
DB_USER=inmobiliaria_user
DB_PASSWORD=una-clave-segura
JWT_SECRET=un-secreto-largo-y-aleatorio
FRONTEND_URL=http://localhost:4200
WHATSAPP_NUMBER=5491140000000
```

## Base de datos

```bash
mysql -u root -p -e "CREATE DATABASE inmobiliaria CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
cd backend
pnpm db:migrate
pnpm db:seed
```

El seeder crea exclusivamente datos ficticios. Acceso demo: `admin@horizonte.test` / `Horizonte123!`. Cambie esa contraseña antes de publicar.

## Desarrollo y producción

```bash
# terminal 1
cd backend && pnpm start:dev
# terminal 2
cd frontend && pnpm start

# builds
cd backend && pnpm build
cd frontend && pnpm build
```

Web: `http://localhost:4200`; API: `http://localhost:3000/api`; Swagger: `http://localhost:3000/api/docs`. Para pruebas: `pnpm test`, `pnpm test:e2e` y `pnpm lint` en el proyecto correspondiente.

## Estructura

```text
inmobiliaria-app/
├── frontend/   # Angular público y panel
├── backend/    # NestJS, API, migraciones y seeders
├── skills/     # memoria técnica y reglas del proyecto
├── README.md
└── .gitignore
```

## Imágenes

`StorageProvider` abstrae el destino. La implementación inicial escribe en `backend/uploads`; para Hostinger monte una ruta persistente y publique `/uploads`. Para Cloudinary implemente el mismo contrato y cambie el provider en Nest, sin tocar propiedades ni controladores.

## Despliegue Hostinger

Compile Angular y publique `frontend/dist/frontend/browser` con fallback SPA. Configure MariaDB desde el panel, ejecute migraciones desde un entorno autorizado y despliegue `backend/dist` en un plan con Node.js. Si el plan compartido no ejecuta procesos Node, aloje NestJS en un proveedor Node y mantenga la base en Hostinger. Active HTTPS, ajuste `FRONTEND_URL`, proxy/dominio de API, permisos persistentes de uploads y backups. La guía detallada está en `skills/deployment-hostinger.md`.

## Decisiones pendientes de infraestructura

Antes de producción hay que definir credenciales MariaDB, dominio real, número WhatsApp, persistencia pública de uploads y proveedor de mapas. El mapa actual muestra ubicación aproximada y queda listo para conectar un proveedor sin revelar direcciones exactas.
