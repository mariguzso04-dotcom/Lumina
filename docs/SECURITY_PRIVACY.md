# Seguridad, Privacidad y Compromiso Ético — LÚMINA

Las plataformas de bienestar emocional manejan información profundamente íntima. En **LÚMINA**, la seguridad técnica y la ética de diseño no son añadidos secundarios, sino los cimientos de la arquitectura.

---

## 1. Principios Éticos de Diseño

1. **No diagnóstico clínico:** LÚMINA no es un dispositivo médico ni reemplaza la atención psiquiátrica o psicológica. La aplicación nunca deduce diagnósticos (ej. depresión, trastorno bipolar) ni asigna puntuaciones de salud mental.
2. **Respeto a la autonomía:** No se obliga al usuario a declarar condiciones de salud mental para utilizar las herramientas.
3. **No patologización:** Las estadísticas son descriptivas y orientativas sobre los registros que la persona decide anotar.
4. **Respuesta ante emergencias:** Si un usuario se encuentra en situación de riesgo vital o crisis, la plataforma prioriza de inmediato el acceso a líneas oficiales gratuitas de ayuda humana y servicios de emergencia en su país.

---

## 2. Medidas de Seguridad y Protección Técnica

### 1. Aislamiento Estricto por Usuario
- Cada consulta a `mood_entries`, `journal_entries` o `user_preferences` valida que el registro pertenezca exactamente al `req.user.id` validado por el token JWT.
- Un usuario no puede leer, modificar o inferir la existencia de datos de otro usuario cambiando identificadores en la URL (retorna `404 Not Found`).

### 2. Contraseñas y Criptografía
- Contraseñas almacenadas exclusivamente como hashes unidireccionales generados con **bcryptjs** con factor de costo 10.
- Secretos y claves JWT aislados en variables de entorno locales excluidas de Git.

### 3. Barrera de Privacidad en Administración
- El panel de administración tiene prohibido por arquitectura el acceso a tablas o campos de contenido de diarios y notas personales de los usuarios.
- Los administradores únicamente pueden visualizar métricas agregadas anónimas (contadores de usuarios y actividades).

### 4. Minimización de Registros (Logs)
- El contenido del diario privado nunca se imprime en consola ni se almacena en herramientas de analítica o logs de error.
- En caso de excepción no controlada, el manejador de errores devuelve un mensaje genérico sin filtrar fragmentos de base de datos ni datos de usuario.

### 5. Mitigación de Ataques de Fuerza Bruta
- Limitador de tasa en memoria (`rateLimiter.js`) aplicado a los endpoints sensibles `/api/auth/login` y `/api/auth/register`.

### 6. Derechos de Acceso, Portabilidad y Supresión (ARCO / GDPR)
- **Portabilidad:** Endpoint `GET /api/users/export` que permite descargar todos los registros en formato abierto JSON.
- **Supresión total:** Endpoint `DELETE /api/users/me` que elimina la cuenta y ejecuta el borrado en cascada (`ON DELETE CASCADE`) en todas las tablas asociadas.
