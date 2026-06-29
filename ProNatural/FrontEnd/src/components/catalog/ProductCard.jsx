import { Link } from 'react-router-dom';
import { getCloudinaryUrl } from '../../utils/cloudinary';
export default function ProductCard({ id, image, title, price, tag, tagColor }) {
  return (
    <Link to={`/producto/${id}`} className="flex flex-col group cursor-pointer">
      <div className="relative aspect-square overflow-hidden bg-gray-100 mb-6">
        <img
          src={getCloudinaryUrl(image)}
          alt={title}
          className="object-cover w-full h-full grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
        />
        {tag && (
          <div className="absolute top-4 right-4">
            <span className={`text-[9px] font-bold tracking-widest px-3 py-1.5 uppercase ${tagColor || 'bg-brand-dark text-white'}`}>
              {tag}
            </span>
          </div>
        )}
      </div>
      <h3 className="text-[22px] font-medium leading-tight mb-5 pr-4 text-brand-dark">{title}</h3>
      <div className="flex items-center justify-between mt-auto">
        <span className="text-lg font-bold text-brand-dark">${price.toFixed(2)}</span>
        <span className="text-[10px] font-bold tracking-widest border border-gray-200 px-6 py-2.5 text-brand-dark group-hover:bg-brand-dark group-hover:text-white transition-colors">
          VER
        </span>
      </div>
    </Link>
  );
}
