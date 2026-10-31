# 🌙 LÚMINA — Un Espacio Para Volver a Vos

> **Plataforma web de bienestar emocional, autorreflexión íntima y refugio digital personal.**  
> Diseñada para comprender emociones, transitar momentos de ansiedad o sobrecarga, escribir con privacidad absoluta, escuchar paisajes sonoros generativos y practicar ejercicios de calma consciente.

---

## 1. Descripción del Proyecto

**LÚMINA** es una aplicación web full-stack profesional concebida como un refugio digital: íntimo, elegante, misterioso, moderno y tranquilo. No es un videojuego ni una página estática, sino un entorno interactivo y accesible pensado con rigor técnico, seguridad y compromiso ético.

La estética visual se basa en una cuidada paleta en tonos carbón (`#101311`), bosque oscuro (`#172820`), esmeralda (`#28664B`), verde suave (`#A4CBB3`) y blanco cálido (`#F1F1EB`), con iluminación difusa inspirada en la luna, las estrellas y la calma de la naturaleza.

---

## 2. Características y Módulos Principales

1. **Experiencia de Bienvenida y Onboarding Respetuoso:**
   - Presentación inmersiva y poética.
   - Proceso de bienvenida opcional con 3 preguntas orientativas no diagnósticas.
   - Respeto irrestricto por la autonomía del usuario (sin etiquetas clínicas automáticas).

2. **Panel Principal (Mi Espacio):**
   - Saludo contextual según la hora del día y fecha actual en español.
   - 8 tarjetas de acceso directo y atajo de pausa emocional rápida.

3. **Módulo de Emociones (Mood Tracker):**
   - Registro de 12 emociones fundamentales (Alegría, Tranquilidad, Tristeza, Ansiedad, Estrés, Enojo, Miedo, Confusión, Soledad, Agotamiento, Esperanza, Gratitud).
   - Escala subjetiva de intensidad del 1 al 5.
   - Factores desencadenantes asociados y notas íntimas.
   - Modal post-registro con alternativas de acompañamiento inmediato.

4. **Historial Emocional y Estadísticas:**
   - Visualización en calendario, línea de tiempo y frecuencias.
   - Filtros dinámicos por fecha y emoción.
   - Promedios y correlación de factores (sin pretensiones clínicas o diagnósticas).
   - Exportación de registros propios.

5. **Diario Emocional Privado (Journal):**
   - Cuaderno íntimo confidencial con soporte para borradores y favoritos.
   - Preguntas reflexivas de apoyo opcionales.
   - Aislamiento estricto por usuario: los datos están cifrados en tránsito y jamás son accesibles por administradores ni terceros.

6. **Música y Paisajes Sonoros Procedurales:**
   - Reproductor integrado con persistencia global en toda la aplicación.
   - Paisajes sonoros generados mediante la **Web Audio API** (Lluvia serena, Bosque y viento, Río manso, Olas oceánicas, Armónicos celestiales para meditar y Noche estrellada).
   - Funciona 100% offline sin licencias restringidas ni dependencias de audio externas que puedan romperse.
   - Control de volumen, progreso, categorías y favoritos.

7. **Respiración y Ejercicios Guiados:**
   - Círculo de respiración animado suave con tiempos ajustables.
   - Patrones incluidos: Respiración Suave (4-4), Respiración Cuadrada / Box (4-4-4-4) y Calma Profunda (4-7-8).
   - Finalización voluntaria en cualquier momento y registro en historial de bienestar.

8. **Actividades de Bienestar Interactivas:**
   - Técnica de anclaje sensorial 5-4-3-2-1.
   - Relajación corporal y escaneo muscular consciente.
   - Espacio para ordenar y categorizar pensamientos.
   - Guía para acercarse a una persona de confianza.

9. **Mi Refugio:**
   - Recomendaciones contextuales de actividades, lecturas o música acordes a la emoción que la persona decida compartir.

10. **Apoyo Humano y Seguridad Emocional:**
    - Directorio con números de emergencia y líneas de prevención de crisis en salud mental reales y verificadas (Argentina, España, México, Colombia, Chile, Estados Unidos e Internacional).
    - Botones de discado directo inmediato (`tel:...`) para situaciones de riesgo.

11. **Perfil, Portabilidad y Privacidad:**
    - Ajustes de accesibilidad (soporte de preferencia de movimiento reducido y modo alto contraste).
    - Descarga completa de datos en formato abierto JSON.
    - Eliminación definitiva de cuenta con confirmación de contraseña y borrado en cascada.

12. **Panel de Administración con Barrera Ética:**
    - Acceso restringido a usuarios con rol `admin`.
    - Métricas globales de uso y gestión de actividades, pistas y recursos.
    - **Barrera ética activa:** Los administradores tienen bloqueado el acceso a los diarios y notas emocionales privadas de los usuarios.

---

## 3. Tecnologías Utilizadas

