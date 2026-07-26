# Backend NestJS

La API se organiza por capacidades: autenticación, inmobiliaria, propiedades/imágenes, CRM y dashboard. Controladores reciben DTOs, servicios ejecutan negocio y Sequelize accede a MariaDB. JWT identifica al usuario; `JwtAuthGuard` protege escritura y administración. Swagger está en `/api/docs`.

Validar con class-validator, transformar parámetros con class-transformer y no devolver hashes ni excepciones internas. Usar paginación, límites máximos y ordenamientos permitidos. El proveedor de almacenamiento implementa `StorageProvider`; Cloudinary debe reemplazar sólo esa implementación.

