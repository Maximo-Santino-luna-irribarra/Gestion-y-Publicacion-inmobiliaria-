# Arquitectura

El flujo obligatorio es `Angular → REST NestJS → Sequelize → MariaDB`. Angular nunca conoce credenciales ni accede a la base. `frontend/src/app` agrupa núcleo HTTP/autenticación, layouts y páginas lazy. `backend/src` separa controladores, servicios, DTOs, modelos y almacenamiento. `backend/database` contiene migraciones y seeders.

Los controladores traducen HTTP, los DTOs validan, los servicios implementan negocio y los modelos persisten. Las respuestas usan `{ success, data }`; los errores usan códigos HTTP y mensajes aptos para usuario. Nombres TypeScript en camelCase, tablas/columnas en snake_case, rutas REST en plural y commits pequeños.

