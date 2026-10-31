# Arquitectura de Bases de Datos — LÚMINA

LÚMINA implementa una capa de acceso a datos agnóstica del motor mediante el patrón Adaptador (`DatabaseAdapter`), permitiendo alternar sin fricción entre **SQLite** (para desarrollo local autónomo y pruebas automatizadas) y **PostgreSQL** (para producción y despliegues multiusuario).

---

## 1. Selección de Motor por Variables de Entorno

En el archivo `.env`:
```env
# Elegir: 'sqlite' o 'postgres'
DB_TYPE=sqlite
```

### Para SQLite:
```env
SQLITE_PATH=./database/sqlite/lumina.db
```

### Para PostgreSQL:
```env
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=lumina
PG_USER=postgres
PG_PASSWORD=tu_contraseña
PG_SSL=false
```

---

## 2. Esquemas de Base de Datos Equivalentes

Los esquemas residen en `server/src/db/schemas/`:
- `sqlite_schema.sql`
- `postgres_schema.sql`

Ambos mantienen paridad exacta en tablas, tipos de datos, restricciones, claves foráneas en cascada e índices:

| Tabla | Propósito | Regla de Aislamiento |
|---|---|---|
| `users` | Cuentas, correos y contraseñas hasheadas | Acceso personal |
| `user_preferences` | Tema, preferencias sensoriales y onboarding | Vinculada 1:1 con `users` |
| `mood_entries` | Registros emocionales, intensidades y factores | Aislada por `user_id` con CASCADE |
| `journal_entries` | Entradas privadas del diario íntimo | Confidencial, aislada por `user_id` |
| `music_tracks` | Pistas acústicas y presets de paisajes Web Audio | Contenido público curado |
| `music_favorites` | Relación N:M de favoritos del usuario | Aislada por `user_id` |
| `wellness_activities` | Catálogo de ejercicios y guías paso a paso | Contenido público curado |
| `activity_history` | Registro de actividades completadas por usuario | Aislada por `user_id` |
| `support_resources` | Directorio de líneas telefónicas de ayuda y crisis | Recursos oficiales verificados |

---

## 3. Comandos de Inicialización y Migración

### Para SQLite (Ejecución local inmediata sin servidor externo):
```bash
# Desde la carpeta raíz
npm run db:init:sqlite

# O desde server
npm run db:init:sqlite --prefix server
```

### Para PostgreSQL (Requiere servidor PostgreSQL en ejecución):
```bash
# 1. Crear base de datos en postgres:
# createdb lumina

# 2. Configurar .env con DB_TYPE=postgres y credenciales

# 3. Ejecutar migración y seed:
npm run db:init:postgres
```

---

## 4. Traducción Transparente de Parámetros

El adaptador de PostgreSQL (`postgresAdapter.js`) convierte automáticamente los marcadores `?` en `$1, $2, $3...` en tiempo de ejecución. Esto permite que todos los controladores y consultas parametrizadas se escriban de forma unificada sin duplicar código de negocio.
