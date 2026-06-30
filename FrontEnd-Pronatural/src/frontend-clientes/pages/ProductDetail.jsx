import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useGlobalData } from '../../context/GlobalDataContext';
import { getCloudinaryUrl } from '../../utils/cloudinary';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { products } = useGlobalData();
  const product = products.find(p => String(p._id || p.id) === String(id));

  if (!product) {
    return (
      <div className="p-8 text-center text-red-600 font-bold uppercase tracking-widest text-xs bg-[#fdfbf7] h-[calc(100vh-80px)] flex items-center justify-center">
        Producto no encontrado.
      </div>
    );
  }

  const nameParts = product.name ? product.name.split('\n') : [''];
  const isCoffee = product.category?.toLowerCase().includes('cafe') || product.category?.toLowerCase().includes('café');

  const handleAddToCart = () => {
    addItem({
      ...product,
      title: product.name,
      image: product.img
    });
    navigate('/carrito');
  };

  return (
    <div className="flex flex-col w-full bg-[#fdfbf7]">
      {/* Upper section */}
      <div className="flex flex-col lg:flex-row w-full min-h-[calc(100vh-80px)]">
        {/* Left Image - Full Cover */}
        <div className="w-full lg:w-1/2 relative" style={{minHeight: 'min(55vw, 50vh)'}}>
          <img
            src={(product.img && (product.img.startsWith('http') || product.img.startsWith('data:'))) ? product.img : getCloudinaryUrl(product.img)}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {product.specs?.ORIGEN && (
            <div className="absolute bottom-10 left-10 bg-[#e8e6e1]/90 backdrop-blur-sm px-6 py-4 shadow-lg border border-white/20">
              <p className="text-[9px] font-bold text-gray-500 tracking-[0.2em] uppercase mb-1.5">ORIGEN TÉCNICO</p>
              <p className="text-[13px] font-bold text-[#0a2016] tracking-widest uppercase">{product.specs.ORIGEN}</p>
            </div>
          )}
        </div>

        {/* Right Info */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-5 sm:px-10 lg:px-24 py-10 lg:py-20 bg-[#fdfbf7]">
          <p className="text-[10px] font-bold text-[#c25e1a] tracking-[0.2em] uppercase mb-4">
            {product.sku && product.sku.startsWith('PN') ? 'BATCH NO. 042 / OBSIDIAN SERIES' : 'LOTE SELECCIONADO'}
          </p>
          <h1 className="text-[36px] sm:text-[48px] lg:text-[72px] font-bold leading-[0.9] tracking-tighter text-[#0a2016] mb-6 uppercase">
            {nameParts.map((line, i) => (
              <span key={i}>{line}{i < nameParts.length - 1 && <br />}</span>
            ))}
          </h1>
          <p className="text-[22px] sm:text-[26px] lg:text-[32px] font-bold text-[#0a2016] mb-8">
            ${product.price.toFixed(2)}
          </p>

          {/* Variant Boxes */}
          <div className="flex gap-3 mb-10">
            <div className="bg-[#0a2016] text-white px-6 py-4 flex items-center justify-center min-w-[120px]">
              <span className="text-[10px] font-bold tracking-[0.15em] uppercase">{isCoffee ? (product.specs?.SABOR?.split(',')[0] || 'AHUMADO') : (product.category || 'ESTÁNDAR')}</span>
            </div>
            <div className="bg-[#e8e6e1] text-[#0a2016] px-6 py-4 flex items-center justify-center min-w-[120px]">
              <span className="text-[10px] font-bold tracking-[0.15em] uppercase">{isCoffee ? (product.specs?.SABOR?.split(',')[1] || 'COCOA') : 'ORGÁNICO'}</span>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`w-full text-white flex justify-between items-center px-6 py-5 transition-colors group cursor-pointer ${
              product.stock === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#0a2016] hover:bg-[#123827]'
            }`}
          >
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-center flex-1 text-left">
              {product.stock === 0 ? 'AGOTADO' : 'AÑADIR AL CARRITO'}
            </span>
            {product.stock > 0 && (
              <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path>
              </svg>
            )}
          </button>
          
          {product.stock > 0 && product.stock <= 5 && (
            <p className="text-[10px] font-bold text-[#c25e1a] tracking-[0.1em] uppercase mt-4">
              ¡Solo quedan {product.stock} unidades!
            </p>
          )}
          {product.stock <= 0 && (
            <p className="text-[10px] font-bold text-red-600 tracking-[0.1em] uppercase mt-4">
              No hay stock de este producto.
            </p>
          )}
        </div>
      </div>

      {/* Lower Technical Specs Section */}
      <div className="w-full bg-[#fdfbf7] px-5 sm:px-10 lg:px-24 py-12 lg:py-24 flex flex-col lg:flex-row gap-12 lg:gap-20">
        {/* Left Column: Title and Description */}
        <div className={`w-full ${product.specs && Object.keys(product.specs).length > 0 ? 'lg:w-1/3' : 'lg:w-2/3 max-w-3xl'}`}>
          <h2 className="text-[26px] lg:text-[32px] font-bold tracking-tighter text-[#0a2016] mb-8 leading-[1.05]">
            {product.specs && Object.keys(product.specs).length > 0 ? (
              <>ESPECIFICACIONES<br />TÉCNICAS</>
            ) : (
              'ACERCA DE ESTE PRODUCTO'
            )}
          </h2>
          <p className="text-[13px] text-gray-500 leading-[1.8] max-w-sm">
            {product.desc || 'Extraído con precisión. Nuestro proceso de archivo garantiza que cada grano se someta a nuestros estrictos estándares químicos y sensoriales antes de su comercialización.'}
          </p>
        </div>

        {/* Right Column: Specs List */}
        {product.specs && Object.keys(product.specs).length > 0 && (
          <div className="w-full lg:w-2/3 max-w-4xl pt-4">
            <div className="space-y-0">
              {Object.entries(product.specs).map(([key, value]) => {
                if (!value) return null;
                const displayKey = key === 'PROCESO' ? 'NIVEL DE ASADO' : key;
                return (
                  <div key={key} className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-[#e8e6e1] py-8 first:pt-0 gap-4">
                    <span className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase shrink-0 w-48">{displayKey}</span>
                    <span className="text-[15px] font-bold text-[#0a2016] tracking-wide uppercase sm:text-right flex-1">{value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
