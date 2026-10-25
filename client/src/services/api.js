// Lost & Found Hub - Central API Client Service for Node.js + MongoDB Backend

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/api`
  : "/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("lostFoundToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }
  return data;
};

export const api = {
  // Authentication
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await handleResponse(res);
    if (data.token) {
      localStorage.setItem("lostFoundToken", data.token);
    }
    return data;
  },

  async register({ name, email, password, phone }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, phone }),
    });
    const data = await handleResponse(res);
    if (data.token) {
      localStorage.setItem("lostFoundToken", data.token);
    }
    return data;
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async forgotPassword(email) {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return handleResponse(res);
  },

  async resetPassword(email, otp, password) {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, password }),
    });
    return handleResponse(res);
  },

  // Items
  async getItems(filters = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.category && filters.category !== "All Categories")
      params.append("category", filters.category);
    if (filters.location && filters.location !== "Any Location")
      params.append("location", filters.location);
    if (filters.type && filters.type !== "All")
      params.append("type", filters.type);
    if (filters.status && filters.status !== "All")
      params.append("status", filters.status);

    const queryStr = params.toString() ? `?${params.toString()}` : "";
    const res = await fetch(`${API_BASE}/items${queryStr}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getItemById(id) {
    const res = await fetch(`${API_BASE}/items/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getMatches(id) {
    const res = await fetch(`${API_BASE}/items/matches/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async createItem(itemData) {
    const res = await fetch(`${API_BASE}/items`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(itemData),
    });
    return handleResponse(res);
  },

  async updateItem(id, itemData) {
    const res = await fetch(`${API_BASE}/items/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(itemData),
    });
    return handleResponse(res);
  },

  async deleteItem(id) {
    const res = await fetch(`${API_BASE}/items/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Claims
  async getClaims(email, role) {
    const params = new URLSearchParams();
    if (email) params.append("email", email);
    if (role) params.append("role", role);
    const queryStr = params.toString() ? `?${params.toString()}` : "";

    const res = await fetch(`${API_BASE}/claims${queryStr}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async createClaim(claimData) {
    const res = await fetch(`${API_BASE}/claims`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(claimData),
    });
    return handleResponse(res);
  },

  async updateClaimStatus(id, status, adminNotes = "") {
    const res = await fetch(`${API_BASE}/claims/${id}/status`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, adminNotes }),
    });
    return handleResponse(res);
  },

  async deleteClaim(id) {
    const res = await fetch(`${API_BASE}/claims/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Notifications
  async getNotifications(email) {
    if (!email) return { success: true, count: 0, data: [] };
    const res = await fetch(
      `${API_BASE}/notifications?email=${encodeURIComponent(email)}`,
      { headers: getAuthHeaders() }
    );
    return handleResponse(res);
  },

  async markNotificationRead(id) {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: "PUT",
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async markAllNotificationsRead(email) {
    const res = await fetch(`${API_BASE}/notifications/read-all`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ email }),
    });
    return handleResponse(res);
  },

  async deleteNotification(id) {
    const res = await fetch(`${API_BASE}/notifications/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Admin
  async getAdminStats() {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getAdminUsers() {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async deleteAdminUser(id) {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};

export default api;
