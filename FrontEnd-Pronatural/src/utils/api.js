import { mockProducts, mockInventory, mockSales, mockSuppliers, mockReports } from './mocks';
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const isFormData = options.body instanceof FormData;
  const defaultHeaders = isFormData ? {} : {
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
  if (isFormData && config.headers['Content-Type']) {
    delete config.headers['Content-Type'];
  }
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
    if (error.message !== 'Access denied') {
      console.warn(`[API FAILED] para: ${endpoint}. Razón:`, error.message);
    }
    throw error;
  }
}
export const api = {
  getProducts: () => apiRequest('/products'),
  getProduct: (id) => apiRequest(`/products/${id}`),
  createProduct: (productData) => {
    if (productData.file) {
      const formData = new FormData();
      Object.keys(productData).forEach(key => {
        if (key !== 'file' && key !== 'img') {
          let val = productData[key];
          if (typeof val === 'object' && val !== null) val = JSON.stringify(val);
          formData.append(key, val);
        }
      });
      formData.append('img', productData.file);
      return apiRequest('/products', { method: 'POST', body: formData });
    }
    return apiRequest('/products', { method: 'POST', body: JSON.stringify(productData) });
  },
  updateProduct: (id, productData) => {
    if (productData.file) {
      const formData = new FormData();
      Object.keys(productData).forEach(key => {
        if (key !== 'file' && key !== 'img') {
          let val = productData[key];
          if (typeof val === 'object' && val !== null) val = JSON.stringify(val);
          formData.append(key, val);
        }
      });
      formData.append('img', productData.file);
      return apiRequest(`/products/${id}`, { method: 'PUT', body: formData });
    }
    return apiRequest(`/products/${id}`, { method: 'PUT', body: JSON.stringify(productData) });
  },
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
  
  getReviews: () => apiRequest('/reviews'),
  createReview: (reviewData) => apiRequest('/reviews', { method: 'POST', body: JSON.stringify(reviewData) }),
  deleteReview: (id) => apiRequest(`/reviews/${id}`, { method: 'DELETE' }),
  getInventory: () => apiRequest('/inventory'),
  updateStock: (id, stock) => apiRequest(`/inventory/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ stock })
  }),
  reorderProduct: (id, amount) => apiRequest(`/inventory/${id}/reorder`, {
    method: 'POST',
    body: JSON.stringify({ amount })
  }),
  
  getCart: (sessionId) => apiRequest(`/carrito/${sessionId}`),
  syncCart: (sessionId, productos) => apiRequest(`/carrito/${sessionId}/sync`, { method: 'POST', body: JSON.stringify({ productos }) }),
  clearCart: (sessionId) => apiRequest(`/carrito/${sessionId}`, { method: 'DELETE' }),
  
  getSales: () => apiRequest('/sales'),
  createSale: (saleData) => apiRequest('/sales', {
    method: 'POST',
    body: JSON.stringify(saleData)
  }),
  updateSaleStatus: (id, status) => apiRequest(`/sales/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status })
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
  }),
  getSales: () => apiRequest('/sales'),
  createSale: (saleData) => apiRequest('/sales', {
    method: 'POST',
    body: JSON.stringify(saleData)
  }),
  sendInvoice: (id) => apiRequest(`/sales/${id}/invoice`, {
    method: 'POST'
  })
};
