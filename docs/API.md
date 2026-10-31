# Documentación de la API REST — LÚMINA

La API de **LÚMINA** está construida sobre Node.js y Express, siguiendo principios REST, cabeceras seguras y autenticación basada en tokens JWT con autorización estricta por usuario.

---

## 1. Convenciones y Cabeceras

- **Formato de datos:** JSON (`application/json`).
- **Autenticación:** Enviar token JWT en cabecera HTTP:
  ```http
  Authorization: Bearer <token_jwt>
  ```
- **Códigos de estado:**
  - `200 OK`: Consulta o modificación exitosa.
  - `201 Created`: Recurso creado satisfactoriamente.
  - `400 Bad Request`: Datos de entrada inválidos o faltantes.
  - `401 Unauthorized`: Token no provisto o inválido.
  - `403 Forbidden`: Recurso restringido (ej. requiere rol de administrador).
  - `404 Not Found`: Recurso no encontrado o no perteneciente al usuario solicitante.
  - `429 Too Many Requests`: Límite de tasa excedido en rutas sensibles.
  - `500 Internal Server Error`: Error no controlado del servidor (sin filtración de datos sensibles).

---

## 2. Endpoints de Autenticación (`/api/auth`)

### `POST /api/auth/register`
Registra un nuevo usuario y crea sus preferencias iniciales.
- **Body:**
  ```json
  {
    "email": "usuario@ejemplo.com",
    "password": "PasswordSegura2026!",
    "display_name": "Nombre o Alias"
  }
  ```
- **Respuesta (201):** Objeto de usuario, token JWT y preferencias.

### `POST /api/auth/login`
Inicia sesión con credenciales existentes.
- **Body:**
  ```json
  {
    "email": "usuario@ejemplo.com",
    "password": "PasswordSegura2026!"
  }
  ```
- **Respuesta (200):** Objeto de usuario, token JWT y preferencias.

### `POST /api/auth/logout`
Cierra la sesión del cliente.
- **Respuesta (200):** Mensaje de confirmación.

### `GET /api/auth/me`
Obtiene los datos del usuario autenticado actual y sus preferencias.
- **Autenticación requerida:** Sí.

---

## 3. Endpoints de Usuario (`/api/users`)

### `GET /api/users/me`
Obtiene perfil y preferencias del usuario activo.

### `PATCH /api/users/me`
Actualiza nombre para mostrar, contraseña y/o preferencias sensoriales y de accesibilidad.

### `DELETE /api/users/me`
Elimina permanentemente la cuenta del usuario y **todos sus datos en cascada** (diario, emociones, historial, preferencias). Requiere contraseña de confirmación.

### `GET /api/users/export`
Exporta en formato JSON estructurado todos los datos personales del usuario (Derecho a la Portabilidad de Datos).

---

## 4. Endpoints de Estado Emocional (`/api/moods`)

### `GET /api/moods`
Lista registros emocionales con paginación y filtros opcionales.
- **Query params:** `?emotion=Ansiedad&from=2026-10-01&to=2026-10-31&page=1&limit=50`

### `POST /api/moods`
Crea un nuevo registro emocional.
- **Body:**
  ```json
  {
    "emotions": ["Ansiedad", "Agotamiento"],
    "intensity": 4,
    "factors": ["Trabajo / Estudio", "Falta de sueño"],
    "context_note": "Nota opcional del usuario",
    "helpful_activities": ["Respiración guiada", "Música suave"],
    "post_action": "respirar"
  }
  ```

### `GET /api/moods/:id`
Obtiene un registro específico (restringido al usuario propietario).

### `PATCH /api/moods/:id`
Actualiza un registro existente del usuario.

### `DELETE /api/moods/:id`
Elimina un registro emocional del usuario.

### `GET /api/moods/statistics`
Calcula estadísticas personales no diagnósticas (totales, promedio de intensidad, distribución de emociones, factores más frecuentes).

---

## 5. Endpoints de Diario Privado (`/api/journal`)

*Compromiso ético:* Las entradas de diario jamás son leídas por administradores, ni enviadas a modelos de IA o analíticas externas.

### `GET /api/journal`
Lista entradas con búsqueda y filtros.
- **Query params:** `?search=calma&mood=Tranquilidad&favorite=true&page=1&limit=20`

### `POST /api/journal`
Crea una nueva página de diario o guarda un borrador.

### `GET /api/journal/:id`
Obtiene el contenido completo de una entrada (estrictamente aislado al autor).

### `PATCH /api/journal/:id`
Actualiza el contenido o estado de la entrada.

### `PATCH /api/journal/:id/favorite`
Alterna el estado favorito de la entrada.

### `DELETE /api/journal/:id`
Elimina permanentemente la entrada.

---

## 6. Endpoints de Música y Paisajes Sonoros (`/api/music`)

### `GET /api/music`
Lista pistas activas y paisajes sonoros procedurales Web Audio.

### `GET /api/music/categories`
Lista categorías disponibles (Lluvia, Bosque, Piano, etc.).

### `GET /api/music/favorites`
Lista pistas favoritas del usuario autenticado.

### `POST /api/music/favorites/:trackId`
Añade una pista a favoritos.

### `DELETE /api/music/favorites/:trackId`
Remueve una pista de favoritos.

---

## 7. Endpoints de Actividades de Bienestar (`/api/activities`)

### `GET /api/activities`
Lista actividades guiadas (respiración, anclaje 5-4-3-2-1, relajación corporal, orden de pensamientos).

### `POST /api/activities/complete`
Registra la finalización de una actividad en el historial del usuario.

### `GET /api/activities/history`
Consulta el historial de actividades realizadas por el usuario.

---

## 8. Endpoints de Apoyo y Crisis (`/api/support`)

### `GET /api/support`
Lista líneas gratuitas y oficiales de ayuda en crisis emocional.
- **Query params:** `?country_code=AR&emergency=true`

### `GET /api/support/countries`
Lista países con servicios registrados.

---

## 9. Endpoints de Administración (`/api/admin`)

*Requiere autenticación y rol `admin`.*

### `GET /api/admin/metrics`
Métricas agregadas numéricas (total de usuarios, registros de ánimo, etc.).
**Garantía de privacidad:** Los administradores tienen prohibido y bloqueado a nivel de arquitectura el acceso al contenido de los diarios privados y notas personales.

### `POST /api/admin/activities`, `PATCH /api/admin/activities/:id`, `DELETE /api/admin/activities/:id`
CRUD de actividades de bienestar.

### `POST /api/admin/music`, `PATCH /api/admin/music/:id`, `DELETE /api/admin/music/:id`
CRUD de pistas musicales y paisajes sonoros.

### `POST /api/admin/support`, `PATCH /api/admin/support/:id`, `DELETE /api/admin/support/:id`
CRUD de recursos de apoyo comunitario.
