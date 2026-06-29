import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { getCloudinaryUrl } from '../../utils/cloudinary';
export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, subtotal } = useCart();
  const navigate = useNavigate();
  const shipping = items.length > 0 ? 12.00 : 0;
  const total = subtotal + shipping;
  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#fdfaf6]">
      <div className="border-b border-gray-100 px-6 md:px-12 lg:px-24 py-12 md:py-16">
        <h1 className="text-5xl md:text-[64px] font-bold tracking-tighter text-[#0b2216] leading-none">
          CARRITO
        </h1>
        <p className="text-[11px] font-bold text-gray-400 tracking-[0.2em] uppercase mt-3">
          {items.length} {items.length === 1 ? 'ARTÍCULO' : 'ARTÍCULOS'} DE EL CATALOGO EN EL CARRITO
        </p>
      </div>
      <div className="flex flex-col lg:flex-row min-h-[500px]">
        <div className="flex-1 px-6 md:px-12 lg:px-24 py-12 md:py-16">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-20 h-20 border border-gray-200 rounded-full flex items-center justify-center mb-10">
                <svg className="w-9 h-9 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
              </div>
              <p className="text-[11px] font-bold text-gray-400 tracking-[0.2em] uppercase mb-8">
                EL CARRITO ESTÁ VACÍO
              </p>
              <p className="text-[13px] text-gray-400 mb-12 max-w-xs leading-relaxed">
                Aún no has añadido ningún producto a tu selección.
              </p>
              <Link
                to="/catalogo"
                className="bg-[#0a2016] text-white text-[10px] font-bold tracking-[0.2em] uppercase px-12 py-4 hover:bg-[#123827] transition-colors"
              >
                Explorar el catálogo
              </Link>
            </div>
          ) : (
            <>
              <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto] gap-8 pb-6 border-b border-gray-200 mb-8">
                <span className="text-[9px] font-bold text-gray-400 tracking-[0.2em] uppercase">Producto</span>
                <span className="text-[9px] font-bold text-gray-400 tracking-[0.2em] uppercase w-28 text-center">Cantidad</span>
                <span className="text-[9px] font-bold text-gray-400 tracking-[0.2em] uppercase w-24 text-right">Precio</span>
                <span className="text-[9px] font-bold text-gray-400 tracking-[0.2em] uppercase w-8"></span>
              </div>
              <div className="space-y-8">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-6 md:gap-8 pb-8 border-b border-gray-100 items-center"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 md:gap-10">
                      <div className="w-24 h-24 sm:w-[120px] sm:h-[120px] bg-gray-100 flex-shrink-0 overflow-hidden">
                        {item.image && (
                          <img
                            src={getCloudinaryUrl(item.image)}
                            alt={item.name || item.title}
                            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                          />
                        )}
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-orange-700 tracking-[0.15em] uppercase mb-2">
                          {item.batchRef || 'LOTE SELECCIONADO'}
                        </p>
                        <h3 className="text-[17px] font-bold tracking-tighter text-brand-dark leading-tight">
                          {(item.name || item.title || '').replace('\n', ' ')}
                        </h3>
                        <p className="text-[11px] font-bold text-brand-dark mt-1">
                          ${item.price.toFixed(2)} c/u
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center border border-gray-200 w-28 justify-center">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-9 h-9 flex items-center justify-center text-brand-dark hover:bg-brand-dark hover:text-white transition-colors text-lg font-light cursor-pointer"
                      >
                        −
                      </button>
                      <span className="w-10 text-center text-[12px] font-bold text-brand-dark">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-9 h-9 flex items-center justify-center text-brand-dark hover:bg-brand-dark hover:text-white transition-colors text-lg font-light cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                    <div className="w-24 text-right">
                      <span className="text-[15px] font-bold text-brand-dark">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors cursor-pointer"
                      aria-label="Eliminar producto"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M18 6L6 18M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-12">
                <button
                  onClick={clearCart}
                  className="text-[9px] font-bold tracking-[0.2em] text-gray-400 hover:text-red-500 uppercase transition-colors flex items-center gap-3 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6l-1 14H6L5 6"></path>
                    <path d="M10 11v6M14 11v6"></path>
                    <path d="M9 6V4h6v2"></path>
                  </svg>
                  VACIAR CARRITO
                </button>
              </div>
            </>
          )}
        </div>
        {items.length > 0 && (
          <div className="w-full lg:w-[420px] bg-[#f4f3ec] px-6 md:px-12 py-12 md:py-16 border-t lg:border-t-0 lg:border-l border-gray-100">
            <div className="flex items-center gap-4 mb-12">
              <span className="bg-[#b45309] text-white text-[10px] px-3 py-1 font-bold">01</span>
              <h2 className="text-[13px] font-bold tracking-[0.2em] text-brand-dark uppercase">
                Resumen del pedido
              </h2>
            </div>
            <div className="space-y-6 mb-12">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-start">
                  <div>
                    <p className="text-[11px] font-bold text-brand-dark uppercase tracking-wide leading-tight">
                      {(item.name || item.title || '').replace('\n', ' ')}
                    </p>
                    <p className="text-[9px] text-gray-400 mt-1">× {item.quantity}</p>
                  </div>
                  <span className="text-[12px] font-bold text-brand-dark">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-8 space-y-5 mb-12">
              <div className="flex justify-between">
                <span className="text-[9px] font-bold text-gray-500 tracking-[0.15em] uppercase">SUBTOTAL</span>
                <span className="text-[13px] font-medium text-brand-dark">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[9px] font-bold text-gray-500 tracking-[0.15em] uppercase">ENVÍO (EXPRESS)</span>
                <span className="text-[13px] font-medium text-brand-dark">${shipping.toFixed(2)}</span>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-8 mb-12">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[11px] font-bold tracking-[0.2em] text-brand-dark uppercase mb-1">TOTAL</p>
                  <p className="text-[8px] text-gray-400 tracking-widest uppercase">+IVA</p>
                </div>
                <span className="text-[36px] font-bold text-brand-dark leading-none tracking-tighter">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="space-y-4 mb-8">
              <button
                onClick={() => navigate('/pago')}
                className="w-full bg-[#0a2016] text-white flex justify-between items-center px-8 py-5 hover:bg-[#123827] transition-colors group cursor-pointer"
              >
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Proceder al pago</span>
                <svg className="w-4 h-4 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path>
                </svg>
              </button>
              <button
                onClick={() => navigate('/whatsapp-order')}
                className="w-full bg-white border border-[#0a2016] text-[#0a2016] flex justify-between items-center px-8 py-5 hover:bg-gray-50 transition-colors group cursor-pointer"
              >
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Pedir por WhatsApp</span>
                <svg className="w-4 h-4 text-[#25D366] transform group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                   <path d="M12.031 0C5.385 0 0 5.386 0 12.03c0 2.128.552 4.195 1.6 6.014L.045 23.955l6.064-1.589A12.006 12.006 0 0012.031 24c6.645 0 12.031-5.385 12.031-12.03S18.677 0 12.031 0zm0 22.015c-1.8 0-3.565-.483-5.112-1.4l-.367-.217-3.8.995 1.015-3.705-.238-.378C2.476 15.545 1.969 13.82 1.969 12.03 1.969 6.486 6.487 1.984 12.031 1.984c5.543 0 10.046 4.502 10.046 10.046 0 5.543-4.503 10.046-10.046 9.985zM17.54 14.5c-.302-.152-1.794-.886-2.073-.988-.278-.101-.481-.152-.684.152-.202.304-.783.988-.961 1.19-.177.203-.354.228-.657.076-1.547-.768-2.684-1.391-3.712-2.73-.243-.316-.011-.476.128-.642.278-.335.532-.614.733-.842.152-.178.203-.304.304-.507.101-.203.05-.38-.026-.532-.076-.152-.683-1.646-.936-2.253-.247-.594-.499-.513-.684-.523h-.583c-.202 0-.532.076-.811.38-.278.304-1.064 1.04-1.064 2.533 0 1.494 1.089 2.937 1.24 3.14.152.203 2.14 3.266 5.187 4.582 2.215.955 2.879.882 3.424.743.619-.158 1.794-.734 2.047-1.443.253-.71.253-1.317.177-1.443-.075-.126-.277-.202-.581-.354z"></path>
                </svg>
              </button>
            </div>
            <Link
              to="/catalogo"
              className="w-full flex justify-center text-[9px] font-bold tracking-[0.2em] text-gray-400 hover:text-brand-dark uppercase transition-colors"
            >
              ← Seguir comprando
            </Link>
            <div className="flex justify-center items-center mt-12 opacity-50">
              <svg className="w-3.5 h-3.5 text-gray-500 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              <span className="text-[7.5px] font-bold text-gray-500 tracking-[0.2em] uppercase">
                AES-256 BIT ENCRYPTION ACTIVE
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
