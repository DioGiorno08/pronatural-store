import React from 'react';
import { Link } from 'react-router-dom';

const RegisterForm = () => {
  return (
    <div className="pro-container">
      <div className="pro-register-card">
        
        {/* PANEL IZQUIERDO */}
        <div className="pro-branding-panel">
          <div className="pro-top-nav">PRONATURAL</div>
          
          <div className="pro-watermark-wrapper">
            <span className="watermark-script">Safe</span>
            <span className="watermark-bold">WORK</span>
            <p className="est-label">safe work</p>
          </div>

          <div className="pro-branding-bottom">
            <p className="est-label">Establecido MMXXIV</p>
            <h1>Acceso al archivo concedido al registrarse</h1>
          </div>
        </div>

        {/* PANEL DERECHO */}
        <div className="pro-form-panel">
          <div className="pro-form-container">
            <header className="pro-form-header">
              <p className="orange-label">REGISTRO TÉCNICO</p>
              <h2 className="title-create">CREAR CUENTA</h2>
              <p className="desc-text">ÚNETE AL REGISTRO PARA ACCESO PRIORITARIO A LANZAMIENTOS DE MICRO-LOTES.</p>
            </header>

            <form className="pro-form-content">
              <div className="pro-input-field">
                <label>NOMBRE COMPLETO</label>
                <input type="text" placeholder="ALEXANDER VANCE" required />
              </div>

              <div className="pro-input-field">
                <label>IDENTIFICADOR DE CORREO ELECTRÓNICO</label>
                <input type="email" placeholder="CURATOR@ARCHIVE.COM" required />
              </div>

              <div className="pro-input-field">
                <label>CONTRASEÑA ENCRIPTADA</label>
                <input type="password" placeholder="••••••••••••" required />
              </div>

              <div className="pro-input-field">
                <label>CONFIRMAR CONTRASEÑA</label>
                <input type="password" placeholder="••••••••••••" required />
              </div>

              <button type="submit" className="pro-submit-btn">REGISTRAR CUENTA</button>
            </form>

            {/* SECCIÓN INFERIOR MEJORADA */}
            <div className="pro-register-footer">
              <div className="pro-login-redirect">
                <p className="est-label">¿YA REGISTRADO?</p>
                <Link to="/login" className="pro-link-button">
                  ACCEDER A PERFIL EXISTENTE
                </Link>
              </div>

              <div className="pro-protocol-box">
                <p className="protocol-title">PROTOCOLOS DE DATOS:</p>
                <p className="protocol-text">
                  TODA LA INFORMACIÓN SE ALMACENA BAJO LA LEY DE PROTECCIÓN. 
                  AL REGISTRARTE ACEPTAS NUESTROS TÉRMINOS.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RegisterForm;