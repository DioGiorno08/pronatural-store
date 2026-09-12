// Tarjeta de producto para el catálogo público
// Muestra imagen, nombre, precio y botón de agregar al carrito
import { Link, useNavigate } from 'react-router-dom';
import { getCloudinaryUrl } from '../../utils/cloudinary';
import { useCart } from '../../hooks/useCart';

export default function ProductCard({ id, image, title, price, tag, tagColor, stock }) {
  // Hook del carrito para agregar productos
  const { addItem } = useCart();
  const navigate = useNavigate();

  // Agregar el producto al carrito y redirigir al carrito
  const handleAddToCart = (e) => {
    e.preventDefault();      // Evitar que el Link del padre navegue
    e.stopPropagation();     // Evitar que el clic suba al contenedor padre
    addItem({ id, _id: id, name: title, title, price, img: image, image, stock });
    navigate('/carrito');    // Redirigir al carrito después de agregar
  };

  return (
    // Enlace a la página de detalle del producto
    <Link to={`/producto/${id}`} className="flex flex-col group cursor-pointer h-full transition-transform duration-300 hover:-translate-y-1">

      {/* Contenedor de la imagen con relación de aspecto 4:5 */}
      <div className="relative w-full overflow-hidden bg-[#e5e5e5] mb-3 rounded-sm shadow-sm" style={{ paddingBottom: '125%' }}>
        <img
          src={getCloudinaryUrl(image)}
          alt={title}
          className="absolute inset-0 object-cover w-full h-full grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500 ease-out"
        />
        {/* Etiqueta opcional (ej. NUEVO, OFERTA) */}
        {tag && (
          <div className="absolute top-2 right-2 left-2 flex justify-end">
            <span className={`text-[8px] font-bold tracking-[0.15em] px-2 py-1 uppercase leading-none shadow-sm ${tagColor || 'bg-brand-dark text-white'}`}>
              {tag}
            </span>
          </div>
        )}
      </div>

      {/* Nombre del producto */}
      <h3 className="text-[14px] sm:text-[15px] font-bold leading-tight mb-2 text-brand-dark line-clamp-2 group-hover:text-[#1b4332] transition-colors">
        {title}
      </h3>

      {/* Precio y botón de agregar al carrito */}
      <div className="flex flex-col gap-2 mt-auto pt-1">
        <span className="text-[14px] font-bold text-brand-dark">${(Number(price) || 0).toFixed(2)}</span>
        <button
          onClick={handleAddToCart}
          disabled={stock === 0}
          className={`w-full text-[9px] font-bold tracking-[0.15em] border py-2 uppercase transition-all duration-200 active:scale-95 ${
            stock === 0
              ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'border-[#0b2216] text-[#0b2216] hover:bg-[#0b2216] hover:text-white cursor-pointer shadow-sm'
          }`}
        >
          {/* Mostrar AGOTADO si no hay stock, AGREGAR si hay */}
          {stock === 0 ? 'AGOTADO' : 'AGREGAR AL CARRITO'}
        </button>
      </div>

    </Link>
  );
}
