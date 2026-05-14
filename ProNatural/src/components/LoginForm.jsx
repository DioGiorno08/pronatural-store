import React from 'react';
import { Link } from 'react-router-dom';

const LoginForm = () => {
  return (
    <div className="pro-container">
      <div className="pro-register-card">
        <div className="pro-branding-panel login-image-bg">
          <div className="pro-top-nav">PRONATURAL</div>
          <div className="pro-branding-bottom">
            <p className="est-label">PRO NATURAL TECHNICAL ARCHIVE</p>
          </div>
        </div>

        <div className="pro-form-panel">
          <div className="pro-form-container">
            <header className="pro-form-header">
              <p className="orange-label">ACCEDER A TU CUENTA</p>
              <h2 className="title-create">LOG IN</h2>
            </header>

            <form className="pro-form-content">
              <div className="pro-input-field">
                <label>CORREO ELECTRÓNICO</label>
                <input type="email" placeholder="curator@pronatural.com" required />
              </div>
              <div className="pro-input-field">
                <label>CONTRASEÑA</label>
                <input type="password" placeholder="••••••••" required />
              </div>
              <button type="submit" className="pro-submit-btn">ACCEDER AL INICIO</button>
            </form>

            <footer className="pro-footer-login-options">
              {/* ESTOS ENLACES DEBEN COINCIDIR CON APP.JSX */}
              <Link to="/forgot-password" size="small" className="small-link">¿OLVIDASTE TU CONTRASEÑA?</Link>
              <Link to="/register" className="small-link bold">CREAR CUENTA</Link>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;