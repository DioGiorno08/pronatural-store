import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useCart } from '../../hooks/useCart';
import { useNavigate } from 'react-router-dom';
import { useGlobalData } from '../../context/GlobalDataContext';

// Wompi temporalmente desactivado
// const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// ─── Componente principal ─────────────────────────────────────────
export default function Checkout() {
  const { register, handleSubmit, watch, trigger, formState: { errors } } = useForm();
  const { subtotal, items, clearCart } = useCart();
  const navigate = useNavigate();
  const { addSale } = useGlobalData();

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isCardSaved, setIsCardSaved] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderSnapshot, setOrderSnapshot] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const shipping = items.length > 0 ? 12.00 : 0;
  const total = subtotal + shipping;

  const cardNumber = watch('cardNumber');
  const cardName = watch('cardName');
  const cardExpiry = watch('cardExpiry');

  // Redirigir al inicio 10 s después del pago exitoso
  useEffect(() => {
    if (isSuccess && orderSnapshot) {
      const formData = watch();
      clearCart();

      // Si el método es WhatsApp, abrir el chat con el resumen
      if (orderSnapshot.paymentMethod === 'whatsapp') {
        const lines = orderSnapshot.items.map(
          item => `• ${item.name || item.title} x${item.quantity} = $${(item.price * item.quantity).toFixed(2)}`
        );
        const msg = [
          '🌿 *ProNatural - Nuevo Pedido*',
          '',
          ...lines,
          '',
          `Subtotal: $${orderSnapshot.subtotal.toFixed(2)}`,
          `Envío: $${orderSnapshot.shipping.toFixed(2)}`,
          `*TOTAL: $${orderSnapshot.total.toFixed(2)}*`,
          '',
          `📦 Dirección: ${formData.address || ''}, ${formData.city || ''}`,
          `📧 Correo: ${formData.email || ''}`,
          '',
          'Método de pago: Transferencia / Efectivo vía WhatsApp'
        ].join('\n');

        const phone = '50322222222'; // ← cambia por el número de la tienda
        const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
        setTimeout(() => window.open(waUrl, '_blank'), 500);
      } else {
        toast.success(`Recibo digital enviado a ${formData.email || 'tu correo'}`, { duration: 5000 });
      }

      const timer = setTimeout(() => navigate('/'), 12000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, orderSnapshot, navigate, clearCart, watch]);

  // Validar datos de la tarjeta antes de continuar
  const handleSaveCard = async () => {
    const isValid = await trigger(['cardNumber', 'cardName', 'cardExpiry', 'cardCvv']);
    if (isValid) {
      setIsCardSaved(true);
      toast.success('Tarjeta guardada y validada para pago');
    } else {
      toast.error('Revisa los datos de tu tarjeta');
    }
  };

  // ── Envío del formulario simulando pago (Wompi desactivado) ─────────────────────
  const onSubmit = async (data) => {
    if (!selectedPayment) {
      toast.error('Por favor, selecciona un método de pago.');
      return;
    }
    if (selectedPayment === 'credit' && !isCardSaved) {
      toast.error('Por favor, guarda la información de la tarjeta primero.');
      return;
    }

    setIsProcessing(true);
    const loadingToast = toast.loading('Procesando pago seguro...');

    try {
      // Formatear productos para la API
      const formattedProducts = items.map(item => ({
        productId: item._id || item.id,
        quantity: item.quantity
      }));

      // Guardar venta en MongoDB
      await addSale({
        customerId: null, // Por ahora invitado
        products: formattedProducts,
        total: total,
        paymentMethod: selectedPayment,
        status: selectedPayment === 'whatsapp' ? 'Pendiente WhatsApp' : 'Completado',
        notes: `Envío a: ${data.address}, ${data.city}. Correo: ${data.email}`,
      });

      toast.dismiss(loadingToast);
      setOrderSnapshot({ items: [...items], subtotal, shipping, total, paymentMethod: selectedPayment });
      setIsSuccess(true);
      if (selectedPayment === 'whatsapp') {
        toast.success('¡Pedido registrado! Abriendo WhatsApp...');
      } else {
        toast.success('¡Pago procesado exitosamente!');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Error al registrar venta:', error);
      toast.error(error.message || 'Error al procesar el pago. Intenta de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Pantalla de confirmación exitosa ─────────────────────────────
  if (isSuccess && orderSnapshot) {
    const { items: snapItems, subtotal: snapSubtotal, shipping: snapShipping, total: snapTotal, paymentMethod } = orderSnapshot;
    const isWhatsapp = paymentMethod === 'whatsapp';

    const buildWhatsAppUrl = () => {
      const formData = watch();
      const lines = snapItems.map(
        item => `• ${item.name || item.title} x${item.quantity} = $${(item.price * item.quantity).toFixed(2)}`
      );
      const msg = [
        '🌿 *ProNatural - Nuevo Pedido*',
        '',
        ...lines,
        '',
        `Subtotal: $${snapSubtotal.toFixed(2)}`,
        `Envío: $${snapShipping.toFixed(2)}`,
        `*TOTAL: $${snapTotal.toFixed(2)}*`,
        '',
        `📦 Dirección: ${formData.address || ''}, ${formData.city || ''}`,
        `📧 Correo: ${formData.email || ''}`,
        '',
        'Método de pago: Transferencia / Efectivo vía WhatsApp'
      ].join('\n');
      const phone = '50322222222';
      return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    };

    return (
      <div className="min-h-[calc(100vh-100px)] w-full flex flex-col lg:flex-row items-center justify-center bg-[#f4f3ec] relative overflow-hidden py-12">
        <div className="z-10 flex flex-col items-center text-center animate-[fadeIn_1s_ease-out] w-full max-w-2xl px-6">
          {/* Ícono de éxito */}
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-8 shadow-2xl ${isWhatsapp ? 'bg-[#25D366]' : 'bg-[#0b2216]'}`}>
            {isWhatsapp ? (
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            ) : (
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-[#0b2216] mb-4">
            {isWhatsapp ? 'PEDIDO RECIBIDO' : 'PAGO COMPLETADO'}
          </h1>
          <p className="text-[11px] font-bold text-gray-500 tracking-[0.2em] uppercase mb-8">
            {isWhatsapp ? 'CONFIRMA TU PEDIDO POR WHATSAPP' : 'TU ORDEN HA SIDO PROCESADA CON ÉXITO'}
          </p>

          {/* Factura */}
          <div className="w-full bg-white p-6 md:p-10 shadow-lg border border-gray-100 mb-8 text-left relative">
            <div className="absolute top-0 right-0 p-4">
              <span className="text-[9px] font-bold text-brand-dark tracking-[0.2em] uppercase bg-[#f4f3ec] px-3 py-1">
                Contactos: +503 2222-2222
              </span>
            </div>
            <h3 className="text-[12px] font-bold tracking-[0.2em] text-[#0b2216] uppercase mb-6 border-b pb-4">
              Detalle del Pedido
            </h3>
            <div className="space-y-4 mb-6 max-h-[30vh] overflow-y-auto pr-2">
              {snapItems.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[12px] font-medium text-gray-800">{item.name}</span>
                    <span className="text-[10px] text-gray-500 tracking-wider">Cantidad: {item.quantity}</span>
                  </div>
                  <span className="text-[12px] font-bold text-[#0b2216]">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-500 tracking-[0.1em] uppercase">Subtotal</span>
                <span className="text-[12px] font-medium text-[#0b2216]">${snapSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-500 tracking-[0.1em] uppercase">Envío</span>
                <span className="text-[12px] font-medium text-[#0b2216]">${snapShipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-end mt-4 pt-4 border-t border-gray-200">
                <h3 className="text-[14px] font-bold tracking-[0.2em] text-[#0b2216] uppercase">TOTAL PAGADO</h3>
                <span className="text-[24px] font-bold text-[#0b2216] leading-none tracking-tighter">${snapTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Botón WhatsApp (por si el popup fue bloqueado) */}
          {isWhatsapp && (
            <a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full max-w-sm flex items-center justify-center gap-3 bg-[#25D366] text-white font-bold text-[11px] tracking-[0.2em] uppercase py-4 px-8 hover:bg-[#1ebe57] transition-colors mb-6 shadow-md"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              ENVIAR PEDIDO POR WHATSAPP
            </a>
          )}

          <p className="text-[10px] text-gray-400 max-w-md mx-auto mb-6 tracking-widest uppercase">
            Regresando al inicio en {isWhatsapp ? '12' : '10'} segundos...
          </p>
          <div className="flex justify-center items-center opacity-60 animate-pulse">
            <div className="w-2 h-2 bg-[#0b2216] rounded-full mx-1" />
            <div className="w-2 h-2 bg-[#0b2216] rounded-full mx-1" />
            <div className="w-2 h-2 bg-[#0b2216] rounded-full mx-1" />
          </div>
        </div>
      </div>
    );
  }

  // ── Formulario de checkout ────────────────────────────────────────
  return (
    <div className="min-h-[calc(100vh-100px)] w-full flex flex-col lg:flex-row">

      {/* ── Columna izquierda: datos de envío ── */}
      <div className="w-full lg:w-[60%] p-6 md:p-12 lg:p-24 bg-brand-bg border-b lg:border-b-0 lg:border-r border-gray-100">
        <h1 className="text-5xl md:text-[56px] lg:text-[64px] font-bold tracking-tighter text-[#0b2216] mb-4">PAGO</h1>
        <p className="text-[10px] md:text-[11px] font-bold text-gray-400 tracking-[0.2em] uppercase mb-12 md:mb-16">
          PROTOCOLO DE TRANSMISIÓN DE DATOS SEGUROS
        </p>
        <div className="flex items-center gap-4 mb-10">
          <span className="bg-[#0b2216] text-white text-[10px] px-3 py-1 font-bold">01</span>
          <h2 className="text-[13px] font-bold tracking-[0.2em] text-brand-dark uppercase">LOGÍSTICA DE DESTINO</h2>
        </div>
        <form
          id="checkout-form"
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-12 gap-y-8 md:gap-y-12 mb-16"
        >
          <div>
            <label className="block text-[9px] font-bold text-gray-500 tracking-[0.15em] uppercase mb-3">
              Correo Electrónico (Email)
            </label>
            <input
              type="email"
              placeholder="EJEMPLO@GMAIL.COM"
              {...register('email', { required: 'Requerido' })}
              className={`w-full border-b py-2 text-[12px] bg-transparent focus:outline-none focus:border-brand-dark uppercase transition-colors ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-gray-500 tracking-[0.15em] uppercase mb-3">
              Nombre Completo
            </label>
            <input
              type="text"
              placeholder="JANE DOE"
              {...register('name', { required: 'Requerido' })}
              className={`w-full border-b py-2 text-[12px] bg-transparent focus:outline-none focus:border-brand-dark uppercase transition-colors ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[9px] font-bold text-gray-500 tracking-[0.15em] uppercase mb-3">Dirección</label>
            <input
              type="text"
              placeholder="DIRECCION DE LA CALLE"
              {...register('address', { required: 'Requerido' })}
              className={`w-full border-b py-2 text-[12px] bg-transparent focus:outline-none focus:border-brand-dark uppercase transition-colors ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-gray-500 tracking-[0.15em] uppercase mb-3">
              Ciudad/Departamento
            </label>
            <input
              type="text"
              placeholder="SAN SALVADOR"
              {...register('city', { required: 'Requerido' })}
              className={`w-full border-b py-2 text-[12px] bg-transparent focus:outline-none focus:border-brand-dark uppercase transition-colors ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-gray-500 tracking-[0.15em] uppercase mb-3">
              Código Postal
            </label>
            <input
              type="text"
              placeholder="1101"
              {...register('zip', { required: 'Requerido' })}
              className={`w-full border-b py-2 text-[12px] bg-transparent focus:outline-none focus:border-brand-dark uppercase transition-colors ${errors.zip ? 'border-red-500' : 'border-gray-300'}`}
            />
          </div>
        </form>
      </div>

      {/* ── Columna derecha: pago y resumen ── */}
      <div className="w-full lg:w-[40%] bg-[#f4f3ec] p-6 md:p-12 lg:p-24 flex flex-col relative overflow-hidden">
        <div className="flex justify-end mb-20 z-10">
          <button
            onClick={() => navigate('/carrito')}
            className="text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase hover:text-[#0b2216] transition-colors flex items-center cursor-pointer"
          >
            <svg className="w-3 h-3 mr-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
            ABANDON ARCHIVE
          </button>
        </div>

        <div className="flex items-center gap-4 mb-12 z-10">
          <span className="bg-[#b45309] text-white text-[10px] px-3 py-1 font-bold">02</span>
          <h2 className="text-[13px] font-bold tracking-[0.2em] text-[#0b2216] uppercase">PAGO SEGURO</h2>
        </div>

        {/* Selector método de pago */}
        <div className="space-y-4 mb-16 z-10">
          <div
            className={`bg-white p-8 border ${selectedPayment === 'credit' ? 'border-[#0b2216]' : 'border-transparent'} shadow-sm flex justify-between items-center cursor-pointer hover:border-[#0b2216]/40 transition-colors`}
            onClick={() => setSelectedPayment('credit')}
          >
            <div>
              <p className="text-[11px] font-bold tracking-[0.15em] text-[#0b2216] uppercase mb-2">PROTOCOLO DE CRÉDITO</p>
              <p className="text-[8px] text-gray-400 tracking-widest uppercase">VISA, MASTERCARD, AMEX</p>
            </div>
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedPayment === 'credit' ? 'border-[#0b2216]' : 'border-gray-300'}`}>
              {selectedPayment === 'credit' && <div className="w-2 h-2 rounded-full bg-[#0b2216]" />}
            </div>
          </div>
          <div
            className={`bg-white p-8 border ${selectedPayment === 'whatsapp' ? 'border-[#0b2216]' : 'border-transparent'} shadow-sm flex justify-between items-center cursor-pointer hover:border-[#0b2216]/40 transition-colors mt-4`}
            onClick={() => setSelectedPayment('whatsapp')}
          >
            <div>
              <p className="text-[11px] font-bold tracking-[0.15em] text-[#0b2216] uppercase mb-2">PAGO POR WHATSAPP</p>
              <p className="text-[8px] text-gray-400 tracking-widest uppercase">Transferencia / Efectivo</p>
            </div>
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedPayment === 'whatsapp' ? 'border-[#0b2216]' : 'border-gray-300'}`}>
              {selectedPayment === 'whatsapp' && <div className="w-2 h-2 rounded-full bg-[#0b2216]" />}
            </div>
          </div>

          {/* Formulario de tarjeta */}
          {selectedPayment === 'credit' && !isCardSaved && (
            <div className="bg-white/60 p-6 shadow-sm border border-gray-100 transition-all duration-500 ease-in-out">
              {/* Visual de tarjeta */}
              <div className="w-full max-w-sm aspect-[1.586/1] bg-gradient-to-br from-gray-900 to-black rounded-xl p-6 text-white relative overflow-hidden shadow-2xl flex flex-col justify-between mb-8 mx-auto">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-xl -ml-6 -mb-6" />
                <div className="flex justify-between items-start z-10 relative">
                  <div className="w-10 h-7 bg-gradient-to-r from-yellow-100 to-yellow-300 rounded flex items-center justify-center opacity-90 shadow-sm">
                    <div className="w-6 h-4 border border-yellow-800/20 rounded-sm" />
                  </div>
                  <div className="flex gap-1 items-center">
                    <div className="w-8 h-8 rounded-full bg-red-500/90 mix-blend-screen" />
                    <div className="w-8 h-8 rounded-full bg-yellow-500/90 mix-blend-screen -ml-4" />
                  </div>
                </div>
                <div className="z-10 relative">
                  <div className="text-[16px] md:text-xl tracking-[0.15em] mb-3 font-mono font-medium drop-shadow-md text-gray-100">
                    {cardNumber ? cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ').trim() : '0123  4567  8910  1112'}
                  </div>
                  <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest text-gray-400 mt-2">
                    <div className="flex flex-col">
                      <span className="text-[6px] text-gray-500 mb-1">CARDHOLDER NAME</span>
                      <span className="truncate max-w-[120px] text-gray-200">{cardName || 'MICHAEL JORDAN'}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[6px] text-gray-500 mb-1">VALID THRU</span>
                      <span className="text-gray-200">{cardExpiry || '01/22'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Campos de tarjeta */}
              <div className="space-y-6">
                <div>
                  <label className="block text-[9px] font-bold text-gray-500 tracking-[0.15em] uppercase mb-2">
                    Número de Tarjeta
                  </label>
                  <input
                    type="text"
                    maxLength="16"
                    {...register('cardNumber', { required: 'Requerido', minLength: 16, maxLength: 16 })}
                    className={`w-full border-b py-2 text-[12px] bg-transparent focus:outline-none focus:border-[#0b2216] transition-colors font-mono tracking-widest ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="0123456789101112"
                  />
                  {errors.cardNumber && (
                    <p className="text-red-500 text-[9px] mt-1">Debe tener 16 dígitos</p>
                  )}
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-gray-500 tracking-[0.15em] uppercase mb-2">
                    Titular de la Tarjeta
                  </label>
                  <input
                    type="text"
                    {...register('cardName', { required: 'Requerido' })}
                    className={`w-full border-b py-2 text-[12px] bg-transparent focus:outline-none focus:border-[#0b2216] transition-colors uppercase ${errors.cardName ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="MICHAEL JORDAN"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[9px] font-bold text-gray-500 tracking-[0.15em] uppercase mb-2">
                      Vencimiento
                    </label>
                    <input
                      type="text"
                      maxLength="5"
                      {...register('cardExpiry', {
                        required: 'Requerido',
                        pattern: { value: /^(0[1-9]|1[0-2])\/?([0-9]{2})$/, message: 'Formato MM/AA' },
                      })}
                      className={`w-full border-b py-2 text-[12px] bg-transparent focus:outline-none focus:border-[#0b2216] transition-colors font-mono ${errors.cardExpiry ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="01/26"
                    />
                    {errors.cardExpiry && (
                      <p className="text-red-500 text-[9px] mt-1">{errors.cardExpiry.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-gray-500 tracking-[0.15em] uppercase mb-2">CVV</label>
                    <input
                      type="password"
                      maxLength="4"
                      {...register('cardCvv', { required: 'Requerido', minLength: 3 })}
                      className={`w-full border-b py-2 text-[12px] bg-transparent focus:outline-none focus:border-[#0b2216] transition-colors font-mono ${errors.cardCvv ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="777"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveCard}
                  className="w-full bg-gradient-to-r from-gray-800 to-gray-900 text-white text-[10px] font-bold tracking-[0.2em] uppercase py-4 rounded hover:from-gray-900 hover:to-black transition-all shadow-md mt-4 cursor-pointer"
                >
                  AGREGAR PAGO
                </button>
              </div>
            </div>
          )}

          {/* Tarjeta guardada */}
          {selectedPayment === 'credit' && isCardSaved && (
            <div className="bg-white p-5 shadow-sm border border-gray-100 mt-4 flex justify-between items-center transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-7 bg-gray-900 rounded flex items-center justify-center">
                  <span className="text-white text-[7px] font-bold tracking-wider">CARD</span>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#0b2216] tracking-wider font-mono">
                    **** **** **** {cardNumber?.slice(-4) || '1112'}
                  </p>
                  <p className="text-[8px] text-gray-400 uppercase tracking-widest mt-1">Expira {cardExpiry}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCardSaved(false)}
                className="text-[9px] font-bold text-[#b45309] hover:underline uppercase tracking-widest cursor-pointer"
              >
                Editar
              </button>
            </div>
          )}
        </div>

        {/* Resumen y botón de pago */}
        <div className="mt-auto pt-10 border-t border-gray-200 z-10">
          <div className="flex justify-between items-center mb-6">
            <span className="text-[9px] font-bold text-gray-500 tracking-[0.15em] uppercase">SUBTOTAL</span>
            <span className="text-[13px] font-medium text-[#0b2216]">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center mb-10 border-b border-gray-200 pb-10">
            <span className="text-[9px] font-bold text-gray-500 tracking-[0.15em] uppercase">ENVÍO (Repartidor Propio)</span>
            <span className="text-[13px] font-medium text-[#0b2216]">${shipping.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-end mb-12">
            <div>
              <h3 className="text-[16px] font-bold tracking-[0.2em] text-[#0b2216] uppercase mb-1">TOTAL</h3>
              <p className="text-[8px] text-gray-400 tracking-widest uppercase">+IVA</p>
            </div>
            <span className="text-[36px] font-bold text-[#0b2216] leading-none tracking-tighter">${total.toFixed(2)}</span>
          </div>

          <button
            form="checkout-form"
            type="submit"
            disabled={isProcessing}
            className="w-full bg-[#0a2016] text-white flex justify-between items-center px-10 py-6 hover:bg-[#123827] transition-colors group mb-8 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase">
              {isProcessing ? 'PROCESANDO...' : 'CONFIRMAR COMPRA'}
            </span>
            {isProcessing ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
              </svg>
            )}
          </button>

          <div className="flex justify-center items-center opacity-60">
            <svg className="w-3.5 h-3.5 text-gray-500 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span className="text-[8px] text-gray-400 tracking-widest uppercase">Pago procesado por Wompi</span>
          </div>
        </div>
      </div>
    </div>
  );
}
