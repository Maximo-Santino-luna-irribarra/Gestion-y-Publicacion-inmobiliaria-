# Consultas, clientes y visitas

Una consulta pública crea/reutiliza cliente por correo y comienza en `new`. Flujo: new → contacted → appointment_scheduled → negotiation → closed/discarded. Las notas internas nunca se exponen públicamente.

Una visita vincula propiedad y cliente. Estados: pending, confirmed, completed, cancelled, rescheduled y no_show. Reprogramar conserva trazabilidad mediante estado/notas. Las vistas de día, semana, próximas e historial son filtros por `scheduledAt`. Registrar último contacto al ampliar clientes.

