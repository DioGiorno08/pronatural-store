import { Link, useNavigate } from 'react-router-dom';
import { getCloudinaryUrl } from '../../utils/cloudinary';
import { useCart } from '../../hooks/useCart';

export default function ProductCard({ id, image, title, price, tag, tagColor, stock }) {
  const { addItem } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ id, _id: id, name: title, title, price, img: image, image, stock });
    navigate('/carrito');
  };

  return (
    <Link to={`/producto/${id}`} className="flex flex-col group cursor-pointer h-full">
      {/* Imagen */}
      <div className="relative w-full overflow-hidden bg-[#e5e5e5] mb-3" style={{ paddingBottom: '125%' }}>
        <img
          src={getCloudinaryUrl(image)}
          alt={title}
          className="absolute inset-0 object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700 ease-out"
        />
        {tag && (
          <div className="absolute top-2 right-2 left-2 flex justify-end">
            <span className={`text-[8px] font-bold tracking-[0.15em] px-2 py-1 uppercase leading-none ${tagColor || 'bg-brand-dark text-white'}`}>
              {tag}
            </span>
          </div>
        )}
      </div>

      {/* Nombre */}
      <h3 className="text-[14px] sm:text-[15px] font-bold leading-tight mb-2 text-brand-dark line-clamp-2">
        {title}
      </h3>

      {/* Precio + botón en columna en móvil, fila en pantallas mayores */}
      <div className="flex flex-col gap-2 mt-auto pt-1">
        <span className="text-[14px] font-bold text-brand-dark">${price.toFixed(2)}</span>
        <button
          onClick={handleAddToCart}
          disabled={stock === 0}
          className={`w-full text-[9px] font-bold tracking-[0.15em] border py-2 uppercase transition-colors ${
            stock === 0
              ? 'border-gray-100 text-gray-300 cursor-not-allowed'
              : 'border-gray-300 text-gray-500 hover:border-brand-dark hover:text-brand-dark cursor-pointer'
          }`}
        >
          {stock === 0 ? 'AGOTADO' : 'AGREGAR'}
        </button>
      </div>
    </Link>
  );
}
