import axios from "axios";

// Base URL Backend Django
const API_URL = "http://127.0.0.1:8000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor: Add token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor: Handle token expired
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        const response = await axios.post(`${API_URL}/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem("access_token", access);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token expired, logout user
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ============================================
// AUTH ENDPOINTS
// ============================================
export const authAPI = {
  login: (username, password) => axios.post(`${API_URL}/token/`, { username, password }),

  register: (data) => axios.post(`${API_URL}/auth/register/`, data),

  getProfile: () => api.get("/auth/profile/"),
};

// ============================================
// SUPPLIER ENDPOINTS
// ============================================
export const supplierAPI = {
  getAll: (page = 1) => api.get(`/supplier/?page=${page}`),
  getById: (id) => api.get(`/supplier/${id}/`),
  create: (data) => api.post("/supplier/", data),
  update: (id, data) => api.put(`/supplier/${id}/`, data),
  delete: (id) => api.delete(`/supplier/${id}/`),
};

// ============================================
// KATEGORI ENDPOINTS
// ============================================
export const kategoriAPI = {
  getAll: (page = 1) => api.get(`/kategori/?page=${page}`),
  getById: (id) => api.get(`/kategori/${id}/`),
  create: (data) => api.post("/kategori/", data),
  update: (id, data) => api.put(`/kategori/${id}/`, data),
  delete: (id) => api.delete(`/kategori/${id}/`),
};

// ============================================
// CUSTOMER ENDPOINTS
// ============================================
export const customerAPI = {
  getAll: (page = 1) => api.get(`/customer/?page=${page}`),
  getById: (id) => api.get(`/customer/${id}/`),
  create: (data) => api.post("/customer/", data),
  update: (id, data) => api.put(`/customer/${id}/`, data),
  delete: (id) => api.delete(`/customer/${id}/`),
};

// ============================================
// PRODUK ENDPOINTS
// ============================================
export const produkAPI = {
  getAll: (page = 1) => api.get(`/produk/?page=${page}`),
  getById: (id) => api.get(`/produk/${id}/`),
  create: (data) => api.post("/produk/", data),
  update: (id, data) => api.put(`/produk/${id}/`, data),
  delete: (id) => api.delete(`/produk/${id}/`),
};

// ============================================
// TRANSAKSI ENDPOINTS
// ============================================
export const transaksiAPI = {
  getAll: (page = 1) => api.get(`/transaksi/?page=${page}`),
  getById: (id) => api.get(`/transaksi/${id}/`),
  create: (data) => api.post("/transaksi/", data),
  update: (id, data) => api.put(`/transaksi/${id}/`, data),
  delete: (id) => api.delete(`/transaksi/${id}/`),
};

// ============================================
// DASHBOARD STATS
// ============================================
export const dashboardAPI = {
  // Get all data untuk statistik
  getStats: async () => {
    try {
      const [produk, supplier, customer, kategori, transaksi] = await Promise.all([
        api.get("/produk/"),
        api.get("/supplier/"),
        api.get("/customer/"),
        api.get("/kategori/"),
        api.get("/transaksi/"),
      ]);

      return {
        totalProduk: produk.data.count || 0,
        totalSupplier: supplier.data.count || 0,
        totalCustomer: customer.data.count || 0,
        totalKategori: kategori.data.count || 0,
        totalTransaksi: transaksi.data.count || 0,
        produkList: produk.data.results || [],
        transaksiList: transaksi.data.results || [],
      };
    } catch (error) {
      console.error("Error fetching stats:", error);
      throw error;
    }
  },
};

export default api;
