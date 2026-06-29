import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import AuthLayout from '../../../components/layout/AuthLayout';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff } from 'react-icons/fi';
export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const onSubmit = async (data) => {
    try {
      const success = await login(data);
      if (success) {
        toast.success('Bienvenido a Pro Natural');
        navigate('/');
      } else {
        toast.error('Credenciales incorrectas');
      }
    } catch (error) {
      toast.error('Error al iniciar sesión');
    }
  };
  const leftPanel = (
    <>
      <img 
        src="https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=1000&auto=format&fit=crop" 
        alt="Coffee Beans" 
        className="absolute inset-0 w-full h-full object-cover opacity-90"
      />
      <div className="absolute inset-0 bg-black/30"></div>
      <div className="absolute top-12 left-12 z-10">
        <h1 className="text-white text-[22px] font-bold tracking-tighter">PRONATURAL</h1>
      </div>
      <div className="absolute bottom-12 left-12 z-10">
        <p className="text-gray-300 text-[9px] font-semibold tracking-[0.2em] uppercase">PRO NATURAL TECHNICAL ARCHIVE</p>
        <p className="text-gray-400 text-[9px] tracking-[0.2em] uppercase mt-1.5">REF NO: PN-0013 / ORIGIN: ETHIOPIA</p>
      </div>
    </>
  );
  return (
    <AuthLayout leftPanel={leftPanel}>
      <div className="mb-12">
        <p className="text-[10px] font-bold text-orange-700 tracking-widest uppercase mb-4">Acceder a tu cuenta</p>
        <h2 className="text-[44px] font-bold leading-none tracking-tighter text-brand-dark">LOG IN</h2>
        <p className="text-[13px] text-gray-600 mt-5 leading-relaxed max-w-sm">
          Introduce tus credenciales autorizadas<br/>
          para acceder a datos técnicos<br/>
          seleccionados y recopilar registros.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-[9px] font-bold text-gray-500 tracking-[0.15em] uppercase mb-2">Correo Electrónico</label>
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
            className={`w-full bg-white border ${errors.email ? 'border-red-500' : 'border-gray-200'} px-4 py-3.5 text-[13px] focus:outline-none focus:border-brand-dark transition-colors lowercase`}
          />
          {errors.email && <p className="text-red-500 text-[10px] mt-1.5">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-[9px] font-bold text-gray-500 tracking-[0.15em] uppercase mb-2">Contraseña</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register('password', { required: 'La contraseña es requerida' })}
              className={`w-full bg-white border ${errors.password ? 'border-red-500' : 'border-gray-200'} px-4 py-3.5 text-[13px] focus:outline-none focus:border-brand-dark transition-colors pr-10`}
            />
            <button 
              type="button"
              className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-dark p-3"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-[10px] mt-1.5">{errors.password.message}</p>}
        </div>
        <div className="pt-2">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-[#0a2016] text-white text-[10px] font-bold tracking-[0.2em] uppercase py-4 hover:bg-[#123827] transition-colors disabled:opacity-70 cursor-pointer"
          >
            {isSubmitting ? 'Verificando...' : 'Acceder al inicio'}
          </button>
        </div>
        <div className="flex items-center justify-between pt-8 mt-8 border-t border-gray-100">
          <Link to="/recover" className="text-[9px] font-semibold tracking-widest text-gray-400 hover:text-brand-dark uppercase max-w-[120px] leading-[1.6]">
            ¿Olvidaste tu<br/>contraseña?
          </Link>
          <Link to="/register" className="text-[9px] font-bold tracking-widest text-orange-700 hover:text-orange-800 uppercase">
            Crear cuenta
          </Link>
        </div>
      </form>
      <div className="mt-20">
        <p className="flex items-center text-[8px] tracking-[0.15em] text-gray-400 uppercase mb-2.5">
          <svg className="w-3.5 h-3.5 mr-2 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          End-to-end archival security
        </p>
        <p className="text-[7px] tracking-[0.15em] text-gray-300 uppercase">
          © 2024 Pro Natural Technical Archive. System version 4.0.1
        </p>
      </div>
    </AuthLayout>
  );
}
