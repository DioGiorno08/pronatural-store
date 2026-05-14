import React, { useState } from 'react';
import './App.css';

const App = () => {
  // Estado para controlar qué pantalla mostrar: 'login', 'register' o 'recovery'
  const [view, setView] = useState('login'); 

  // --- VISTA DE RECUPERACIÓN (Estilo Volcán / Fullscreen) ---
  if (view === 'recovery') {
    return (
      <div className="recovery-bg-fullscreen">
        <div className="recovery-icon-circle">🔄</div>
        <span className="tag-recovery-orange">SEGURIDAD DE ARCHIVO</span>
        <h2 className="recovery-title-fs">RECUPERAR CUENTA</h2>
        
        <p className="form-sub-recovery" style={{color: 'white', opacity: 0.9}}>
          Ingrese su correo electrónico institucional para recibir las instrucciones de recuperación.
        </p>

        <div style={{marginBottom: '10px', fontSize: '10px', fontWeight: '800', letterSpacing: '1px'}}>
          CORREO ELECTRÓNICO
        </div>
        <input 
          type="email" 
          className="recovery-input-fs" 
          placeholder="USUARIO@PRONATURAL.COM" 
        />
        
        <button className="btn-recovery-fs">ENVIAR INSTRUCCIONES —</button>
        
        <div style={{marginTop: '20px'}}>
          <button 
            className="btn-link-simple" 
            style={{color: 'white', borderBottom: '1px solid white', background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer'}}
            onClick={() => setView('login')}
          >
            VOLVER AL INICIO
          </button>
        </div>
      </div>
    );
  }

  // --- VISTAS DE LOGIN Y REGISTRO (Estilo Split Card) ---
  return (
    <div className="pro-container">
      <div className="pro-card">
        
        {/* PANEL IZQUIERDO DINÁMICO */}
        <div className={`pro-branding ${view === 'login' ? 'bg-coffee' : 'bg-green'}`}>
          <div className="pro-logo-top">PRONATURAL</div>
          
          {/* Marca de agua solo para registro */}
          {view === 'register' && (
            <div className="watermark-center">
              <span className="script-txt">Safe</span>
              <span className="bold-txt">WORK</span>
              <div style={{fontSize: '18px', letterSpacing: '5px', opacity: 0.5, marginTop: '10px'}}>safe work</div>
            </div>
          )}

          <div className="branding-footer">
            <div style={{fontSize: '10px', opacity: 0.6, marginBottom: '10px'}}>Establecido MMXXIV</div>
            <h1>Acceso al archivo concedido al registrarse</h1>
          </div>
        </div>

        {/* PANEL DERECHO DINÁMICO */}
        <div className="pro-form-side">
          
          {/* FORMULARIO DE LOGIN */}
          {view === 'login' && (
            <>
              <span className="tag-orange">ACCEDER A TU CUENTA</span>
              <h2 className="form-h2">LOG IN</h2>
              <p className="form-sub">
                Introduce tus credenciales autorizadas para acceder a datos técnicos seleccionados.
              </p>

              <div className="field-group">
                <label>CORREO ELECTRÓNICO</label>
                <input type="email" placeholder="curator@pronatural.com" />
              </div>

              <div className="field-group">
                <label>CONTRASEÑA</label>
                <input type="password" placeholder="********" />
              </div>

              <button className="btn-main-dark">ACCEDER AL INICIO</button>

              <div className="login-footer-actions" style={{display: 'flex', justifyContent: 'space-between', marginTop: '30px'}}>
                <button className="btn-link-simple" onClick={() => setView('recovery')}>
                  ¿OLVIDASTE TU CONTRASEÑA?
                </button>
                <button className="btn-link-orange" onClick={() => setView('register')}>
                  CREAR CUENTA
                </button>
              </div>
            </>
          )}

          {/* FORMULARIO DE REGISTRO */}
          {view === 'register' && (
            <>
              <span className="tag-orange">REGISTRO TÉCNICO</span>
              <h2 className="form-h2">CREAR CUENTA</h2>
              <p className="form-sub">Únete al registro para acceso prioritario a lanzamientos de micro-lotes.</p>
              
              <div className="field-group">
                <label>NOMBRE COMPLETO</label>
                <input type="text" placeholder="ALEXANDER VANCE" />
              </div>
              <div className="field-group">
                <label>CORREO ELECTRÓNICO</label>
                <input type="email" placeholder="CURATOR@ARCHIVE.COM" />
              </div>
              <div className="field-group">
                <label>CONTRASEÑA ENCRIPTADA</label>
                <input type="password" placeholder="••••••••••••" />
              </div>
              <div className="field-group">
                <label>CONFIRMAR CONTRASEÑA</label>
                <input type="password" placeholder="••••••••••••" />
              </div>

              <button className="btn-main-dark">REGISTRAR CUENTA</button>
              
              <div style={{textAlign: 'center', marginTop: '20px'}}>
                <button className="btn-link-fix" onClick={() => setView('login')}>
                  ACCEDER A PERFIL EXISTENTE
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default App;