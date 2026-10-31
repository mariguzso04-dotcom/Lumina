const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../src/app');
const { getDB, resetDBConnection } = require('../src/db');
const runMigration = require('../src/db/migrate');
const runSeed = require('../src/db/seed');

describe('Suite de Pruebas Automatizadas - LÚMINA API', () => {
  let userAToken = '';
  let userBToken = '';
  let userAId = '';
  let userBId = '';
  let userAJournalId = '';
  let userAMoodId = '';

  before(async () => {
    // Asegurar esquema SQLite y datos iniciales para la prueba
    await runMigration();
    await runSeed();
  });

  after(async () => {
    await resetDBConnection();
  });

  test('1. Verificación de salud del servidor (Health Check)', async () => {
    const res = await request(app).get('/api/health');
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.status, 'healthy');
    assert.strictEqual(res.body.application, 'LÚMINA API');
  });

  test('2. Registro de Usuario A exitoso', async () => {
    const uniqueEmail = `test_a_${Date.now()}@lumina.test`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: uniqueEmail,
        password: 'PasswordSegura2026!',
        display_name: 'Camila Test'
      });

    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.strictEqual(res.body.data.user.email, uniqueEmail);

    userAToken = res.body.data.token;
    userAId = res.body.data.user.id;
  });

  test('3. Inicio de sesión con credenciales correctas e incorrectas', async () => {
    // Credencial incorrecta
    const failRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'demo@lumina.bienestar',
        password: 'PasswordErronea123'
      });
    assert.strictEqual(failRes.statusCode, 401);

    // Credencial correcta (usuario demo)
    const successRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'demo@lumina.bienestar',
        password: 'DemoLumina2026!'
      });
    assert.strictEqual(successRes.statusCode, 200);
    assert.ok(successRes.body.data.token);
  });

  test('4. Registro de Usuario B para pruebas de aislamiento', async () => {
    const uniqueEmail = `test_b_${Date.now()}@lumina.test`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: uniqueEmail,
        password: 'OtraPassword2026!',
        display_name: 'Mateo Test'
      });

    assert.strictEqual(res.statusCode, 201);
    userBToken = res.body.data.token;
    userBId = res.body.data.user.id;
  });

  test('5. Creación de Registro Emocional por Usuario A', async () => {
    const res = await request(app)
      .post('/api/moods')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        emotions: ['Tranquilidad', 'Gratitud'],
        intensity: 3,
        factors: ['Naturaleza', 'Descanso'],
        context_note: 'Momento de silencio agradable.',
        helpful_activities: ['Música suave'],
        post_action: 'musica'
      });

    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.intensity, 3);
    assert.deepStrictEqual(res.body.data.emotions, ['Tranquilidad', 'Gratitud']);
    userAMoodId = res.body.data.id;
  });

  test('6. Validación de escala de intensidad emocional (1 a 5)', async () => {
    const invalidRes = await request(app)
      .post('/api/moods')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        emotions: ['Alegría'],
        intensity: 9 // Fuera de rango
      });

    assert.strictEqual(invalidRes.statusCode, 400);
    assert.strictEqual(invalidRes.body.success, false);
  });

  test('7. Creación de Entrada de Diario Privado por Usuario A', async () => {
    const res = await request(app)
      .post('/api/journal')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        title: 'Mi primer pensamiento en LÚMINA',
        content: 'Este es mi espacio íntimo y seguro donde puedo expresarme sin temor a juicios.',
        mood_tag: 'Tranquilidad',
        is_favorite: true
      });

    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.title, 'Mi primer pensamiento en LÚMINA');
    userAJournalId = res.body.data.id;
  });

  test('8. AISLAMIENTO ESTRICTO: Usuario B NO PUEDE leer la entrada de diario de Usuario A', async () => {
    const res = await request(app)
      .get(`/api/journal/${userAJournalId}`)
      .set('Authorization', `Bearer ${userBToken}`);

    // Debe responder 404 No encontrado por aislamiento
    assert.strictEqual(res.statusCode, 404);
  });

  test('9. AISLAMIENTO ESTRICTO: Usuario B NO PUEDE modificar el diario de Usuario A', async () => {
    const res = await request(app)
      .patch(`/api/journal/${userAJournalId}`)
      .set('Authorization', `Bearer ${userBToken}`)
      .send({
        title: 'Intento malicioso de modificación'
      });

    assert.strictEqual(res.statusCode, 404);
  });

  test('10. AISLAMIENTO ESTRICTO: Usuario B NO PUEDE leer el registro emocional de Usuario A', async () => {
    const res = await request(app)
      .get(`/api/moods/${userAMoodId}`)
      .set('Authorization', `Bearer ${userBToken}`);

    assert.strictEqual(res.statusCode, 404);
  });

  test('11. Obtención de estadísticas emocionales del usuario', async () => {
    const res = await request(app)
      .get('/api/moods/statistics')
      .set('Authorization', `Bearer ${userAToken}`);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.disclaimer);
    assert.strictEqual(res.body.data.total_entries, 1);
    assert.strictEqual(res.body.data.average_intensity, 3);
  });

  test('12. Consulta de pistas musicales y gestión de favoritos', async () => {
    const listRes = await request(app).get('/api/music');
    assert.strictEqual(listRes.statusCode, 200);
    assert.ok(Array.isArray(listRes.body.data));
    assert.ok(listRes.body.data.length > 0);

    const firstTrackId = listRes.body.data[0].id;

    // Agregar a favoritos
    const addFavRes = await request(app)
      .post(`/api/music/favorites/${firstTrackId}`)
      .set('Authorization', `Bearer ${userAToken}`);
    assert.strictEqual(addFavRes.statusCode, 200);

    // Comprobar listado de favoritos
    const favListRes = await request(app)
      .get('/api/music/favorites')
      .set('Authorization', `Bearer ${userAToken}`);
    assert.strictEqual(favListRes.statusCode, 200);
    assert.strictEqual(favListRes.body.data.some(t => t.id === firstTrackId), true);
  });

  test('13. Consulta de actividades de bienestar y registro de realización', async () => {
    const actRes = await request(app).get('/api/activities');
    assert.strictEqual(actRes.statusCode, 200);
    assert.ok(actRes.body.data.length > 0);

    const actId = actRes.body.data[0].id;
    const compRes = await request(app)
      .post('/api/activities/complete')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        activity_id: actId,
        duration_seconds: 180
      });

    assert.strictEqual(compRes.statusCode, 201);
  });

  test('14. Consulta de recursos de apoyo de emergencia verificados', async () => {
    const res = await request(app).get('/api/support?country_code=AR');
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.data.length >= 1);
    assert.strictEqual(res.body.data[0].country_code, 'AR');
  });

  test('15. Exportación completa de datos personales (Derecho a la portabilidad)', async () => {
    const res = await request(app)
      .get('/api/users/export')
      .set('Authorization', `Bearer ${userAToken}`);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.mood_entries.length, 1);
    assert.strictEqual(res.body.data.journal_entries.length, 1);
  });

  test('16. Protección de panel de administración contra usuarios estándar', async () => {
    const res = await request(app)
      .get('/api/admin/metrics')
      .set('Authorization', `Bearer ${userAToken}`); // Usuario con rol 'user'

    assert.strictEqual(res.statusCode, 403);
  });

  test('17. Acceso a métricas de administración con usuario Admin', async () => {
    // Iniciar sesión como Admin
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@lumina.bienestar',
        password: 'AdminLumina2026!'
      });

    assert.strictEqual(adminLogin.statusCode, 200);
    const adminToken = adminLogin.body.data.token;

    const metricsRes = await request(app)
      .get('/api/admin/metrics')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.strictEqual(metricsRes.statusCode, 200);
    assert.ok(metricsRes.body.data.total_registered_users >= 1);
    assert.ok(metricsRes.body.privacy_notice); // Garantía de privacidad explícita
  });
});
