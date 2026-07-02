import { Link } from 'react-router-dom';
import { useGlobalData } from '../../context/GlobalDataContext';

export default function Footer() {
  const { config } = useGlobalData();
  const c = config || {};

  return (
    <footer className="bg-[#0b2216] py-10 px-6 md:px-12 flex flex-col xl:flex-row justify-between items-center text-[#a5b4ac] w-full gap-8">
      <div className="flex flex-wrap items-center gap-8 justify-center xl:justify-start">
        <h2 className="text-white text-[18px] font-bold tracking-tighter">{c.storeName ? c.storeName.toUpperCase() : 'PRONATURAL'}</h2>
        <div className="flex flex-wrap gap-6 items-center">
          {c.email && <p className="text-[10px] tracking-wider text-gray-400">{c.email}</p>}
          {c.phone && <p className="text-[10px] tracking-wider text-gray-400">{c.phone}</p>}
          {c.address && <p className="text-[10px] tracking-wider text-gray-400">{c.address}</p>}
        </div>
        <p className="text-[8px] tracking-[0.15em] uppercase leading-relaxed">
          © {new Date().getFullYear()} {c.storeName || 'PRONATURAL'}. TODOS LOS DERECHOS RESERVADOS.
        </p>
      </div>
      <div className="flex flex-row items-center justify-end gap-10 mt-8 md:mt-0">
        <div className="flex gap-4">
          {c.instagram && <a href={`https://instagram.com/${c.instagram.replace('@','')}`} target="_blank" rel="noreferrer" className="text-[9px] tracking-widest font-semibold hover:text-white uppercase">INSTAGRAM</a>}
          {c.facebook && <a href={`https://${c.facebook}`} target="_blank" rel="noreferrer" className="text-[9px] tracking-widest font-semibold hover:text-white uppercase">FACEBOOK</a>}
          {c.tiktok && <a href={`https://tiktok.com/${c.tiktok}`} target="_blank" rel="noreferrer" className="text-[9px] tracking-widest font-semibold hover:text-white uppercase">TIKTOK</a>}
        </div>
        <div className="flex gap-10">
          <Link to="/" className="text-[9px] tracking-widest font-semibold hover:text-white uppercase">Privacy</Link>
          <Link to="/" className="text-[9px] tracking-widest font-semibold hover:text-white uppercase">Terms</Link>
          <Link to="/" className="text-[9px] tracking-widest font-semibold hover:text-white uppercase">Shipping</Link>
        </div>
      </div>
    </footer>
  );
}
