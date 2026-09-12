import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { api } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';

export default function Contact() {
   const { user, isAuthenticated } = useAuth();
   const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
   const [isSending, setIsSending] = useState(false);

   // Auto-completar nombre y correo si el usuario está autenticado
   useEffect(() => {
      if (user) {
         if (user.name) setValue('name', user.name);
         if (user.email) setValue('email', user.email);
      }
   }, [user, setValue]);

   const onSubmit = async (data) => {
      const loadingToast = toast.loading('Enviando mensaje a la administración...');
      try {
         setIsSending(true);
         const payload = {
            name: data.name?.trim() || user?.name || '',
            email: (isAuthenticated && user?.email) ? user.email.trim() : data.email?.trim(),
            category: data.category,
            message: data.message?.trim(),
         };

         await api.sendContactMessage(payload);
         toast.dismiss(loadingToast);
         toast.success('¡Mensaje enviado con éxito! Los administradores han recibido tu consulta.');
         reset({
            name: user?.name || '',
            email: user?.email || '',
            category: '',
            message: ''
         });
      } catch (err) {
         toast.dismiss(loadingToast);
         toast.error(err.message || 'Error al enviar el mensaje. Por favor intenta nuevamente.');
      } finally {
         setIsSending(false);
      }
   };

   return (
      <>
         <div className="min-h-[calc(100vh-80px)] bg-brand-bg flex flex-col lg:flex-row">
            <div className="w-full lg:w-[45%] flex flex-col justify-center px-6 md:px-12 lg:px-24 xl:px-32 py-12 md:py-20 relative">
               <h1 className="text-5xl md:text-[72px] lg:text-[88px] font-bold tracking-tighter text-brand-dark mb-8 md:mb-12 leading-none">Contacto</h1>
               <p className="text-base md:text-[18px] text-brand-dark font-medium italic leading-[1.8] max-w-sm mb-12 md:mb-20 opacity-80">
                  Un canal directo para consultas técnicas, acuerdos de venta al por mayor y solicitudes de información de catálogo.
               </p>

               {/* Caja informativa para el usuario */}
               <div className="bg-[#123827]/5 border border-[#123827]/15 rounded-2xl p-6 max-w-sm backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-2">
                     <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
                     <h3 className="text-xs font-bold uppercase tracking-wider text-brand-dark">Atención Directa</h3>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                     Tu mensaje será derivado a las bandejas de entrada de todos los administradores autorizados de ProNatural.
                  </p>
               </div>
            </div>

            <div className="w-full lg:w-[55%] bg-[#fcfbf8] border-t lg:border-t-0 lg:border-l border-gray-100 flex flex-col justify-center px-6 md:px-12 lg:px-24 xl:px-32 py-12 md:py-20">
               
               {/* Banner de estado de usuario autenticado */}
               {isAuthenticated && user?.email ? (
                  <div className="mb-8 p-4 bg-emerald-50/80 border border-emerald-200/80 rounded-xl flex items-start gap-3.5 shadow-sm">
                     <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-700 mt-0.5">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                     </div>
                     <div>
                        <div className="flex items-center gap-2">
                           <span className="text-xs font-bold text-emerald-950">Sesión iniciada como</span>
                           <span className="text-[10px] bg-emerald-200/70 text-emerald-800 font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider">Verificado</span>
                        </div>
                        <p className="text-xs text-emerald-800 mt-0.5 font-medium">
                           {user?.name} &bull; <span className="font-mono">{user?.email}</span>
                        </p>
                        <p className="text-[11px] text-emerald-700/80 mt-1">
                           El mensaje se enviará a los administradores identificándote con tu correo oficial registrado.
                        </p>
                     </div>
                  </div>
               ) : (
                  <div className="mb-8 p-3.5 bg-amber-50/70 border border-amber-200/70 rounded-xl flex items-center justify-between text-xs text-amber-900">
                     <span>¿Ya tienes cuenta? Inicia sesión para vincular tu correo automáticamente.</span>
                     <Link to="/login" className="font-bold underline hover:text-amber-950 ml-2 whitespace-nowrap">
                        Iniciar sesión
                     </Link>
                  </div>
               )}

               <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
                  <div>
                     <label className="block text-[10px] font-bold text-gray-500 tracking-[0.15em] uppercase mb-3">Tu Nombre Completo</label>
                     <input 
                        type="text" 
                        placeholder="Ej: Juan Pérez" 
                        {...register('name', { required: 'Ingresa tu nombre completo' })} 
                        className="w-full border-b border-gray-200 py-3.5 text-[14px] bg-transparent focus:outline-none focus:border-[#123827] transition-colors" 
                     />
                     {errors.name && <span className="text-red-500 text-[10px] mt-1.5 block">{errors.name.message}</span>}
                  </div>

                  <div>
                     <div className="flex items-center justify-between mb-1">
                        <label className="block text-[10px] font-bold text-gray-500 tracking-[0.15em] uppercase">Tu Correo Electrónico</label>
                        {isAuthenticated && (
                           <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                              <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg>
                              Vinculado a tu sesión
                           </span>
                        )}
                     </div>
                     <p className="text-[10px] text-gray-400 mb-3">
                        {isAuthenticated ? 'Los administradores responderán directamente a este correo.' : 'Escribe el correo donde deseas recibir la respuesta del administrador.'}
                     </p>
                     <input 
                        type="email" 
                        placeholder="ejemplo: tu-correo@gmail.com" 
                        readOnly={isAuthenticated && !!user?.email}
                        {...register('email', { 
                           required: 'Ingresa tu correo para poder responderte', 
                           pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Formato de correo no válido' } 
                        })} 
                        className={`w-full border-b border-gray-200 py-3.5 text-[14px] bg-transparent focus:outline-none focus:border-[#123827] transition-colors lowercase ${isAuthenticated && user?.email ? 'text-gray-700 bg-gray-50/60 font-medium cursor-not-allowed' : ''}`} 
                     />
                     {errors.email && <span className="text-red-500 text-[10px] mt-1.5 block">{errors.email.message}</span>}
                  </div>

                  <div>
                     <label className="block text-[10px] font-bold text-gray-500 tracking-[0.15em] uppercase mb-3">Motivo de la Consulta</label>
                     <div className="relative">
                        <select {...register('category', { required: 'Selecciona un motivo' })} className="w-full border-b border-gray-200 py-3.5 text-[14px] text-brand-dark bg-transparent focus:outline-none focus:border-[#123827] uppercase transition-colors cursor-pointer appearance-none">
                           <option value="">Selecciona el motivo de tu mensaje...</option>
                           <option value="mayor">Ventas al por mayor / Distribuidores</option>
                           <option value="tecnicas">Consultas de productos y catálogo</option>
                           <option value="general">Consulta general / Soporte</option>
                        </select>
                        <svg className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"></path></svg>
                     </div>
                     {errors.category && <span className="text-red-500 text-[10px] mt-1.5 block">{errors.category.message}</span>}
                  </div>

                  <div>
                     <label className="block text-[10px] font-bold text-gray-500 tracking-[0.15em] uppercase mb-3">Detalle de tu Mensaje</label>
                     <textarea rows="4" placeholder="Escribe aquí tu duda, consulta o requerimiento..." {...register('message', { required: 'Escribe tu mensaje' })} className="w-full border-b border-gray-200 py-3.5 text-[14px] bg-transparent focus:outline-none focus:border-[#123827] transition-colors resize-none"></textarea>
                     {errors.message && <span className="text-red-500 text-[10px] mt-1.5 block">{errors.message.message}</span>}
                  </div>

                  <div className="flex justify-end pt-6">
                     <button type="submit" disabled={isSending} className="bg-[#0a2016] text-white flex items-center px-8 py-5 hover:bg-[#123827] disabled:opacity-50 transition-colors group whitespace-nowrap cursor-pointer rounded">
                        <span className="text-[10px] font-bold tracking-[0.2em] uppercase mr-4">{isSending ? 'ENVIANDO...' : 'ENVIAR MENSAJE'}</span>
                        <svg className="w-4 h-4 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
                     </button>
                  </div>
               </form>
            </div>
         </div>
      </>
   );
}
