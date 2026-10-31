const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const config = require('../config');
const { createAdapter } = require('./index');

async function runSeed() {
  const args = process.argv.slice(2);
  let engine = config.dbType;
  
  for (const arg of args) {
    if (arg.startsWith('--engine=')) {
      engine = arg.split('=')[1].toLowerCase();
    }
  }

  console.log(`[Seed LÚMINA] Inicializando datos semilla para motor: ${engine.toUpperCase()}`);
  const adapter = createAdapter(engine);

  try {
    await adapter.connect();

    // 1. Usuarios base (Admin y Demo)
    const adminPasswordHash = await bcrypt.hash('AdminLumina2026!', 10);
    const demoPasswordHash = await bcrypt.hash('DemoLumina2026!', 10);

    const adminId = 'usr_admin_001';
    const demoId = 'usr_demo_002';

    // Insertar o actualizar Admin
    const existingAdmin = await adapter.get('SELECT id FROM users WHERE email = ?', ['admin@lumina.bienestar']);
    if (!existingAdmin) {
      await adapter.run(
        'INSERT INTO users (id, email, password_hash, display_name, role) VALUES (?, ?, ?, ?, ?)',
        [adminId, 'admin@lumina.bienestar', adminPasswordHash, 'Administrador LÚMINA', 'admin']
      );
      await adapter.run(
        'INSERT INTO user_preferences (id, user_id, preferred_theme, onboarding_completed) VALUES (?, ?, ?, ?)',
        ['pref_admin_001', adminId, 'dark', 1]
      );
      console.log(' -> Creado usuario administrador: admin@lumina.bienestar');
    }

    // Insertar o actualizar Demo
    const existingDemo = await adapter.get('SELECT id FROM users WHERE email = ?', ['demo@lumina.bienestar']);
    if (!existingDemo) {
      await adapter.run(
        'INSERT INTO users (id, email, password_hash, display_name, role) VALUES (?, ?, ?, ?, ?)',
        [demoId, 'demo@lumina.bienestar', demoPasswordHash, 'Mariana', 'user']
      );
      await adapter.run(
        'INSERT INTO user_preferences (id, user_id, preferred_theme, music_preferences, onboarding_completed, onboarding_answers) VALUES (?, ?, ?, ?, ?, ?)',
        [
          'pref_demo_002', 
          demoId, 
          'dark', 
          JSON.stringify({ categories: ['Lluvia', 'Piano', 'Bosque y naturaleza'] }),
          1,
          JSON.stringify({
            goal: 'Calmar la ansiedad y entender mis emociones',
            ambience: 'Sonidos de lluvia suave y tonos verdes oscuros'
          })
        ]
      );
      console.log(' -> Creado usuario demo: demo@lumina.bienestar');

      // 2. Registros emocionales iniciales de prueba (para gráficos y calendario)
      const now = new Date();
      const sampleMoods = [
        {
          daysAgo: 6,
          emotions: ['Ansiedad', 'Agotamiento'],
          intensity: 4,
          factors: ['Trabajo', 'Falta de sueño'],
          note: 'Día largo con muchas reuniones. Me sentí abrumada por la tarde.',
          helpful: ['Respiración guiada', 'Pausa de descanso'],
          action: 'respirar'
        },
        {
          daysAgo: 5,
          emotions: ['Tristeza', 'Soledad'],
          intensity: 3,
          factors: ['Relaciones', 'Clima'],
          note: 'Un día melancólico. Escribir me ayudó a ordenar mis pensamientos.',
          helpful: ['Escribir en el diario', 'Música instrumental'],
          action: 'escribir'
        },
        {
          daysAgo: 4,
          emotions: ['Tranquilidad'],
          intensity: 2,
          factors: ['Tiempo a solas', 'Descanso'],
          note: 'Logré tomar una caminata corta y escuchar el río. Me sentí más presente.',
          helpful: ['Sonidos de naturaleza'],
          action: 'musica'
        },
        {
          daysAgo: 3,
          emotions: ['Estrés', 'Confusión'],
          intensity: 4,
          factors: ['Estudio / Trabajo', 'Sobrecarga'],
          note: 'Demasiadas decisiones pendientes. Hice el ejercicio de grounding 5-4-3-2-1.',
          helpful: ['Ejercicio de grounding', 'Respiración'],
          action: 'actividad'
        },
        {
          daysAgo: 2,
          emotions: ['Esperanza', 'Gratitud'],
          intensity: 3,
          factors: ['Amistades', 'Cuidado personal'],
          note: 'Conversé con una amiga sincera. Sentí alivio y gratitud por pequeños momentos.',
          helpful: ['Reflexión breve'],
          action: 'terminar'
        },
        {
          daysAgo: 1,
          emotions: ['Alegría', 'Tranquilidad'],
          intensity: 2,
          factors: ['Música', 'Espacio propio'],
          note: 'Un domingo pacífico. Me di permiso de no hacer nada productivo a la fuerza.',
          helpful: ['Piano', 'Descanso'],
          action: 'musica'
        },
        {
          daysAgo: 0,
          emotions: ['Tranquilidad', 'Gratitud'],
          intensity: 1,
          factors: ['Refugio LÚMINA'],
          note: 'Volviendo a conectar conmigo misma con calma.',
          helpful: ['Respiración suave'],
          action: 'terminar'
        }
      ];

      for (const m of sampleMoods) {
        const entryDate = new Date(now.getTime() - m.daysAgo * 24 * 60 * 60 * 1000);
        await adapter.run(
          `INSERT INTO mood_entries 
           (id, user_id, recorded_at, emotions, intensity, factors, context_note, helpful_activities, post_action) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            'mood_' + crypto.randomUUID().slice(0, 8),
            demoId,
            entryDate.toISOString(),
            JSON.stringify(m.emotions),
            m.intensity,
            JSON.stringify(m.factors),
            m.note,
            JSON.stringify(m.helpful),
            m.action
          ]
        );
      }
      console.log(' -> Registros emocionales iniciales creados para el usuario demo');

      // 3. Entradas de diario para el usuario demo
      const sampleJournals = [
        {
          title: 'Un refugio en medio del ruido',
          content: 'A veces siento que el mundo exige respuestas inmediatas para todo. Hoy decido que no tengo que tener todo resuelto. Este espacio es para mí, para respirar hondo y recordar que mi ritmo también tiene valor.',
          moodTag: 'Tranquilidad',
          isFavorite: 1,
          daysAgo: 4
        },
        {
          title: 'Nombrar lo que pesa',
          content: 'La ansiedad suele sentirse como una nube difusa. Al escribir, logro separarme un poco de ella: "Siento tensión en el pecho y prisa en la cabeza". No soy la ansiedad, solo la estoy experimentando ahora y va a pasar.',
          moodTag: 'Ansiedad',
          isFavorite: 1,
          daysAgo: 2
        },
        {
          title: 'Pequeñas cosas que agradezco',
          content: '1. El aroma del té caliente esta mañana.\n2. La luz suave entrando por la ventana al atardecer.\n3. El silencio de unos minutos antes de dormir.',
          moodTag: 'Gratitud',
          isFavorite: 0,
          daysAgo: 1
        }
      ];

      for (const j of sampleJournals) {
        const jDate = new Date(now.getTime() - j.daysAgo * 24 * 60 * 60 * 1000);
        await adapter.run(
          `INSERT INTO journal_entries 
           (id, user_id, title, content, mood_tag, is_favorite, is_draft, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            'jnl_' + crypto.randomUUID().slice(0, 8),
            demoId,
            j.title,
            j.content,
            j.moodTag,
            j.isFavorite,
            0,
            jDate.toISOString(),
            jDate.toISOString()
          ]
        );
      }
      console.log(' -> Entradas privadas de diario inicializadas');
    }

    // 4. Actividades de bienestar
    const existingActivities = await adapter.all('SELECT id FROM wellness_activities');
    if (existingActivities.length === 0) {
      const activities = [
        {
          id: 'act_respiracion_suave',
          title: 'Respiración de calma consciente',
          description: 'Un ciclo guiado suave de inhalación, pausa y exhalación lenta para desacelerar el ritmo cardíaco sin forzar el cuerpo.',
          category: 'respiracion',
          duration_minutes: 3,
          instructions: JSON.stringify([
            'Adoptá una postura cómoda en tu silla o acostado/a.',
            'Dejá caer suavemente los hombros y aflojá la mandíbula.',
            'Seguí el círculo luminoso: inhalá en 4 segundos, sostené suavemente 2 segundos si te resulta grato, y exhalá lentamente en 6 segundos.',
            'Si sentís incomodidad, volvé a tu respiración natural en cualquier momento.'
          ]),
          recommended_for: JSON.stringify(['Ansiedad', 'Estrés', 'Miedo', 'Enojo'])
        },
        {
          id: 'act_grounding_54321',
          title: 'Conexión con el presente (Técnica 5-4-3-2-1)',
          description: 'Un anclaje sensorial para momentos de pensamientos acelerados o ansiedad intensa utilizando tus sentidos reales.',
          category: 'sensorial',
          duration_minutes: 5,
          instructions: JSON.stringify([
            '5 cosas que podés VER: observá detalles a tu alrededor, colores, texturas o reflejos de luz.',
            '4 cosas que podés TOCAR: sentí la tela de tu ropa, la mesa bajo tus dedos o la suela de tus zapatos.',
            '3 cosas que podés ESCUCHAR: atendé sonidos lejanos, el viento, el murmullo de la casa.',
            '2 cosas que podés OLER: el aroma de tu infusión, el aire fresco o tu propia piel.',
            '1 cosa que podés SABOREAR o una sensación amable en tu boca.',
            'Tomá una respiración profunda y recordá: estás a salvo en este instante.'
          ]),
          recommended_for: JSON.stringify(['Ansiedad', 'Confusión', 'Miedo'])
        },
        {
          id: 'act_escaneo_corporal',
          title: 'Relajación muscular y alivio corporal',
          description: 'Reconocé dónde se acumula la tensión física y permitite soltar los puntos de rigidez con amabilidad.',
          category: 'corporal',
          duration_minutes: 6,
          instructions: JSON.stringify([
            'Cerrá los ojos o bajá la vista si te hace sentir más cómodo/a.',
            'Llevá la atención a la frente, ceño y ojos. Al exhalar, permití que se suavicen.',
            'Observá el cuello y los hombros. Dejalos descender lejos de las orejas.',
            'Notá las manos y el abdomen: no necesitás sostener nada en este minuto.',
            'Sentí el peso de tu cuerpo apoyado con firmeza y seguridad.'
          ]),
          recommended_for: JSON.stringify(['Estrés', 'Agotamiento', 'Enojo'])
        },
        {
          id: 'act_orden_pensamientos',
          title: 'Espacio para ordenar pensamientos',
          description: 'Separá lo que está bajo tu control de lo que escapa a tus manos para aliviar la sobrecarga mental.',
          category: 'reflexion',
          duration_minutes: 4,
          instructions: JSON.stringify([
            'Escribí o pensá en la situación que te preocupa actualmente.',
            'Preguntate: ¿Hay alguna acción concreta que dependa de mí hoy?',
            'Si la hay, anotala como un solo paso pequeño y manejable.',
            'Si depende de otros o del futuro incierto, respirá y decite: "Elijo soltar esto por las próximas horas".'
          ]),
          recommended_for: JSON.stringify(['Estrés', 'Confusión', 'Ansiedad'])
        },
        {
          id: 'act_persona_confianza',
          title: 'Guía para acercarte a una persona de confianza',
          description: 'Pasos amables para pedir compañía o escucha a alguien cercano sin sentir culpa ni exigirte explicaciones complejas.',
          category: 'reflexion',
          duration_minutes: 4,
          instructions: JSON.stringify([
            'Recordá a una o dos personas con quienes sientas seguridad y escucha sin juicio.',
            'Un mensaje sencillo es suficiente: "Hola, hoy estoy pasando por un día difícil. ¿Tendrías un ratito para hablar o acompañarme un momento?".',
            'Podés aclarar de antemano: "No necesito consejos ni soluciones, solo tu compañía".',
            'Pedir apoyo es un acto de valentía y cuidado propio.'
          ]),
          recommended_for: JSON.stringify(['Tristeza', 'Soledad', 'Miedo'])
        }
      ];

      for (const act of activities) {
        await adapter.run(
          `INSERT INTO wellness_activities (id, title, description, category, duration_minutes, instructions, recommended_for, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
          [act.id, act.title, act.description, act.category, act.duration_minutes, act.instructions, act.recommended_for]
        );
      }
      console.log(' -> Actividades de bienestar creadas');
    }

    // 5. Biblioteca musical y paisajes sonoros procedurales Web Audio
    const existingTracks = await adapter.all('SELECT id FROM music_tracks');
    if (existingTracks.length === 0) {
      const tracks = [
        {
          id: 'trk_lluvia_suave',
          title: 'Lluvia serena en el cristal',
          artist: 'LÚMINA Paisajes Sonoros',
          category: 'Lluvia',
          audio_url: 'soundscape:rain',
          is_soundscape: 1,
          soundscape_preset: 'rain',
          license_info: 'Generativo Web Audio API (Dominio Público / LÚMINA)',
          duration_seconds: 600
        },
        {
          id: 'trk_bosque_viento',
          title: 'Viento en los pinares y hojas',
          artist: 'LÚMINA Paisajes Sonoros',
          category: 'Bosque y naturaleza',
          audio_url: 'soundscape:forest',
          is_soundscape: 1,
          soundscape_preset: 'forest',
          license_info: 'Generativo Web Audio API (Dominio Público / LÚMINA)',
          duration_seconds: 600
        },
        {
          id: 'trk_rio_calmo',
          title: 'Corriente de agua mansa',
          artist: 'LÚMINA Paisajes Sonoros',
          category: 'Sonidos ambientales',
          audio_url: 'soundscape:river',
          is_soundscape: 1,
          soundscape_preset: 'river',
          license_info: 'Generativo Web Audio API (Dominio Público / LÚMINA)',
          duration_seconds: 600
        },
        {
          id: 'trk_olas_mar',
          title: 'Marea nocturna en la orilla',
          artist: 'LÚMINA Paisajes Sonoros',
          category: 'Descanso',
          audio_url: 'soundscape:ocean',
          is_soundscape: 1,
          soundscape_preset: 'ocean',
          license_info: 'Generativo Web Audio API (Dominio Público / LÚMINA)',
          duration_seconds: 600
        },
        {
          id: 'trk_drone_meditativo',
          title: 'Armónicos celestiales para meditar',
          artist: 'LÚMINA Acústica',
          category: 'Música tranquila',
          audio_url: 'soundscape:drone',
          is_soundscape: 1,
          soundscape_preset: 'drone',
          license_info: 'Generativo Web Audio API (Dominio Público / LÚMINA)',
          duration_seconds: 600
        },
        {
          id: 'trk_grillos_noche',
          title: 'Noche estrellada en calma',
          artist: 'LÚMINA Paisajes Sonoros',
          category: 'Concentración',
          audio_url: 'soundscape:night',
          is_soundscape: 1,
          soundscape_preset: 'night',
          license_info: 'Generativo Web Audio API (Dominio Público / LÚMINA)',
          duration_seconds: 600
        },
        {
          id: 'trk_piano_luz',
          title: 'Notas de luna y sosiego',
          artist: 'LÚMINA Acústica',
          category: 'Piano',
          audio_url: 'soundscape:piano_ambience',
          is_soundscape: 1,
          soundscape_preset: 'piano_ambience',
          license_info: 'Síntesis acústica Web Audio (Dominio Público / LÚMINA)',
          duration_seconds: 480
        },
        {
          id: 'trk_instrumental_refugio',
          title: 'Claros en el bosque (Instrumental)',
          artist: 'LÚMINA Acústica',
          category: 'Instrumental',
          audio_url: 'soundscape:instrumental_calm',
          is_soundscape: 1,
          soundscape_preset: 'instrumental_calm',
          license_info: 'Síntesis acústica Web Audio (Dominio Público / LÚMINA)',
          duration_seconds: 540
        }
      ];

      for (const trk of tracks) {
        await adapter.run(
          `INSERT INTO music_tracks (id, title, artist, category, audio_url, is_soundscape, soundscape_preset, license_info, duration_seconds, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
          [trk.id, trk.title, trk.artist, trk.category, trk.audio_url, trk.is_soundscape, trk.soundscape_preset, trk.license_info, trk.duration_seconds]
        );
      }
      console.log(' -> Pistas de música y paisajes sonoros creados');

      // Añadir favorito para el usuario demo
      await adapter.run(
        'INSERT OR IGNORE INTO music_favorites (id, user_id, track_id) VALUES (?, ?, ?)',
        ['fav_001', demoId, 'trk_lluvia_suave']
      );
    }

    // 6. Recursos de apoyo verificados por país (números reales de emergencia y apoyo en salud mental)
    const existingSupport = await adapter.all('SELECT id FROM support_resources');
    if (existingSupport.length === 0) {
      const resources = [
        {
          id: 'sup_arg_135',
          country: 'Argentina',
          country_code: 'AR',
          service_name: 'Centro de Asistencia al Suicida (CAS)',
          phone: '135 (CABA/GBA) o (011) 5275-1135',
          description: 'Línea de prevención y acompañamiento en crisis emocional, gratuita y confidencial.',
          website: 'https://www.cas.org.ar',
          is_emergency: 1
        },
        {
          id: 'sup_arg_saludmental',
          country: 'Argentina',
          country_code: 'AR',
          service_name: 'Línea Nacional de Salud Mental',
          phone: '0800-999-0091',
          description: 'Orientación y apoyo en salud mental del Ministerio de Salud de la Nación, disponible las 24 horas.',
          website: 'https://www.argentina.gob.ar/salud/mental-y-adicciones',
          is_emergency: 1
        },
        {
          id: 'sup_esp_024',
          country: 'España',
          country_code: 'ES',
          service_name: 'Línea 024 de Atención a la Conducta Suicida',
          phone: '024',
          description: 'Línea pública, gratuita, accesible las 24 horas todos los días del año, gestionada por el Ministerio de Sanidad.',
          website: 'https://www.sanidad.gob.es/linea024/home.htm',
          is_emergency: 1
        },
        {
          id: 'sup_esp_telefono_esperanza',
          country: 'España',
          country_code: 'ES',
          service_name: 'Teléfono de la Esperanza',
          phone: '717 003 717',
          description: 'Acompañamiento en momentos de crisis, soledad no deseada o angustia emocional.',
          website: 'https://telefonodelaesperanza.org',
          is_emergency: 0
        },
        {
          id: 'sup_mex_linea_vida',
          country: 'México',
          country_code: 'MX',
          service_name: 'Línea de la Vida (Secretaría de Salud)',
          phone: '800 911 2000',
          description: 'Atención personalizada, gratuita y confidencial en salud mental y crisis, 24 horas los 365 días.',
          website: 'https://www.gob.mx/salud/conasama',
          is_emergency: 1
        },
        {
          id: 'sup_col_106',
          country: 'Colombia',
          country_code: 'CO',
          service_name: 'Línea 106 - El poder de ser escuchado',
          phone: '106 (o 300 754 8933 vía WhatsApp)',
          description: 'Línea de ayuda psicológica y orientación para jóvenes y adultos de la Secretaría de Salud.',
          website: 'https://www.saludcapital.gov.co',
          is_emergency: 1
        },
        {
          id: 'sup_cl_4141',
          country: 'Chile',
          country_code: 'CL',
          service_name: 'Línea *4141 - No estás solo, no estás sola',
          phone: '*4141 (desde celulares)',
          description: 'Atención profesional gratuita del Ministerio de Salud las 24 horas para personas en crisis emocional.',
          website: 'https://www.gob.cl/saludablemente',
          is_emergency: 1
        },
        {
          id: 'sup_us_988',
          country: 'Estados Unidos (en español)',
          country_code: 'US',
          service_name: '988 Suicide & Crisis Lifeline (Línea en español)',
          phone: '988 (presionar 2 para español)',
          description: 'Línea gratuita nacional de prevención del suicidio y crisis emocional las 24 horas.',
          website: 'https://988lifeline.org/es',
          is_emergency: 1
        },
        {
          id: 'sup_intl_befrienders',
          country: 'Internacional',
          country_code: 'INT',
          service_name: 'Befrienders Worldwide',
          phone: 'Consulta web según tu localidad',
          description: 'Red global de centros de apoyo emocional y escucha activa en más de 30 países.',
          website: 'https://www.befrienders.org',
          is_emergency: 0
        }
      ];

      for (const res of resources) {
        await adapter.run(
          `INSERT INTO support_resources (id, country, country_code, service_name, phone, description, website, is_emergency, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
          [res.id, res.country, res.country_code, res.service_name, res.phone, res.description, res.website, res.is_emergency]
        );
      }
      console.log(' -> Recursos de apoyo verificados creados');
    }

    console.log(`[Seed LÚMINA] ¡Datos iniciales cargados con éxito en ${engine.toUpperCase()}!`);
  } catch (error) {
    console.error(`[Seed LÚMINA] Error al sembrar datos en ${engine}:`, error);
    process.exit(1);
  } finally {
    await adapter.close();
  }
}

if (require.main === module) {
  runSeed();
}

module.exports = runSeed;
