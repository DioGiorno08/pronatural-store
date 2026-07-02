import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { GlobalDataProvider } from './context/GlobalDataContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import PublicLayout from './components/layout/PublicLayout';
import AdminLayout from './frontend-admin/pages/AdminLayout';
import Login from './frontend-clientes/pages/auth/Login';
import Register from './frontend-clientes/pages/auth/Register';
import RecoverPassword from './frontend-clientes/pages/auth/RecoverPassword';
import Landing from './frontend-clientes/pages/Landing';
import About from './frontend-clientes/pages/About';
import Contact from './frontend-clientes/pages/Contact';
import Reviews from './frontend-clientes/pages/Reviews';
import ProductDetail from './frontend-clientes/pages/ProductDetail';
import Checkout from './frontend-clientes/pages/Checkout';
import Cart from './frontend-clientes/pages/Cart';
import Profile from './frontend-clientes/pages/Profile';
import WhatsappOrder from './frontend-clientes/pages/WhatsappOrder';
import Catalog from './frontend-clientes/pages/Catalog';
import AdminLogin from './frontend-admin/pages/auth/AdminLogin';
import AdminRegister from './frontend-admin/pages/auth/AdminRegister';
import AdminRecoverPassword from './frontend-admin/pages/auth/AdminRecoverPassword';
import AdminCategories from './frontend-admin/pages/AdminCategories';
import AdminCatalog from './frontend-admin/pages/AdminCatalog';
import InventoryManagement from './frontend-admin/pages/InventoryManagement';
import SalesEntry from './frontend-admin/pages/SalesEntry';
import AdminSellers from './frontend-admin/pages/AdminSellers';
import AdminCustomers from './frontend-admin/pages/AdminCustomers';
import Reports from './frontend-admin/pages/Reports';
import VendorDashboard from './frontend-admin/pages/VendorDashboard';
import SalesHistory from './frontend-admin/pages/SalesHistory';
import Settings from './frontend-admin/pages/Settings';
import AdminReviews from './frontend-admin/pages/AdminReviews';
import AdminDashboard from './frontend-admin/pages/AdminDashboard';
import { ADMIN_PREFIX } from './config';

function App() {
  return (
    <AuthProvider>
      <GlobalDataProvider>
        <CartProvider>
          <BrowserRouter>
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  fontSize: '11px',
                  fontWeight: '600',
                  letterSpacing: '0.05em',
                  borderRadius: '2px',
                  fontFamily: 'Inter, sans-serif',
                },
              }}
            />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/recover" element={<RecoverPassword />} />
              <Route path={`${ADMIN_PREFIX}/login`} element={<AdminLogin />} />
              <Route path={`${ADMIN_PREFIX}/register`} element={<AdminRegister />} />
              <Route path={`${ADMIN_PREFIX}/recover`} element={<AdminRecoverPassword />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute allowedRoles={['Customer', 'Admin', 'Employee']}>
                    <PublicLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Landing />} />
                <Route path="acerca" element={<About />} />
                <Route path="contacto" element={<Contact />} />
                <Route path="resenas" element={<Reviews />} />
                <Route path="perfil" element={<Profile />} />
                <Route path="producto/:id" element={<ProductDetail />} />
                <Route path="carrito" element={<Cart />} />
                <Route path="pago" element={<Checkout />} />
                <Route path="whatsapp-order" element={<WhatsappOrder />} />
              </Route>
              <Route
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'Employee', 'Customer']}>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/catalogo" element={<Catalog />} />
              </Route>
              <Route
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'Employee']} authFallback={`${ADMIN_PREFIX}/login`}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route path={ADMIN_PREFIX} element={
                  <ProtectedRoute allowedRoles={['Admin']}><AdminDashboard /></ProtectedRoute>
                } />
                <Route path={`${ADMIN_PREFIX}/catalogo`} element={
                  <ProtectedRoute allowedRoles={['Admin', 'Employee']}><AdminCatalog /></ProtectedRoute>
                } />
                <Route path="/inventario" element={
                  <ProtectedRoute allowedRoles={['Admin']}><InventoryManagement /></ProtectedRoute>
                } />
                <Route path={`${ADMIN_PREFIX}/vendedores`} element={
                  <ProtectedRoute allowedRoles={['Admin']}><AdminSellers /></ProtectedRoute>
                } />
                <Route path={`${ADMIN_PREFIX}/clientes`} element={
                  <ProtectedRoute allowedRoles={['Admin', 'Employee']}><AdminCustomers /></ProtectedRoute>
                } />
                <Route path="/reportes" element={
                  <ProtectedRoute allowedRoles={['Admin']}><Reports /></ProtectedRoute>
                } />
                <Route path="/vendedor" element={
                  <ProtectedRoute allowedRoles={['Employee']}><VendorDashboard /></ProtectedRoute>
                } />
                <Route path="/ventas/registrar" element={
                  <ProtectedRoute allowedRoles={['Admin', 'Employee']}><SalesEntry /></ProtectedRoute>
                } />
                <Route path="/ventas/historial" element={
                  <ProtectedRoute allowedRoles={['Admin', 'Employee']}><SalesHistory /></ProtectedRoute>
                } />
                <Route path="/ajustes" element={
                  <ProtectedRoute allowedRoles={['Admin', 'Employee']}><Settings /></ProtectedRoute>
                } />
                <Route path={`${ADMIN_PREFIX}/categorias`} element={
                  <ProtectedRoute allowedRoles={['Admin', 'Employee']} authFallback={`${ADMIN_PREFIX}/login`}>
                    <AdminCategories />
                  </ProtectedRoute>
                } />
                <Route path={`${ADMIN_PREFIX}/resenas`} element={
                  <ProtectedRoute allowedRoles={['Admin', 'Employee']}><AdminReviews /></ProtectedRoute>
                } />
              </Route>
              <Route path="*" element={<Navigate to="/register" replace />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </GlobalDataProvider>
    </AuthProvider>
  );
}
export default App;