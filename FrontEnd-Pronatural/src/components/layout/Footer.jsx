import { Link } from 'react-router-dom';
export default function Footer() {
  return (
    <footer className="bg-[#0b2216] py-16 px-6 md:px-12 flex flex-col md:flex-row justify-between items-start md:items-end text-[#a5b4ac] w-full">
      <div>
        <h2 className="text-white text-[22px] font-bold tracking-tighter mb-2">PRONATURAL</h2>
        <p className="text-[8px] tracking-[0.15em] uppercase leading-relaxed">
          © 2024 ARCHIVO TÉCNICO. TODOS LOS DERECHOS<br/>RESERVADOS.
        </p>
      </div>
      <div className="flex gap-10 mt-8 md:mt-0">
        <Link to="/" className="text-[9px] tracking-widest font-semibold hover:text-white uppercase">Privacy</Link>
        <Link to="/" className="text-[9px] tracking-widest font-semibold hover:text-white uppercase">Terms</Link>
        <Link to="/" className="text-[9px] tracking-widest font-semibold hover:text-white uppercase">Shipping</Link>
      </div>
    </footer>
  );
}