- **Frontend:**
  - **HTML5 semántico** con directrices de accesibilidad (ARIA, navegación por teclado, focus visible).
  - **CSS3:** Sistema de diseño con variables CSS, transiciones suaves y `prefers-reduced-motion`.
  - **JavaScript moderno (ES Modules)** sin TypeScript.
  - **React 18:** Componentes reutilizables y Context API (`AuthContext`, `AudioContext`, `ThemeContext`).
  - **Vite:** Empaquetador y servidor de desarrollo ágil con proxy configurado.
  - **Web Audio API:** Generación procedural de audio ambiental sin dependencias externas.

- **Backend:**
  - **Node.js 20 LTS:** Entorno de ejecución en servidor.
  - **Express 4:** API REST modular, segura y documentada.
  - **CORS restrictivo y cabeceras de seguridad:** `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`.
  - **bcryptjs:** Hasheo unidireccional de contraseñas.
  - **jsonwebtoken (JWT):** Gestión segura de sesiones de usuario.
  - **Rate Limiting:** Mitigación en memoria de ataques de fuerza bruta.

- **Bases de Datos (Capa Dual con Patrón Adaptador):**
  - **SQLite3:** Motor predeterminado para desarrollo local inmediato y pruebas automatizadas (con soporte de claves foráneas activas).
  - **PostgreSQL (`pg`):** Motor para producción y entornos multiusuario.
  - Capa de repositorios agnóstica (`db/index.js`, `sqliteAdapter.js`, `postgresAdapter.js`) con conversión automática de placeholders de parámetros (`?` -> `$1, $2...`).

---

## 4. Estructura del Repositorio

```text
lumina/
├── client/                     # Frontend React con Vite
│   ├── public/                 # Favicon SVG y recursos estáticos
│   ├── src/
│   │   ├── components/         # Navbar, Sidebar, Modal, AudioAtmosphere, Icons...
│   │   ├── context/            # AuthContext, AudioContext, ThemeContext
│   │   ├── pages/              # Welcome, Dashboard, Mood, Journal, Music, Breathing...
│   │   ├── services/           # Cliente HTTP api.js centralizado
│   │   ├── utils/              # SoundscapeGenerator.js (Web Audio API)
│   │   ├── App.jsx             # Orquestador y enrutador principal
│   │   ├── index.css           # Sistema de diseño y estilos de LÚMINA
│   │   └── main.jsx            # Punto de entrada de React
│   ├── index.html              # HTML5 accesible con tipografía Google Fonts
│   ├── package.json            # Dependencias del cliente
│   └── vite.config.js          # Configuración Vite y proxy a /api
├── server/                     # Backend API REST con Express
│   ├── src/
│   │   ├── config/             # Configuración del entorno y variables
│   │   ├── controllers/        # Controladores de negocio (auth, mood, journal, etc.)
│   │   ├── db/                 # Adaptadores de base de datos (SQLite & Postgres)
│   │   │   └── schemas/        # sqlite_schema.sql y postgres_schema.sql
│   │   ├── middleware/         # Autenticación JWT, RateLimiter, ErrorHandler
│   │   ├── routes/             # Enrutamiento modular Express
│   │   ├── utils/              # Utilidades de token y hash
│   │   ├── app.js              # Configuración de Express y middlewares
│   │   └── server.js           # Inicio del servidor HTTP
│   ├── tests/                  # Suite de pruebas automatizadas (node:test)
│   │   └── api.test.js         # 17 pruebas de integración y aislamiento
│   └── package.json            # Dependencias del servidor
├── database/                   # Almacenamiento local de SQLite
│   └── sqlite/                 # lumina.db (creada tras migración)
├── docs/                       # Documentación técnica extendida
│   ├── API.md                  # Especificación de endpoints REST
│   ├── DATABASE.md             # Guía de modelos y motores SQLite/PostgreSQL
│   └── SECURITY_PRIVACY.md     # Manifiesto de privacidad y seguridad
├── .env.example                # Plantilla de variables de entorno sin secretos
├── .env                        # Archivo local de configuración
├── .gitignore                  # Reglas de exclusión de Git
├── package.json                # Scripts raíz de orquestación
└── README.md                   # Esta documentación
```

---

## 5. Requisitos Previos

- **Node.js:** Versión 18 o superior (probado y verificado en Node.js v20.18.0).
- **npm:** Versión 9 o superior.
- **Navegador web moderno:** Chrome, Edge, Firefox, Safari o similar con soporte para Web Audio API.

---

## 6. Configuración e Instalación

### Paso 1: Configurar variables de entorno
El proyecto incluye un archivo `.env.example`. Para desarrollo local con SQLite, copiá su contenido a `.env` o utilizá los valores preconfigurados:

