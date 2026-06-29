import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useGlobalData } from '../../context/GlobalDataContext';
import { getCloudinaryUrl } from '../../utils/cloudinary';
export default function Landing() {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { products: adminProducts } = useGlobalData();
  const mostSoldProduct = adminProducts.length > 0 ? adminProducts[0] : {
      id: 1,
      name: 'EL TOSTADO OSCURO VOLCÁNICO',
      price: 42.00,
      img: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=1200&auto=format&fit=crop',
      sku: 'SAFE WORK',
      desc: 'Procedente de las laderas del monte Apung. Perfil de chocolate negro, ciruela silvestre y azufre mineral.'
  };
  const handleAddToCart = () => {
    addItem({
      id: mostSoldProduct.id,
      name: mostSoldProduct.name,
      price: mostSoldProduct.price,
      image: mostSoldProduct.img || 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=1200&auto=format&fit=crop',
      batchRef: mostSoldProduct.sku || 'BATCH NO. 042'
    });
    navigate('/carrito');
  };
  return (
    <div className="w-full">
      <section className="relative h-[85vh] w-full bg-gray-900">
        <img
          src="https://images.unsplash.com/photo-1611162458324-aae1eb4129a4?q=80&w=2000&auto=format&fit=crop"
          alt="Coffee picker"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-[#0a2016]/40 mix-blend-multiply"></div>
        <div className="absolute inset-0 p-6 sm:p-12 lg:p-24 flex flex-col justify-between py-12 md:py-20">
          <h1 className="text-white text-5xl md:text-[90px] lg:text-[120px] font-bold leading-[0.85] tracking-tighter mb-0 self-start">
            Poder<br />crudo.<br />Tierra<br />pura.
          </h1>
          <div className="flex justify-end pr-0 lg:pr-24 w-full mt-12 md:mt-24">
            <div className="text-right">
              <p className="text-white text-[12px] max-w-xs ml-auto mb-8 leading-relaxed opacity-90 font-medium">
                Acceso directo al catálogo de productos orgánicos.
              </p>
              <Link to="/catalogo" className="bg-[#b45309] text-white text-[10px] font-bold tracking-[0.2em] px-10 py-4 uppercase hover:bg-orange-800 transition-colors inline-block">
                Acceder al catálogo
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section className="py-20 md:py-32 px-6 md:px-16 lg:px-24 bg-[#fdfaf6]">
        <p className="text-orange-700 text-[10px] font-bold tracking-[0.2em] uppercase mb-4">LOTES SELECCIONADOS</p>
        <h2 className="text-4xl md:text-[44px] font-bold tracking-tighter text-brand-dark mb-12 md:mb-20 border-b border-gray-300 pb-6 inline-block pr-6 md:pr-12">
          Lo mas vendido
        </h2>
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1 bg-[#f4f3ec] p-6 md:p-16 flex flex-col md:flex-row justify-between">
            <div className="flex-1 pr-0 md:pr-12 flex flex-col">
              <p className="text-[9px] font-bold tracking-[0.2em] text-gray-500 uppercase mb-10 leading-[1.8]">
              </p>
              <h3 className="text-[32px] font-medium leading-tight text-brand-dark mb-6">
                {mostSoldProduct.name.split(' ').map((word, i) => <span key={i}>{word.toUpperCase()}<br/></span>)}
              </h3>
              <p className="text-[12px] text-gray-600 leading-relaxed mb-12 max-w-[260px]">
                {mostSoldProduct.desc || 'Procedente de las laderas del monte Apung. Perfil de chocolate negro, ciruela silvestre y azufre mineral.'}
              </p>
              <button onClick={handleAddToCart} className="bg-[#0b2216] text-white text-[10px] font-bold tracking-[0.2em] uppercase px-8 py-4 mt-auto self-start flex items-center hover:bg-[#123827] transition-colors cursor-pointer">
                AÑADIR AL CARRITO <span className="ml-6 font-semibold">${mostSoldProduct.price.toFixed(2)}</span>
              </button>
            </div>
            <div className="w-full md:w-[340px] h-[340px] bg-[#2a6d71] p-6 flex items-center justify-center relative mt-10 md:mt-0">
              <img src={getCloudinaryUrl(mostSoldProduct.img)} alt={mostSoldProduct.name} className="w-[240px] object-cover mix-blend-multiply opacity-80 grayscale" />
              <p className="absolute bottom-10 w-full text-center text-white/40 text-4xl font-serif tracking-[0.1em] uppercase">{mostSoldProduct.sku || 'SAFE WORK'}</p>
            </div>
          </div>
        </div>
      </section>
      <section className="py-20 md:py-32 px-6 md:px-16 lg:px-24 bg-[#f9f8f4] flex flex-col md:flex-row">
        <div className="w-full md:w-1/3 relative mb-16 md:mb-0">
          <span className="absolute -left-4 md:-left-8 -top-8 md:-top-12 text-8xl md:text-[200px] font-light text-brand-sidebar leading-none pointer-events-none select-none">01</span>
          <h2 className="text-3xl md:text-[36px] font-medium leading-tight text-brand-dark relative z-10 pl-4 md:pl-8 pt-4 md:pt-8">
            Visita Nuestro Catalogo<br />
          </h2>
        </div>
        <div className="w-full md:w-2/3 md:pl-12 lg:pl-24 md:border-l border-gray-200 py-6">
          <p className="text-lg md:text-[22px] font-medium text-brand-dark mb-12 md:mb-16 leading-relaxed max-w-xl">
            No vendemos productos agrícolas; seleccionamos momentos geológicos. Cada lote es un registro histórico de la lluvia, el suelo y la precisión biológica.
          </p>
          <div className="flex flex-col sm:flex-row gap-16">
            <div>
              <h4 className="text-[10px] font-bold text-orange-700 tracking-[0.2em] uppercase mb-4">ÉTICA</h4>
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.15em] leading-[1.8] max-w-[220px]">
                SIN ADITIVOS. SIN MEZCLAS.<br />PUREZA DE ORIGEN ÚNICO.
              </p>
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-orange-700 tracking-[0.2em] uppercase mb-4"></h4>
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.15em] leading-[1.8] max-w-[220px]">
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
