import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useGlobalData } from '../../context/GlobalDataContext';
import { getCloudinaryUrl } from '../../utils/cloudinary';
export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { products } = useGlobalData();
  const product = products.find(p => String(p.id) === String(id));
  if (!product) {
    return (
      <div className="p-8 text-center text-red-600 font-bold uppercase tracking-widest text-xs bg-brand-bg h-screen flex items-center justify-center">
        Producto no encontrado.
      </div>
    );
  }
  const nameParts = product.name ? product.name.split('\n') : [''];
  const handleAddToCart = () => {
    addItem({
      ...product,
      title: product.name,
      image: product.img
    });
    navigate('/carrito');
  };
  return (
    <div className="flex flex-col lg:flex-row w-full min-h-[calc(100vh-80px)]">
        <div className="w-full lg:w-1/2 relative bg-gray-900 min-h-[50vh] lg:min-h-full">
          <img
            src={ (product.img && (product.img.startsWith('http') || product.img.startsWith('data:'))) ? product.img : getCloudinaryUrl(product.img) }
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover opacity-90"
          />
      </div>
      <div className="w-full lg:w-1/2 bg-[#fdfaf6] flex flex-col justify-center px-6 sm:px-12 lg:px-28 py-12 md:py-20">
        <p className="text-[10px] font-bold text-orange-700 tracking-[0.2em] uppercase mb-6 md:mb-8">
          {product.stock <= 5 ? (product.stock === 0 ? 'AGOTADO' : 'POCO STOCK') : 'LOTE SELECCIONADO'}
        </p>
        <h1 className="text-4xl sm:text-[42px] lg:text-[56px] font-bold leading-[1.1] tracking-tighter text-brand-dark mb-8 md:mb-12 max-w-lg">
          {nameParts.map((line, i) => (
            <span key={i}>{line}{i < nameParts.length - 1 && <br />}</span>
          ))}
        </h1>
        <p className="text-[32px] font-bold text-brand-dark mb-16">${product.price.toFixed(2)}</p>
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={`w-full max-w-lg text-white flex justify-between items-center px-8 py-5 transition-colors group mb-24 cursor-pointer ${
            product.stock === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#0a2016] hover:bg-[#123827]'
          }`}
        >
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase">
            {product.stock === 0 ? 'AGOTADO' : 'AÑADIR AL CARRITO'}
          </span>
          {product.stock > 0 && (
            <svg className="w-4 h-4 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path>
            </svg>
          )}
        </button>
        {product.specs && Object.keys(product.specs).length > 0 && (
          <div className="w-full max-w-xl">
            <h2 className="text-2xl md:text-[26px] font-bold tracking-tighter text-brand-dark mb-8 md:mb-12 leading-tight">
              ESPECIFICACIONES<br />TÉCNICAS
            </h2>
            <div className="space-y-7">
              {Object.entries(product.specs).map(([key, value]) => {
                if (!value) return null;
                return (
                  <div key={key} className="flex justify-between items-center border-b border-gray-200 pb-5">
                    <span className="text-[9px] font-bold text-gray-400 tracking-[0.15em] uppercase">{key}</span>
                    <span className="text-[12px] font-bold text-brand-dark tracking-widest uppercase text-right max-w-xs">{value}</span>
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
