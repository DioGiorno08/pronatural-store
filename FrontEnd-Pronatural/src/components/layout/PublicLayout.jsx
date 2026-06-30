import { Outlet } from 'react-router-dom';
import TopNavbar from './TopNavbar';
import Footer from './Footer';
export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-brand-bg font-sans flex flex-col">
      <TopNavbar />
      <main className="flex-1 w-full bg-brand-bg">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
