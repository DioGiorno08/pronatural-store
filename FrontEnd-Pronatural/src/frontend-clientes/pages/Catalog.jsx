import { useSearchParams } from 'react-router-dom';
import { useGlobalData } from '../../context/GlobalDataContext';
import ProductCard from '../../components/catalog/ProductCard';

export default function Catalog() {
  const { products: adminProducts } = useGlobalData();
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category') || 'TODOS';
  const searchQuery = searchParams.get('q') || '';

  const normalize = (str) => {
    if (!str) return '';
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
  };

  const filteredProducts = adminProducts.filter(p => {
    let matchesCategory = true;
    if (selectedCategory !== 'TODOS') {
      matchesCategory = normalize(p.category) === normalize(selectedCategory);
    }
    let matchesSearch = true;
    if (searchQuery) {
      matchesSearch = normalize(p.name).includes(normalize(searchQuery)) ||
                      (p.desc && normalize(p.desc).includes(normalize(searchQuery)));
    }
    return matchesCategory && matchesSearch;
  });

  const products = filteredProducts.map(p => ({
    id: p.id || p._id,
    title: p.name,
    price: p.price,
    image: p.img || 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=600&auto=format&fit=crop',
    tag: p.stock <= 0 ? 'NO HAY STOCK' : (p.stock <= 5 ? 'POCO STOCK' : (p.sku && p.sku.startsWith('PN') ? 'BATCH #088' : null)),
    tagColor: p.stock <= 5 ? 'bg-[#b45309] text-white' : 'bg-brand-dark text-white',
    stock: p.stock
  }));

  return (
    <div className="pt-2 w-full max-w-[1400px] px-5 sm:px-8 md:px-12 lg:px-16 mx-auto">
      <div className="mb-10 md:mb-14">
        <p className="text-[9px] font-bold tracking-[0.2em] text-[#b45309] uppercase mb-3 break-words">
          {searchQuery ? 'RESULTADOS DE BÚSQUEDA' : `CATEGORÍA: ${selectedCategory}`}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-end">
          <h1 className="text-[36px] sm:text-5xl md:text-[64px] lg:text-[75px] font-bold leading-[0.9] tracking-tighter text-[#0e3020] uppercase break-words">
            {searchQuery ? `"${searchQuery}"` : (selectedCategory === 'TODOS' ? 'CATÁLOGO.' : `${selectedCategory}.`)}
          </h1>
          <div className="flex items-center gap-3 pb-1">
            <span className="text-[9px] font-bold tracking-[0.15em] text-gray-400 uppercase">ORDENAR:</span>
            <button className="flex items-center gap-1 text-[10px] font-bold tracking-[0.15em] text-brand-dark uppercase">
              POPULARES
              <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
            </button>
          </div>
        </div>
      </div>

      {products.length === 0 ? (
        <p className="text-[12px] text-gray-400 tracking-widest uppercase text-center py-24">No se encontraron productos.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 sm:gap-x-10 gap-y-12 md:gap-y-16">
          {products.map(product => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      )}
    </div>
  );
}
