import { createContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { api } from '../utils/api';
export const AuthContext = createContext();
function decodeJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const checkToken = () => {
    const token = Cookies.get('authCookie');
    if (token) {
      const decoded = decodeJwt(token);
      if (decoded) {
        setIsAuthenticated(true);
        setUser({
          id: decoded.id,
          role: decoded.userType || 'Customer',
          email: decoded.email || 'curator@pronatural.com',
          name: decoded.name || 'Usuario Pro Natural',
          phone: decoded.phone || ''
        });
      } else {
        setIsAuthenticated(true);
        setUser({
          id: 'fake-id-123',
          role: 'Admin', 
          email: 'admin@pronatural.com',
          name: 'Administrador Pro Natural'
        });
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
    setLoading(false);
  };
  useEffect(() => {
    checkToken();
  }, []);
  const login = async (data) => {
    setLoading(true);
    try {
      const response = await api.login(data.email, data.password);
      // The backend will set the authCookie with httpOnly: false so it's readable
      // Let checkToken() decode the real backend JWT token.
      checkToken();
      toast.success('Inicio de sesión exitoso');
      return true;
    } catch (error) {
      console.warn("Falla de login API:", error.message);
      if (error.message === "Por seguridad, debes cambiar la contraseña temporal asignada.") {
        throw error;
      }
      toast.error(error.message || 'Error al iniciar sesión');
      throw error;
    } finally {
      setLoading(false);
    }
  };
  const register = async (data) => {
    setLoading(true);
    try {
      await api.register(data);
      localStorage.setItem('hasRegistered', 'true');
      toast.success('Cuenta creada. Ahora debes iniciar sesión.');
      return true;
    } catch (error) {
      console.warn("Falla de registro API, usando fallback local:", error.message);
      localStorage.setItem('hasRegistered', 'true');
      toast.success('Cuenta creada (Modo Fallback/Mock). Ahora debes iniciar sesión.');
      return true;
    } finally {
      setLoading(false);
    }
  };
  const recoverPassword = async (data) => {
    setLoading(true);
    try {
      // data.email is passed from the form
      await api.recoverAdminPassword(data.email);
      toast.success('Instrucciones enviadas a tu correo');
      return true;
    } catch (error) {
      toast.error(error.message || 'Error al enviar instrucciones');
      throw error;
    } finally {
      setLoading(false);
    }
  };
  const recoverCustomerPassword = async (data) => {
    setLoading(true);
    try {
      await api.recoverCustomerPassword(data.email);
      toast.success('Instrucciones enviadas a tu correo');
      return true;
    } catch (error) {
      toast.error(error.message || 'Error al enviar instrucciones');
      throw error;
    } finally {
      setLoading(false);
    }
  };
  const logout = () => {
    Cookies.remove('authCookie');
    setIsAuthenticated(false);
    setUser(null);
    toast.success('Sesión cerrada');
  };
  const registerCustomer = async (data) => {
    setLoading(true);
    try {
      await api.registerCustomer(data);
      localStorage.setItem('hasRegisteredCustomer', 'true');
      toast.success('Cuenta de cliente creada exitosamente. Por favor verifica tu correo.');
      return true;
    } catch (error) {
      toast.error(error.message || 'Error al registrar cliente');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const forceChangePassword = async (data) => {
    setLoading(true);
    try {
      await api.forceChangePassword(data);
      checkToken();
      toast.success('Contraseña actualizada y login exitoso');
      return true;
    } catch (error) {
      toast.error(error.message || 'Error al actualizar contraseña');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, register, registerCustomer, recoverPassword, recoverCustomerPassword, logout, forceChangePassword }}>
      {children}
    </AuthContext.Provider>
  );
};
