import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { userService } from '../services/api';
import { UserIcon, ShieldIcon, DownloadIcon, TrashIcon } from '../components/Icons';
import Modal from '../components/Modal';

export default function UserProfile({ onNavigate }) {
  const { user, logout, updateProfile } = useAuth();
  const { reducedMotion, highContrast, toggleReducedMotion, toggleHighContrast } = useTheme();

  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (newPassword) {
      if (newPassword.length < 8) {
        setErrorMsg('La nueva contraseña debe tener al menos 8 caracteres.');
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setErrorMsg('Las nuevas contraseñas no coinciden.');
        return;
      }
      if (!currentPassword) {
        setErrorMsg('Por favor ingresá tu contraseña actual para autorizar el cambio.');
        return;
      }
    }

    setSaving(true);
    try {
      const payload = { display_name: displayName };
      if (newPassword) {
        payload.current_password = currentPassword;
        payload.new_password = newPassword;
      }

      await updateProfile(payload);
      setSuccessMsg('Perfil actualizado correctamente.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setErrorMsg(err.message || 'Error al actualizar el perfil.');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await userService.exportData();
      if (res.success && res.data) {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(res.data, null, 2))}`;
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', jsonString);
        downloadAnchor.setAttribute('download', `lumina_mis_datos_${user.email}_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
      }
    } catch (e) {
      alert('Error al exportar los datos personales.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError('Ingresá tu contraseña para confirmar.');
      return;
    }
    setDeleting(true);
    setDeleteError('');
    try {
      await userService.deleteAccount(deletePassword);
      logout();
      onNavigate('welcome');
    } catch (err) {
      setDeleteError(err.message || 'Contraseña incorrecta.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="container page-container" style={{ maxWidth: '780px' }}>
      <header style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2.2rem', color: '#F1F1EB', marginBottom: '8px' }}>
          Mi perfil y privacidad
        </h1>
        <p style={{ color: '#A9AFAC', fontSize: '0.95rem' }}>
          Gestioná tus preferencias, controlá tu información y ejercé tus derechos de privacidad y portabilidad.
        </p>
      </header>

      {successMsg && (
        <div style={{
          padding: '12px 18px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(40, 102, 75, 0.25)',
          border: '1px solid rgba(164, 203, 179, 0.4)',
          color: '#A4CBB3',
          marginBottom: '20px'
        }}>
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{
          padding: '12px 18px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(201, 98, 87, 0.15)',
          border: '1px solid rgba(201, 98, 87, 0.4)',
          color: '#ff9d94',
          marginBottom: '20px'
        }}>
          {errorMsg}
        </div>
      )}

      {/* 1. Datos Personales */}
      <section className="card" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#F1F1EB', marginBottom: '16px' }}>
          Datos de la cuenta
        </h2>

        <form onSubmit={handleUpdateProfile}>
          <div className="form-group">
            <label className="form-label">Correo electrónico</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="form-input"
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
            />
            <span style={{ fontSize: '0.78rem', color: '#79837e' }}>
              El correo está vinculado de forma permanente a tu espacio privado.
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="display-name" className="form-label">
              Nombre para llamarte en tu refugio
            </label>
            <input
              id="display-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: '1.05rem', color: '#F1F1EB', marginBottom: '12px' }}>
              Cambiar contraseña (opcional)
            </h3>

            <div className="form-group">
              <label htmlFor="current-pwd" className="form-label">Contraseña actual</label>
              <input
                id="current-pwd"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="form-input"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label htmlFor="new-pwd" className="form-label">Nueva contraseña</label>
                <input
                  id="new-pwd"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-input"
                  placeholder="Mínimo 8 caracteres"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirm-new-pwd" className="form-label">Confirmar nueva contraseña</label>
                <input
                  id="confirm-new-pwd"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Guardando cambios...' : 'Actualizar perfil'}
            </button>
          </div>
        </form>
      </section>

      {/* 2. Accesibilidad y Sensibilidad Visual */}
      <section className="card" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#F1F1EB', marginBottom: '12px' }}>
          Accesibilidad y estímulos visuales
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ color: '#F1F1EB', display: 'block', fontSize: '0.95rem' }}>
                Reducción de movimiento y animaciones
              </strong>
              <span style={{ fontSize: '0.82rem', color: '#A9AFAC' }}>
                Desactiva transiciones y pulsos visuales continuos para personas fotosensibles.
              </span>
            </div>
            <button
              type="button"
              onClick={toggleReducedMotion}
              className="btn-secondary"
              style={{
                borderColor: reducedMotion ? '#A4CBB3' : undefined,
                color: reducedMotion ? '#A4CBB3' : '#A9AFAC'
              }}
            >
              {reducedMotion ? 'Activado' : 'Desactivado'}
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ color: '#F1F1EB', display: 'block', fontSize: '0.95rem' }}>
                Modo de alto contraste
              </strong>
              <span style={{ fontSize: '0.82rem', color: '#A9AFAC' }}>
                Bordes más contrastados y textos reforzados para mayor legibilidad.
              </span>
            </div>
            <button
              type="button"
              onClick={toggleHighContrast}
              className="btn-secondary"
              style={{
                borderColor: highContrast ? '#A4CBB3' : undefined,
                color: highContrast ? '#A4CBB3' : '#A9AFAC'
              }}
            >
              {highContrast ? 'Activado' : 'Desactivado'}
            </button>
          </div>
        </div>
      </section>

      {/* 3. Compromiso ético y privacidad */}
      <section className="card" style={{ marginBottom: '24px', backgroundColor: 'rgba(23, 40, 32, 0.4)' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#F1F1EB', marginBottom: '8px' }}>
          Tus datos, tu refugio
        </h2>
        <ul style={{ paddingLeft: '20px', color: '#A9AFAC', fontSize: '0.9rem', lineHeight: '1.7' }}>
          <li>Tus escritos de diario jamás son leídos por administradores ni terceros.</li>
          <li>No compartimos tu información con anunciantes ni redes de publicidad.</li>
          <li>No realizamos diagnósticos clínicos automáticos a partir de tus estados emocionales.</li>
          <li>Podés exportar o eliminar todos tus datos en cualquier momento.</li>
        </ul>

        <div style={{ marginTop: '20px', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <button onClick={handleExport} className="btn-secondary" style={{ fontSize: '0.9rem' }}>
            <DownloadIcon size={16} />
            <span>Descargar todos mis datos (JSON)</span>
          </button>
        </div>
      </section>

      {/* 4. Zona de Peligro: Eliminación de Cuenta */}
      <section className="card" style={{ border: '1px solid rgba(201, 98, 87, 0.4)' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#ff9d94', marginBottom: '8px' }}>
          Eliminar cuenta y datos personales
        </h2>
        <p style={{ color: '#A9AFAC', fontSize: '0.9rem', marginBottom: '16px' }}>
          Al eliminar tu cuenta, todos tus registros emocionales, entradas de diario, preferencias e historial de actividades se destruirán permanentemente de la base de datos sin posibilidad de recuperación.
        </p>

        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="btn-danger"
          style={{ fontSize: '0.9rem' }}
        >
          <TrashIcon size={16} />
          <span>Eliminar mi cuenta definitivamente</span>
        </button>
      </section>

      {/* Modal Confirmación de Eliminación */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmar eliminación permanente"
      >
        <div>
          <p style={{ color: '#A9AFAC', marginBottom: '16px', lineHeight: '1.6' }}>
            Por favor, ingresá tu contraseña para confirmar la eliminación de tu cuenta y todos los datos asociados:
          </p>

          {deleteError && (
            <p style={{ color: '#ff9d94', fontSize: '0.88rem', marginBottom: '12px' }}>
              {deleteError}
            </p>
          )}

          <input
            type="password"
            placeholder="Tu contraseña actual"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            className="form-input"
            style={{ width: '100%', marginBottom: '20px' }}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button onClick={() => setShowDeleteModal(false)} className="btn-ghost">
              Cancelar
            </button>
            <button onClick={handleDeleteAccount} className="btn-danger" disabled={deleting}>
              {deleting ? 'Eliminando...' : 'Sí, eliminar mi cuenta'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
