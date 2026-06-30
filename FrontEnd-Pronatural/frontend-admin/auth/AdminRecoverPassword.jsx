import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { api } from '../../../utils/api';
import toast from 'react-hot-toast';

export default function AdminRecoverPassword() {
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm({ mode: 'onTouched' });
  const { recoverPassword } = useAuth();
  const navigate = useNavigate();

  const handleRequestCode = async (data) => {
    setIsProcessing(true);
    try {
      await recoverPassword(data);
      setStep(2);
    } catch (error) {
      // Error is handled by recoverPassword
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyCode = async (data) => {
    setIsProcessing(true);
    try {
      await api.verifyAdminRecoveryCode(data.code);
      toast.success('Código verificado con éxito');
      setStep(3);
    } catch (error) {
      toast.error(error.message || 'Código inválido o expirado');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetPassword = async (data) => {
    setIsProcessing(true);
    try {
      await api.updateAdminPassword(data.newPassword, data.confirmNewPassword);
      toast.success('Contraseña actualizada exitosamente');
      navigate('/admin/login');
    } catch (error) {
      toast.error(error.message || 'Error al actualizar contraseña');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0d0f] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-[#30b466]/5 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-[420px] relative z-10">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-14 h-14 bg-[#161b1e] border border-white/5 rounded-[14px] flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" fill="#75e29f" />
              <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3L12 21Z" fill="#30b466" />
            </svg>
          </div>
          <h1 className="text-[24px] font-bold text-white tracking-tight">
            {step === 1 && "Recuperar Acceso"}
            {step === 2 && "Verificar Código"}
            {step === 3 && "Nueva Contraseña"}
          </h1>
          <p className="text-gray-400 text-[13px] mt-2 leading-relaxed px-4">
            {step === 1 && "Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña."}
            {step === 2 && "Hemos enviado un código de 6 dígitos a tu correo. Ingrésalo a continuación."}
            {step === 3 && "Crea una nueva contraseña segura para tu cuenta de administrador."}
          </p>
        </div>

        <div className="bg-[#121619] border border-white/10 rounded-[16px] p-8 shadow-2xl backdrop-blur-xl">
          {step === 1 && (
            <form onSubmit={handleSubmit(handleRequestCode)} className="space-y-5">
              <div>
                <label className="text-gray-400 text-[11px] uppercase tracking-wider font-semibold mb-2 block">Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="ejemplo@pronatural.com"
                  {...register("email", { 
                    required: "El correo es obligatorio",
                    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Correo inválido" }
                  })}
                  className={`w-full bg-[#0d1114] border ${errors.email ? 'border-red-500/50' : 'border-white/10'} rounded-[10px] px-4 py-3 text-[14px] text-white placeholder-gray-600 focus:outline-none focus:border-[#4ade80] transition-colors`}
                />
                {errors.email && <p className="text-red-400 text-[11px] mt-1.5 font-medium">{errors.email.message}</p>}
              </div>
              <button 
                type="submit" 
                disabled={isProcessing}
                className="w-full py-3 mt-4 bg-[#30b466] hover:bg-[#289e58] disabled:opacity-50 disabled:cursor-not-allowed text-[#0a110d] text-[14px] font-bold rounded-[10px] transition-all shadow-[0_0_15px_rgba(48,180,102,0.2)] hover:shadow-[0_0_20px_rgba(48,180,102,0.4)]"
              >
                {isProcessing ? 'Enviando...' : 'Enviar Instrucciones'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit(handleVerifyCode)} className="space-y-5">
              <div>
                <label className="text-gray-400 text-[11px] uppercase tracking-wider font-semibold mb-2 block">Código de Verificación</label>
                <input
                  type="text"
                  placeholder="Ej. a1b2c3"
                  {...register("code", { 
                    required: "El código es obligatorio",
                    minLength: { value: 6, message: "Debe tener 6 caracteres" }
                  })}
                  className={`w-full bg-[#0d1114] border ${errors.code ? 'border-red-500/50' : 'border-white/10'} rounded-[10px] px-4 py-3 text-[14px] text-white text-center tracking-widest placeholder-gray-600 focus:outline-none focus:border-[#4ade80] transition-colors`}
                />
                {errors.code && <p className="text-red-400 text-[11px] mt-1.5 font-medium">{errors.code.message}</p>}
              </div>
              <button 
                type="submit" 
                disabled={isProcessing}
                className="w-full py-3 mt-4 bg-[#30b466] hover:bg-[#289e58] disabled:opacity-50 disabled:cursor-not-allowed text-[#0a110d] text-[14px] font-bold rounded-[10px] transition-all shadow-[0_0_15px_rgba(48,180,102,0.2)] hover:shadow-[0_0_20px_rgba(48,180,102,0.4)]"
              >
                {isProcessing ? 'Verificando...' : 'Verificar Código'}
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmit(handleResetPassword)} className="space-y-5">
              <div>
                <label className="text-gray-400 text-[11px] uppercase tracking-wider font-semibold mb-2 block">Nueva Contraseña</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register("newPassword", { 
                    required: "La contraseña es obligatoria",
                    minLength: { value: 8, message: "Mínimo 8 caracteres" }
                  })}
                  className={`w-full bg-[#0d1114] border ${errors.newPassword ? 'border-red-500/50' : 'border-white/10'} rounded-[10px] px-4 py-3 text-[14px] text-white placeholder-gray-600 focus:outline-none focus:border-[#4ade80] transition-colors`}
                />
                {errors.newPassword && <p className="text-red-400 text-[11px] mt-1.5 font-medium">{errors.newPassword.message}</p>}
              </div>
              <div>
                <label className="text-gray-400 text-[11px] uppercase tracking-wider font-semibold mb-2 block">Confirmar Contraseña</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register("confirmNewPassword", { 
                    required: "Debes confirmar la contraseña",
                    validate: val => val === watch('newPassword') || "Las contraseñas no coinciden"
                  })}
                  className={`w-full bg-[#0d1114] border ${errors.confirmNewPassword ? 'border-red-500/50' : 'border-white/10'} rounded-[10px] px-4 py-3 text-[14px] text-white placeholder-gray-600 focus:outline-none focus:border-[#4ade80] transition-colors`}
                />
                {errors.confirmNewPassword && <p className="text-red-400 text-[11px] mt-1.5 font-medium">{errors.confirmNewPassword.message}</p>}
              </div>
              <button 
                type="submit" 
                disabled={isProcessing}
                className="w-full py-3 mt-4 bg-[#30b466] hover:bg-[#289e58] disabled:opacity-50 disabled:cursor-not-allowed text-[#0a110d] text-[14px] font-bold rounded-[10px] transition-all shadow-[0_0_15px_rgba(48,180,102,0.2)] hover:shadow-[0_0_20px_rgba(48,180,102,0.4)]"
              >
                {isProcessing ? 'Guardando...' : 'Guardar Nueva Contraseña'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-gray-500 text-[12px] mt-6">
          <Link to="/admin/login" className="text-white hover:text-[#4ade80] font-medium transition-colors flex items-center justify-center gap-1">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Volver al Inicio de Sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
