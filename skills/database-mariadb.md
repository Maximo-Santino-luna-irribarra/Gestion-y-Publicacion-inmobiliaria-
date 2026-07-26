# Base de datos MariaDB

Los modelos principales son User, RealEstateAgency, AgencyZone, Property, PropertyImage, PropertyFeature, Client, Inquiry y Appointment. Una inmobiliaria tiene zonas; una propiedad tiene imágenes/características y se relaciona con consultas/visitas; un cliente tiene consultas/visitas. Property usa eliminación lógica.

Ejecutar primero migraciones y luego seeders. Nunca activar `synchronize` en producción. Los índices cubren operación, tipo, estado, ubicación, precio, ambientes, dormitorios, destacada y publicación. En Hostinger crear usuario con privilegios sólo sobre su base, restringir origen si está disponible y programar copias diarias con prueba periódica de restauración.

