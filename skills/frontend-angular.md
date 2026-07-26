# Frontend Angular

Usar componentes standalone, TypeScript estricto y rutas lazy. Los servicios de `core.ts` encapsulan HttpClient; el interceptor adjunta JWT y el guard protege `/admin`. Signals representan estado local de pantalla; RxJS conserva flujos HTTP. Formularios reactivos contienen validación y mensajes legibles. Los parámetros de filtros viven en la URL.

Tailwind se carga desde `styles.css`; los tokens CSS mantienen identidad. Evitar `any`, suscripciones anidadas y acceso directo a almacenamiento fuera de servicios. El estado durable mínimo es token y favoritos; el borrador del formulario usa `sessionStorage`.

