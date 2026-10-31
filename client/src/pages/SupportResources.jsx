import React, { useState, useEffect } from 'react';
import { supportService } from '../services/api';
import { LifeBuoyIcon } from '../components/Icons';

export default function SupportResources() {
  const [resources, setResources] = useState([]);
  const [countries, setCountries] = useState([]);
  const [selectedCountryCode, setSelectedCountryCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [resList, countryList] = await Promise.all([
          supportService.list({ country_code: selectedCountryCode || undefined }),
          supportService.listCountries()
        ]);

        if (resList.success) setResources(resList.data);
        if (countryList.success) setCountries(countryList.data);
      } catch (e) {
        console.warn('Error al cargar recursos de apoyo:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedCountryCode]);

  return (
    <div className="container page-container" style={{ maxWidth: '880px' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '2.2rem', color: '#F1F1EB', marginBottom: '8px' }}>
          Apoyo humano y seguridad emocional
        </h1>
        <p style={{ color: '#A9AFAC', fontSize: '1rem', lineHeight: '1.6' }}>
          Pedir ayuda es un acto de valentía y cuidado propio. Acá encontrás líneas telefónicas gratuitas, confidenciales y oficiales atendidas por personas dispuestas a escucharte.
        </p>
      </header>

      {/* Banner de Urgencia e Inmediatez */}
      <section 
        className="card"
        style={{
          border: '1px solid rgba(228, 179, 99, 0.4)',
          backgroundColor: 'rgba(228, 179, 99, 0.08)',
          padding: '24px',
          marginBottom: '32px'
        }}
      >
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <div style={{ color: '#e4b363', flexShrink: 0, marginTop: '2px' }}>
            <LifeBuoyIcon size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: '#F1F1EB', marginBottom: '6px' }}>
              ¿Estás pasando por un momento de peligro inmediato o crisis extrema?
            </h2>
            <p style={{ color: '#A9AFAC', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '12px' }}>
              Por favor, no te quedes a solas con este peso. Ninguna aplicación reemplaza la compañía o el auxilio humano. Comunicate de inmediato con las líneas de urgencia de tu país o acercate al centro de salud más cercano.
            </p>
            <p style={{ fontSize: '0.85rem', color: '#e4b363', margin: 0, fontWeight: 500 }}>
              * Todas las líneas listadas a continuación son gratuitas y confidenciales.
            </p>
          </div>
        </div>
      </section>

      {/* Selector de País */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <label htmlFor="country-select" style={{ fontSize: '0.9rem', color: '#A4CBB3', fontWeight: 500 }}>
          Seleccioná tu país de residencia:
        </label>
        <select
          id="country-select"
          value={selectedCountryCode}
          onChange={(e) => setSelectedCountryCode(e.target.value)}
          className="form-select"
          style={{ minWidth: '220px', padding: '8px 14px' }}
        >
          <option value="">Todos los países disponibles</option>
          {countries.map((c) => (
            <option key={c.country_code} value={c.country_code}>
              {c.country} ({c.country_code})
            </option>
          ))}
        </select>
      </div>

      {/* Listado de Servicios de Ayuda Verificados */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#A9AFAC' }}>
          Verificando recursos de apoyo...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {resources.map((item) => (
            <article
              key={item.id}
              className="card"
              style={{
                borderLeft: item.is_emergency ? '4px solid #e4b363' : '4px solid #28664B',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#A4CBB3', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {item.country} {item.is_emergency ? '• Emergencia 24h' : '• Escucha y contención'}
                  </span>
                  <h3 style={{ fontSize: '1.3rem', color: '#F1F1EB', marginTop: '2px' }}>
                    {item.service_name}
                  </h3>
                </div>

                {/* Enlace telefónico directo */}
                <a
                  href={`tel:${item.phone.replace(/[^0-9+]/g, '')}`}
                  className="btn-primary"
                  style={{
                    backgroundColor: item.is_emergency ? '#e4b363' : undefined,
                    color: item.is_emergency ? '#101311' : undefined,
                    fontWeight: 700,
                    padding: '8px 18px',
                    fontSize: '0.92rem'
                  }}
                >
                  📞 {item.phone}
                </a>
              </div>

              <p style={{ color: '#A9AFAC', fontSize: '0.92rem', lineHeight: '1.6', margin: 0 }}>
                {item.description}
              </p>

              {item.website && (
                <div style={{ fontSize: '0.85rem' }}>
                  <a
                    href={item.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#A4CBB3', textDecoration: 'underline' }}
                  >
                    Visitar sitio oficial ({item.website.replace('https://', '')}) →
                  </a>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {/* Aclaración Médica / Legal */}
      <footer style={{ marginTop: '40px', padding: '20px', borderTop: '1px solid var(--color-border)', color: '#79837e', fontSize: '0.82rem', lineHeight: '1.6' }}>
        LÚMINA no presta servicios de salud mental, asesoramiento clínico profesional ni atención psiquiátrica de emergencia. La información provista en esta sección es meramente orientativa y se basa en servicios públicos oficiales y organizaciones no gubernamentales acreditadas.
      </footer>
    </div>
  );
}
