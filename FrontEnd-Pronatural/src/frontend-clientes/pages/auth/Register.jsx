import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { api } from '../../../utils/api';
import AuthLayout from '../../../components/layout/AuthLayout';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff } from 'react-icons/fi';
export default function Register() {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  const { registerCustomer } = useAuth();
  const navigate = useNavigate();
  const password = watch('password');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const onSubmit = async (data) => {
    try {
      const success = await registerCustomer(data);
      if (success) {
        setShowVerifyModal(true);
      } else {
        toast.error('Error al registrar la cuenta');
      }
    } catch (error) {
      toast.error(error.message || 'Error inesperado durante el registro');
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!verificationCode) return toast.error('Ingresa el código');
    setIsVerifying(true);
    try {
      await api.verifyCustomerCodeEmail(verificationCode);
      toast.success('Cuenta verificada exitosamente');
      navigate('/login');
    } catch (error) {
      toast.error(error.message || 'Error al verificar');
    } finally {
      setIsVerifying(false);
    }
  };

  const leftPanel = (
    <div className="absolute inset-0 bg-[#0e2a1b] flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute top-12 left-12 z-10">
        <h1 className="text-white text-[22px] font-bold tracking-tighter">PRONATURAL</h1>
      </div>
      <div className="relative z-0 flex flex-col items-center opacity-10 transform -rotate-12 scale-150 pointer-events-none">
        <span className="text-9xl font-serif italic text-white whitespace-nowrap">Safe</span>
        <span className="text-9xl font-serif italic text-white whitespace-nowrap ml-20">work</span>
      </div>
      <div className="absolute bottom-40 w-full text-center z-10 opacity-30">
        <p className="text-white text-4xl font-serif tracking-widest">safe work</p>
      </div>
      <div className="absolute bottom-12 left-12 z-10">
        <p className="text-[#84a592] text-[9px] tracking-[0.2em] uppercase">Establecido MMXXIV</p>
        <h2 className="text-white text-[42px] font-bold leading-[0.95] tracking-tighter mt-4 max-w-[340px]">
          Acceso al Inicio concedido al registrarse
        </h2>
      </div>
    </div>
  );
  return (
    <AuthLayout leftPanel={leftPanel}>
      <div className="mb-10">
        <p className="text-[10px] font-bold text-orange-700 tracking-widest uppercase mb-4">Registro Técnico</p>
        <h2 className="text-[38px] font-bold leading-none tracking-tighter text-brand-dark mb-4">CREAR CUENTA</h2>
        <p className="text-[10px] text-gray-500 font-semibold tracking-widest uppercase leading-relaxed max-w-sm">
          ÚNETE AL REGISTRO PARA ACCESO PRIORITARIO A LANZAMIENTOS DE MICRO-LOTES
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-[9px] font-bold text-gray-500 tracking-[0.15em] uppercase mb-2">Nombre Completo</label>
          <input
            type="text"
            placeholder="ALEXANDER VANCE"
            {...register('name', { 
              required: 'El nombre es requerido',
              minLength: { value: 3, message: 'El nombre debe tener al menos 3 caracteres' },
              pattern: { value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, message: 'Solo se permiten letras y espacios' }
            })}
            className={`w-full bg-transparent border-b ${errors.name ? 'border-red-500' : 'border-gray-200'} py-2 text-[13px] focus:outline-none focus:border-brand-dark transition-colors uppercase`}
          />
          {errors.name && <p className="text-red-500 text-[10px] mt-1.5">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-[9px] font-bold text-gray-500 tracking-[0.15em] uppercase mb-2">Identificador de Correo Electrónico</label>
          <input
            type="email"
            placeholder="curator@archive.com"
            {...register('email', { 
              required: 'El correo es requerido', 
              pattern: { 
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, 
                message: 'El formato de correo no es válido' 
              },
              onChange: (e) => e.target.value = e.target.value.toLowerCase()
            })}
            className={`w-full bg-transparent border-b ${errors.email ? 'border-red-500' : 'border-gray-200'} py-2 text-[13px] focus:outline-none focus:border-brand-dark transition-colors lowercase`}
          />
          {errors.email && <p className="text-red-500 text-[10px] mt-1.5">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-[9px] font-bold text-gray-500 tracking-[0.15em] uppercase mb-2">Contraseña Encriptada</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="•••••••••••••"
              {...register('password', { 
                required: 'La contraseña es requerida', 
                minLength: { value: 8, message: 'Debe tener al menos 8 caracteres' },
                pattern: { 
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/, 
                  message: 'Debe incluir mayúscula, minúscula y número' 
                }
              })}
              className={`w-full bg-transparent border-b ${errors.password ? 'border-red-500' : 'border-gray-200'} py-2 text-[13px] focus:outline-none focus:border-brand-dark transition-colors pr-10`}
            />
            <button 
              type="button"
              className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-dark p-2"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-[10px] mt-1.5">{errors.password.message}</p>}
        </div>
        <div>
          <label className="block text-[9px] font-bold text-gray-500 tracking-[0.15em] uppercase mb-2">Confirmar Contraseña</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="•••••••••••••"
              {...register('confirmPassword', { 
                required: 'Confirma tu contraseña',
                validate: value => value === password || 'Las contraseñas no coinciden'
              })}
              className={`w-full bg-transparent border-b ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200'} py-2 text-[13px] focus:outline-none focus:border-brand-dark transition-colors pr-10`}
            />
            <button 
              type="button"
              className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-dark p-2"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-red-500 text-[10px] mt-1.5">{errors.confirmPassword.message}</p>}
        </div>
        <div className="pt-4">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-[#0a2016] text-white text-[10px] font-bold tracking-[0.2em] uppercase py-4 hover:bg-[#123827] transition-colors disabled:opacity-70 cursor-pointer"
          >
            {isSubmitting ? 'Registrando...' : 'Registrar Cuenta'}
          </button>
        </div>
        <div className="text-center pt-8 border-t border-gray-100 mt-8 relative">
          <span className="bg-brand-bg px-4 text-[9px] tracking-widest text-gray-300 absolute -top-[7px] left-1/2 -translate-x-1/2 uppercase">¿Ya registrado?</span>
          <Link to="/login" className="inline-block mt-4 text-[10px] font-bold tracking-[0.15em] text-brand-dark hover:text-gray-600 uppercase">
            Acceder a perfil<br/>existente
          </Link>
        </div>
      </form>
      <div className="mt-16">
        <p className="text-[8px] font-bold text-brand-dark uppercase tracking-widest mb-1.5">PROTOCOLO DE DATOS:</p>
        <p className="text-[6px] tracking-widest text-gray-400 uppercase leading-[1.6]">
          TODA LA INFORMACIÓN SE ALMACENA BAJO LA LEY DE RETENCIÓN.<br/>
          LA REPRESENTACIÓN DEL ARCHIVO ES PROPIETARIA.<br/>
          ACEPTAS RECIBIR ACTUALIZACIONES TÉCNICAS, DE CURADURÍA Y NOTIFICACIONES DE MICRO-LOTES.
        </p>
      </div>
      {showVerifyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-brand-bg p-8 max-w-md w-full border border-gray-200">
            <h3 className="text-xl font-bold text-brand-dark mb-4">Verificar Cuenta</h3>
            <p className="text-sm text-gray-500 mb-6">Hemos enviado un código a tu correo.</p>
            <form onSubmit={handleVerify}>
              <input
                type="text"
                placeholder="Código de verificación"
                className="w-full bg-transparent border-b border-gray-200 py-2 mb-6 focus:outline-none focus:border-brand-dark text-center tracking-[0.5em]"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
              <button 
                type="submit" 
                disabled={isVerifying}
                className="w-full bg-[#0a2016] text-white py-3 text-xs font-bold tracking-[0.2em] uppercase disabled:opacity-50"
              >
                {isVerifying ? 'Verificando...' : 'Verificar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
