import useAuthStore from "../store/authStore"

// ✅ URL hardcodeada - ignora el .env
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"


class ApiService {
  async request(endpoint, options = {}) {
    const { token } = useAuthStore.getState()

    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const config = {
      ...options,
      headers,
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
      
      // Manejar respuestas sin contenido (como DELETE que devuelve 204 No Content)
      const text = await response.text()
      const data = text ? JSON.parse(text) : {}

      if (!response.ok) {
        throw new Error(data.message || data.error || "Request failed")
      }

      return data
    } catch (error) {
      console.error("API Error:", error)
      throw error
    }
  }

  // Auth endpoints
  async login(email, password) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async getCurrentUser() {
    return this.request("/auth/me")
  }

  // Units endpoints
  async getUnits() {
    return this.request("/units")
  }

  async createUnit(name) {
    return this.request("/units", {
      method: "POST",
      body: JSON.stringify({ name }),
    })
  }

  async updateUnit(id, name) {
    return this.request(`/units/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name }),
    })
  }

  async deleteUnit(id) {
    return this.request(`/units/${id}`, {
      method: "DELETE",
    })
  }

  // Users endpoints
  async getUsers(filters = {}) {
    const params = new URLSearchParams(filters)
    return this.request(`/users?${params}`)
  }

  async createUser(userData) {
    return this.request("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    })
  }

  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: "DELETE",
    })
  }

  // ✅ NUEVO: Verificar disponibilidad de carnet
  async checkCarnetAvailability(carnet, excludeUserId = null) {
    const params = excludeUserId ? `?excludeUserId=${excludeUserId}` : '';
    return this.request(`/users/check-carnet/${carnet}${params}`)
  }

  // Validate employee from RRHH API
  async validateEmployee(carnet) {
    return this.request("/users/validate-employee", {
      method: "POST",
      body: JSON.stringify({ carnet }),
    })
  }

  // Events endpoints
  async getEvents(filters = {}) {
    const params = new URLSearchParams(filters)
    return this.request(`/events?${params}`)
  }

  async getEventById(id) {
    return this.request(`/events/${id}`)
  }

  async createEvent(eventData) {
    return this.request("/events", {
      method: "POST",
      body: JSON.stringify(eventData),
    })
  }

  async updateEvent(id, eventData) {
    return this.request(`/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(eventData),
    })
  }

  async deleteEvent(id) {
    return this.request(`/events/${id}`, {
      method: "DELETE",
    })
  }
}

export default new ApiService()