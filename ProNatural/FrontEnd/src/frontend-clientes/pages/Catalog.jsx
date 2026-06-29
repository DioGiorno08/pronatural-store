import { useSearchParams } from 'react-router-dom';
import { useGlobalData } from '../../context/GlobalDataContext';
import ProductCard from '../../components/catalog/ProductCard';
export default function Catalog() {
  const { products: adminProducts } = useGlobalData();
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category') || 'TODOS';
  const normalize = (str) => {
    if (!str) return '';
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
  };
  const filteredProducts = adminProducts.filter(p => {
    if (selectedCategory === 'TODOS') return true;
    return normalize(p.category) === normalize(selectedCategory);
  });
  const products = filteredProducts.map(p => ({
    id: p.id,
    title: p.name,
    price: p.price,
    image: p.img || 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=600&auto=format&fit=crop',
    tag: p.stock <= 5 ? (p.stock === 0 ? 'AGOTADO' : 'POCO STOCK') : null,
    tagColor: p.stock <= 5 ? 'bg-[#b45309] text-white' : null,
  }));
  return (
    <div className="pt-4 max-w-6xl">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-6xl md:text-[80px] font-bold leading-[0.85] tracking-tighter text-[#0e3020] mb-8">
            COSECHA<br />ORGÁNICA.
          </h1>
        </div>
        <div className="flex items-center gap-4 mb-4">
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
        {products.map(product => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </div>
  );
}
