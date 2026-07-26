# Gestión de propiedades

El alta/edición tiene siete pasos: principal, ubicación, medidas, características, servicios, imágenes y revisión. El borrador temporal evita pérdidas. Estados: draft, available, reserved, sold, rented y paused. Publicar asigna `publishedAt`; vender o alquilar conserva historial.

Las imágenes admiten JPEG/PNG/WebP hasta 5 MB, portada, orden y alt. La base guarda URL/metadatos, nunca binarios. Eliminar usa soft delete; restaurar conserva relaciones. Duplicar genera referencia/slug únicos y vuelve a borrador. Ocultar campos irrelevantes según tipo antes de ampliar el formulario.

