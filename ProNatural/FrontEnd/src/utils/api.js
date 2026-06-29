import { mockProducts, mockInventory, mockSales, mockSuppliers, mockReports } from './mocks';
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include', 
  };
  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Error en la petición al servidor';
      try {
        const parsed = JSON.parse(errorText);
        if (parsed.message) errorMessage = parsed.message;
      } catch (e) {
        errorMessage = errorText;
      }
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error) {
    console.warn(`[API FAILED] para: ${endpoint}. Razón:`, error.message);
    throw error;
  }
}
export const api = {
  getProducts: () => apiRequest('/products'),
  getProduct: (id) => apiRequest(`/products/${id}`),
  createProduct: (productData) => apiRequest('/products', { method: 'POST', body: JSON.stringify(productData) }),
  updateProduct: (id, productData) => apiRequest(`/products/${id}`, { method: 'PUT', body: JSON.stringify(productData) }),
  deleteProduct: (id) => apiRequest(`/products/${id}`, { method: 'DELETE' }),
  getCategories: () => apiRequest('/categories'),
  createCategory: (categoryData) => apiRequest('/categories', { method: 'POST', body: JSON.stringify(categoryData) }),
  updateCategory: (id, categoryData) => apiRequest(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(categoryData) }),
  deleteCategory: (id) => apiRequest(`/categories/${id}`, { method: 'DELETE' }),
  getEmployees: () => apiRequest('/employees'),
  createEmployee: (employeeData) => apiRequest('/employees', { method: 'POST', body: JSON.stringify(employeeData) }),
  updateEmployee: (id, employeeData) => apiRequest(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(employeeData) }),
  deleteEmployee: (id) => apiRequest(`/employees/${id}`, { method: 'DELETE' }),
  getClientes: () => apiRequest('/clientes'),
  createCliente: (clienteData) => apiRequest('/clientes', { method: 'POST', body: JSON.stringify(clienteData) }),
  updateCliente: (id, clienteData) => apiRequest(`/clientes/${id}`, { method: 'PUT', body: JSON.stringify(clienteData) }),
  deleteCliente: (id) => apiRequest(`/clientes/${id}`, { method: 'DELETE' }),
  getInventory: () => apiRequest('/inventory'),
  updateStock: (id, stock) => apiRequest(`/inventory/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ stock })
  }),
  reorderProduct: (id, amount) => apiRequest(`/inventory/${id}/reorder`, {
    method: 'POST',
    body: JSON.stringify({ amount })
  }),
  getSales: () => apiRequest('/sales'),
  createSale: (saleData) => apiRequest('/sales', {
    method: 'POST',
    body: JSON.stringify(saleData)
  }),
  getSuppliers: () => apiRequest('/suppliers'),
  createSupplier: (supplierData) => apiRequest('/suppliers', {
    method: 'POST',
    body: JSON.stringify(supplierData)
  }),
  getReports: () => apiRequest('/reports'),
  login: (email, password) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  forceChangePassword: (data) => apiRequest('/auth/forceChangePassword', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  registerCustomer: (customerData) => apiRequest('/registerCliente', {
    method: 'POST',
    body: JSON.stringify(customerData)
  }),
  verifyCodeEmail: (verificationCodeRequest) => apiRequest('/auth/verifyCodeEmail', {
    method: 'POST',
    body: JSON.stringify({ verificationCodeRequest })
  }),
  verifyCustomerCodeEmail: (verificationCodeRequest) => apiRequest('/registerCliente/verifyCodeEmail', {
    method: 'POST',
    body: JSON.stringify({ verificationCodeRequest })
  }),
  recoverAdminPassword: (email) => apiRequest('/auth/recoveryAdmin/requestCode', {
    method: 'POST',
    body: JSON.stringify({ email })
  }),
  verifyAdminRecoveryCode: (code) => apiRequest('/auth/recoveryAdmin/verifyCode', {
    method: 'POST',
    body: JSON.stringify({ code })
  }),
  updateAdminPassword: (newPassword, confirmNewPassword) => apiRequest('/auth/recoveryAdmin/newPassword', {
    method: 'POST',
    body: JSON.stringify({ newPassword, confirmNewPassword })
  }),
  recoverCustomerPassword: (email) => apiRequest('/auth/recoveryCustomer/requestCode', {
    method: 'POST',
    body: JSON.stringify({ email })
  }),
  verifyCustomerRecoveryCode: (code) => apiRequest('/auth/recoveryCustomer/verifyCode', {
    method: 'POST',
    body: JSON.stringify({ code })
  }),
  updateCustomerPassword: (newPassword, confirmNewPassword) => apiRequest('/auth/recoveryCustomer/newPassword', {
    method: 'POST',
    body: JSON.stringify({ newPassword, confirmNewPassword })
  }),
  wompiToken: () => apiRequest('/wompi/token', { method: 'POST' }),
  wompiPay: (token, formData) => apiRequest('/wompi/paymentTest', {
    method: 'POST',
    body: JSON.stringify({ token, formData })
  })
};
