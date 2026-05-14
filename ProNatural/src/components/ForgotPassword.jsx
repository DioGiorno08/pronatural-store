import React from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  return (
    <div className="pro-container recovery-page">
      {/* Tarjeta Central Blanca */}
      <div className="pro-recovery-card">
        <div className="recovery-icon">
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <circle cx="12" cy="12" r="1" />
            <path d="M12 7v5l3 3" />
          </svg>
        </div>

        <header className="recovery-header">
          <h2>RECUPERAR CUENTA</h2>
          <p>Ingrese su correo electrónico para recibir las instrucciones de recuperación de contraseña del sistema de archivo técnico.</p>
        </header>

        <form className="recovery-form">
          <div className="pro-input-field">
            <label>CORREO ELECTRÓNICO</label>
            <div className="input-wrapper">
              <span className="icon">✉</span>
              <input type="email" placeholder="usuario@pronatural.com" required />
            </div>
          </div>

          <button type="submit" className="pro-submit-btn">
            ENVIAR INSTRUCCIONES <span>→</span>
          </button>
        </form>

        <Link to="/login" className="back-link">
          ← VOLVER AL PORTAL DE ACCESO
        </Link>
      </div>

      {/* Banner Verde Inferior (Institucional) */}
      <footer className="pro-bottom-banner">
        <div className="banner-left">
          <strong>PRONATURAL</strong>
          <span>DEPARTAMENTO TÉCNICO | CENTRO DE ARCHIVOS</span>
        </div>
        <div className="banner-right">
          <span>PRIVACY</span>
          <span>TERMS</span>
          <span>SHIPPING</span>
        </div>
      </footer>
    </div>
  );
};

export default ForgotPassword;