```env
NODE_ENV=development
PORT=5000
DB_TYPE=sqlite
SQLITE_PATH=./database/sqlite/lumina.db

# Configuración opcional para PostgreSQL
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=lumina
PG_USER=postgres
PG_PASSWORD=postgres
PG_SSL=false

# Clave secreta JWT (cambiar en producción)
JWT_SECRET=lumina_super_secret_refugio_key_development_2026_xyz!
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

### Paso 2: Instalar dependencias
Desde la raíz del proyecto `lumina`:
```bash
# Instalar dependencias del servidor
npm install --prefix server

# Instalar dependencias del frontend
npm install --prefix client
```

### Paso 3: Inicializar la base de datos (SQLite)
Ejecutá las migraciones y la siembra de datos iniciales:
```bash
npm run db:init:sqlite
```
Esto creará el archivo `database/sqlite/lumina.db` con todas las tablas e insertará usuarios de demostración, actividades guiadas, paisajes sonoros y recursos de emergencia oficiales.

---

## 7. Ejecución de la Aplicación

Para ejecutar tanto el servidor como el cliente de forma interactiva:

### Terminal 1: Iniciar el Backend (Express)
```bash
npm run server
```
*El servidor iniciará en `http://localhost:5000` con la base de datos conectada.*

### Terminal 2: Iniciar el Frontend (React + Vite)
```bash
npm run client
```
*La interfaz estará disponible en `http://localhost:5173`.*

---

## 8. Cuentas de Demostración Preconfiguradas

Para facilitar la evaluación y exploración inmediata de la plataforma, el seeder crea las siguientes cuentas:

| Rol | Correo Electrónico | Contraseña | Descripción |
|---|---|---|---|
| **Usuario estándar** | `demo@lumina.bienestar` | `DemoLumina2026!` | Incluye entradas de diario previas y registros de ánimo cargados para evaluar los gráficos y el calendario. |
| **Administrador** | `admin@lumina.bienestar` | `AdminLumina2026!` | Acceso al panel de administración para gestionar actividades, sonidos y recursos. |

*(En la pantalla de inicio de sesión disponés de botones de un solo clic para autocompletar estas credenciales).*

---

## 9. Pruebas Automatizadas y Verificación

LÚMINA incluye una suite de pruebas de integración con el test runner nativo de Node.js (`node:test`) y `supertest` en `server/tests/api.test.js`.

Para ejecutar las pruebas:
```bash
npm run test
```

### Casos de prueba verificados (17 pruebas aprobadas):
1. Verificación de salud de la API (`/api/health`).
2. Registro de Usuario A.
3. Inicio de sesión con credenciales correctas e incorrectas.
4. Registro de Usuario B para comprobación de aislamiento.
5. Creación de registros emocionales.
6. Validación estricta de escala de intensidad (1 a 5).
7. Creación de entradas confidenciales en el diario privado.
8. **Aislamiento Estricto:** Usuario B no puede leer las entradas de diario de Usuario A (`404 Not Found`).
9. **Aislamiento Estricto:** Usuario B no puede modificar entradas de Usuario A.
10. **Aislamiento Estricto:** Usuario B no puede acceder a los estados emocionales de Usuario A.
11. Generación de estadísticas personales de bienestar.
12. Consulta de pistas musicales y gestión de favoritos.
13. Catálogo de actividades de bienestar y registro de realización en el historial.
14. Consulta de líneas de apoyo telefónico de emergencia verificadas por país.
15. Exportación completa de datos personales (Portabilidad / GDPR).
16. Protección del panel de administración contra accesos no autorizados (`403 Forbidden`).
17. Acceso administrativo con rol verificado y compromiso de privacidad activo.

---

## 10. Estrategia de Base de Datos y PostgreSQL

- **En este entorno local:** Se ejecutaron y verificaron al 100% las migraciones, seeds y pruebas automatizadas con **SQLite**.
- **Para producción con PostgreSQL:**
  1. Instalar y levantar PostgreSQL en el servidor.
  2. Crear la base de datos `createdb lumina`.
  3. Modificar en `.env` la variable `DB_TYPE=postgres` y especificar las credenciales de conexión (`PG_HOST`, `PG_PORT`, `PG_USER`, `PG_PASSWORD`, etc.).
  4. Ejecutar el script preparado:
     ```bash
     npm run db:init:postgres
     ```
  5. La arquitectura adaptadora (`postgresAdapter.js`) convertirá automáticamente las consultas parametrizadas al estándar de Postgres.

---

## 11. Compromiso de Privacidad y Accesibilidad

- **Sin analítica invasiva:** LÚMINA no contiene rastreadores publicitarios ni perfiles comerciales.
- **Sin modelos de lenguaje leyendo tus diarios:** Tus textos reflexivos no se transmiten a modelos de IA ni a servidores de terceros.
- **Accesibilidad:** Cumplimiento con contraste cromático suficiente, etiquetas semánticas, navegación accesible por teclado y desactivación de animaciones respetando `prefers-reduced-motion`.

---

## 12. Licencia

Desarrollado bajo licencia **MIT**. Diseñado con empatía, rigor y respeto por la experiencia humana.
