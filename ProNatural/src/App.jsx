import React, { useState } from 'react';
// Con esto jalamos todo el diseño que acabas de guardar
import './App.css';

const RecoveryIcon = () => (
  <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <circle cx="12" cy="12" r="1" />
  </svg>
);

const App = () => {
  const [view, setView] = useState('register'); // 'login', 'register', 'recovery'

  return (
    <div className="pro-container">
      {view === 'recovery' ? (
        <div className="pro-recovery-card">
          <div className="recovery-icon-wrapper">
            <RecoveryIcon />
          </div>
          <span className="orange-tag">Seguridad de Archivo</span>
          <h2 className="form-title">Recuperar Cuenta</h2>
          
          <div className="pro-input-group">
            <label>Correo Electrónico</label>
            <input type="email" placeholder="usuario@pronatural.com" />
          </div>
          
          <button className="btn-primary-pro">Enviar Instrucciones</button>
          
          <div className="pro-footer-action">
            <button className="link-footer-pro" onClick={() => setView('login')}>
              Volver al inicio
            </button>
          </div>
        </div>
      ) : (
        <div className="pro-main-card">
          <div className="pro-branding-side">
            <div className="pro-logo-top">PRONATURAL</div>
            
            <div className="pro-watermark">
              <span className="watermark-script">Safe</span>
              <span className="watermark-bold">WORK</span>
            </div>

            <div className="branding-content">
              <span className="est-label">Establecido MMXXIV</span>
              <h1>Acceso al archivo concedido al registrarse</h1>
            </div>
          </div>

          <div className="pro-form-side">
            <span className="orange-tag">
              {view === 'register' ? 'Crear nueva credencial' : 'Control de acceso'}
            </span>
            <h2 className="form-title">
              {view === 'register' ? 'Registrar Usuario' : 'Iniciar Sesión'}
            </h2>

            <div className="pro-input-group">
              <label>Correo Electrónico</label>
              <input type="email" />
            </div>

            <div className="pro-input-group">
              <label>Contraseña</label>
              <input type="password" />
            </div>

            <button className="btn-primary-pro">
              {view === 'register' ? 'Generar Acceso' : 'Entrar al Archivo'}
            </button>

            <div className="pro-footer-action">
              <span>
                {view === 'register' ? '¿Ya tienes una cuenta?' : '¿No tienes acceso?'}
              </span>
              
              <button 
                className="link-footer-pro" 
                onClick={() => setView(view === 'register' ? 'login' : 'register')}
              >
                {view === 'register' ? 'Inicia Sesión Aquí' : 'Solicitar Registro'}
              </button>

              {view === 'login' && (
                <button 
                  className="link-footer-pro" 
                  onClick={() => setView('recovery')}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;