import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
export default function Contact() {
   const { register, handleSubmit, reset, formState: { errors } } = useForm();
   const onSubmit = () => {
      toast.success('Mensaje enviado. Nos pondremos en contacto pronto.');
      reset();
   };
   return (
      <div className="min-h-[calc(100vh-80px)] bg-brand-bg flex flex-col lg:flex-row">
         <div className="w-full lg:w-[45%] flex flex-col justify-center px-6 md:px-12 lg:px-24 xl:px-32 py-12 md:py-20 relative">
            <h1 className="text-5xl md:text-[72px] lg:text-[88px] font-bold tracking-tighter text-brand-dark mb-8 md:mb-12 leading-none">Contacto</h1>
            <p className="text-base md:text-[18px] text-brand-dark font-medium italic leading-[1.8] max-w-sm mb-16 md:mb-32 opacity-80">
               Un canal directo para consultas técnicas, acuerdos de venta al por mayor y solicitudes de documentación de catalogo
            </p>
         </div>
         <div className="w-full lg:w-[55%] bg-[#fcfbf8] border-t lg:border-t-0 lg:border-l border-gray-100 flex flex-col justify-center px-6 md:px-12 lg:px-24 xl:px-32 py-12 md:py-20">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-16">
               <div>
                  <label className="block text-[9px] font-bold text-gray-400 tracking-[0.2em] uppercase mb-4">NOMBRE COMPLETO [IDENTITY]</label>
                  <input type="text" placeholder="Tu nombre" {...register('name', { required: 'Requerido' })} className="w-full border-b border-gray-200 py-4 text-[14px] bg-transparent focus:outline-none focus:border-brand-dark uppercase transition-colors" />
                  {errors.name && <span className="text-red-500 text-[10px] mt-2 block">{errors.name.message}</span>}
               </div>
               <div>
                  <label className="block text-[9px] font-bold text-gray-400 tracking-[0.2em] uppercase mb-4">CORREO ELECTRONICO [POINT OF CONTACT]</label>
                  <input type="email" placeholder="usuario@gmail.com" {...register('email', { required: 'Requerido' })} className="w-full border-b border-gray-200 py-4 text-[14px] bg-transparent focus:outline-none focus:border-brand-dark uppercase transition-colors" />
                  {errors.email && <span className="text-red-500 text-[10px] mt-2 block">{errors.email.message}</span>}
               </div>
               <div>
                  <label className="block text-[9px] font-bold text-gray-400 tracking-[0.2em] uppercase mb-4">ASUNTO [DEPARTMENT ROUTING]</label>
                  <div className="relative">
                     <select {...register('category', { required: 'Requerido' })} className="w-full border-b border-gray-200 py-4 text-[14px] text-brand-dark bg-transparent focus:outline-none focus:border-brand-dark uppercase transition-colors cursor-pointer appearance-none">
                        <option value="">SELECCIONAR CATEGORIA</option>
                        <option value="mayor">VENTAS AL POR MAYOR</option>
                        <option value="tecnicas">CONSULTAS TÉCNICAS</option>
                     </select>
                     <svg className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"></path></svg>
                  </div>
                  {errors.category && <span className="text-red-500 text-[10px] mt-2 block">{errors.category.message}</span>}
               </div>
               <div>
                  <label className="block text-[9px] font-bold text-gray-400 tracking-[0.2em] uppercase mb-4">MENSAJE [CONTENT PAYLOAD]</label>
                  <textarea rows="3" placeholder="DESCRIBA SU CONSULTA EN ESTE APARTADO" {...register('message', { required: 'Requerido' })} className="w-full border-b border-gray-200 py-4 text-[14px] bg-transparent focus:outline-none focus:border-brand-dark uppercase transition-colors resize-none"></textarea>
                  {errors.message && <span className="text-red-500 text-[10px] mt-2 block">{errors.message.message}</span>}
               </div>
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-8 gap-10">
                  <p className="text-[7.5px] text-gray-400 tracking-[0.15em] font-bold uppercase leading-[1.8] max-w-[260px]">
                     AL DARLE ENVIAR, USTED ACEPTA NUESTROS PROTOCOLOS DE PROCESAMIENTO DE DATOS Y TÉRMINOS DE PRIVACIDAD DE ARCHIVO.
                  </p>
                  <button type="submit" className="bg-[#0a2016] text-white flex items-center px-10 py-6 hover:bg-[#123827] transition-colors group whitespace-nowrap cursor-pointer">
                     <span className="text-[10px] font-bold tracking-[0.2em] uppercase mr-6">ENVIAR MENSAJE</span>
                     <svg className="w-4 h-4 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
                  </button>
               </div>
            </form>
         </div>
      </div>
   );
}
