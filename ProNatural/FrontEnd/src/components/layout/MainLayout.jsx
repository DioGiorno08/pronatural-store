import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
export default function MainLayout() {
  return (
    <div className="flex min-h-screen bg-brand-bg font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col relative h-screen overflow-hidden">
        <div className="flex-1 px-12 overflow-y-auto">
          <Header />
          <main className="pb-16 pt-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
