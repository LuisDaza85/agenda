"use client"

import { useState, useEffect } from "react"
import useAuthStore from "../../store/authStore"
import api from "../../services/api"
import ConfirmModal from "../ui/ConfirmModal"

export default function UsersManager() {
  const { user } = useAuthStore()
  const [users, setUsers] = useState([])
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    carnet: "",
    name: "",
    email: "",
    password: "",
    role: "",
    unit_id: "",
  })
  const [error, setError] = useState("")
  const [validatingCI, setValidatingCI] = useState(false)
  const [ciValid, setCiValid] = useState(false)
  const [notification, setNotification] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)

  useEffect(() => {
    fetchUsers()
    if (user?.role === "SUPERADMIN") {
      fetchUnits()
    }
  }, [])

  useEffect(() => {
    if (!formData.carnet || editingUser) return

    const timer = setTimeout(() => {
      validateCI(formData.carnet)
    }, 1200)

    return () => clearTimeout(timer)
  }, [formData.carnet])

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const showNotification = (type, title, message) => {
    setNotification({ type, title, message })
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await api.getUsers()
      setUsers(response.data?.users || [])
    } catch (error) {
      console.error("Error fetching users:", error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const fetchUnits = async () => {
    try {
      const response = await api.getUnits()
      setUnits(response.data?.units || [])
    } catch (error) {
      console.error("Error fetching units:", error)
      setUnits([])
    }
  }

  const validateCI = async (carnet) => {
    if (!carnet || carnet.length < 5) return

    setValidatingCI(true)
    setCiValid(false)

    try {
      const response = await api.validateEmployee(carnet)
      
      if (response.status === 'success' && response.data.found) {
        setCiValid(true)
        setFormData(prev => ({ ...prev, name: response.data.name }))
        showNotification('success', 'Usuario ENCONTRADO', 'El CI está registrado en el sistema de RRHH')
      } else {
        setCiValid(false)
        setFormData(prev => ({ ...prev, name: '' }))
        showNotification('error', 'Usuario no encontrado', 'El CI no está registrado en el sistema de RRHH')
      }
    } catch (error) {
      setCiValid(false)
      setFormData(prev => ({ ...prev, name: '' }))
      showNotification('error', 'Error', 'Error al comunicarse con el sistema de RRHH')
    } finally {
      setValidatingCI(false)
    }
  }

  const handleAdd = () => {
    setEditingUser(null)
    setFormData({
      carnet: "",
      name: "",
      email: "",
      password: "",
      role: user?.role === "SUPERADMIN" ? "UNITADMIN" : "VIEWER",
      unit_id: user?.role === "UNITADMIN" ? user.unit_id : "",
    })
    setCiValid(false)
    setError("")
    setModalOpen(true)
  }

  const handleEdit = (editUser) => {
    setEditingUser(editUser)
    setFormData({
      carnet: editUser.carnet || "",
      name: editUser.name,
      email: editUser.email,
      password: "",
      role: editUser.role,
      unit_id: editUser.unit_id || "",
    })
    setCiValid(true)
    setError("")
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!editingUser && !ciValid) {
      setError("Debe ingresar un CI válido registrado en el sistema de RRHH")
      return
    }

    try {
      const userData = { ...formData }
      
      if (editingUser && !userData.password) {
        delete userData.password
      }

      if (editingUser) {
        await api.updateUser(editingUser.id, userData)
      } else {
        await api.createUser(userData)
      }
      await fetchUsers()
      setModalOpen(false)
      showNotification('success', 'Éxito', `Usuario ${editingUser ? 'actualizado' : 'creado'} correctamente`)
    } catch (err) {
      setError(err.message || "Error al guardar el usuario")
    }
  }

  const handleDeleteClick = (deleteUser) => {
    setUserToDelete(deleteUser)
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = async () => {
    setShowDeleteConfirm(false)
    
    try {
      await api.deleteUser(userToDelete.id)
      await fetchUsers()
      showNotification('success', 'Éxito', 'Usuario eliminado correctamente')
    } catch (error) {
      showNotification('error', 'Error', error.message || 'Error al eliminar el usuario')
    } finally {
      setUserToDelete(null)
    }
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setModalOpen(false)
    }
  }

  const getRoleBadge = (role) => {
    const styles = {
      SUPERADMIN: "bg-[#341a67]/10 text-[#341a67]",
      UNITADMIN: "bg-[#47b4d8]/10 text-[#47b4d8]",
      VIEWER: "bg-gray-100 text-gray-700",
    }
    return styles[role] || "bg-gray-100 text-gray-700"
  }

  const getUnitName = (unitId) => {
    const unit = units.find((u) => u.id === unitId)
    return unit ? unit.name : "N/A"
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-[#47b4d8] border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600 mt-4">Cargando usuarios...</p>
      </div>
    )
  }

  return (
    <div className="px-1 lg:px-2 xl:px-2">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-[10000] max-w-md p-4 rounded-lg shadow-lg ${
          notification.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`flex-shrink-0 ${
              notification.type === 'success' ? 'text-green-600' : 'text-red-600'
            }`}>
              {notification.type === 'success' ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <h4 className={`font-semibold ${
                notification.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {notification.title}
              </h4>
              <p className={`text-sm mt-1 ${
                notification.type === 'success' ? 'text-green-700' : 'text-red-700'
              }`}>
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h2>
        <button onClick={handleAdd} className="btn-primary">
          + Nuevo Usuario
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">CI</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Nombre</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Rol</th>
              {user?.role === "SUPERADMIN" && (
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Unidad</th>
              )}
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-mono text-sm">{u.carnet || 'N/A'}</td>
                <td className="py-3 px-4">{u.name}</td>
                <td className="py-3 px-4 text-gray-600">{u.email}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadge(u.role)}`}>{u.role}</span>
                </td>
                {user?.role === "SUPERADMIN" && (
                  <td className="py-3 px-4 text-gray-600">{u.unit_id ? getUnitName(u.unit_id) : "N/A"}</td>
                )}
                <td className="py-3 px-4">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleEdit(u)}
                      className="text-[#47b4d8] hover:text-[#009ed0] p-1"
                      title="Editar"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteClick(u)}
                      className="text-red-600 hover:text-red-700 p-1"
                      title="Eliminar"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && <div className="text-center py-8 text-gray-500">No hay usuarios registrados</div>}
      </div>

      {/* Modal de Formulario */}
      {modalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleOverlayClick}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">{editingUser ? "Editar Usuario" : "Nuevo Usuario"}</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {!editingUser && (
                <div>
                  <label htmlFor="carnet" className="block text-sm font-medium text-gray-700 mb-2">
                    Carnet de Identidad (CI) *
                  </label>
                  <div className="relative">
                    <input
                      id="carnet"
                      type="text"
                      value={formData.carnet}
                      onChange={(e) => setFormData({ ...formData, carnet: e.target.value })}
                      className={`input-field ${ciValid ? 'border-green-500' : ''}`}
                      placeholder="Ej: 12345678"
                      required
                      autoComplete="off"
                    />
                    {validatingCI && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-5 h-5 border-2 border-[#47b4d8] border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                    {ciValid && !validatingCI && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Se verificará automáticamente en el sistema de RRHH
                  </p>
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo *
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  required
                  disabled={!editingUser && !ciValid}
                  style={{ 
                    backgroundColor: !editingUser && !ciValid ? '#f3f4f6' : 'white',
                    cursor: !editingUser && !ciValid ? 'not-allowed' : 'text'
                  }}
                />
                {!editingUser && !ciValid && (
                  <p className="text-xs text-gray-500 mt-1">
                    Se completará automáticamente al validar el CI
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Electrónico *
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña {editingUser ? "(dejar vacío para no cambiar)" : "*"}
                </label>
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field"
                  required={!editingUser}
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Rol *
                </label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="input-field"
                  required
                  disabled={user?.role === "UNITADMIN"}
                >
                  {user?.role === "SUPERADMIN" ? (
                    <>
                      <option value="">Seleccione un rol</option>
                      <option value="SUPERADMIN">SuperAdmin</option>
                      <option value="UNITADMIN">AdminUnidad</option>
                      <option value="VIEWER">Vista</option>
                    </>
                  ) : (
                    <option value="VIEWER">Vista</option>
                  )}
                </select>
              </div>

              {user?.role === "SUPERADMIN" && formData.role !== "SUPERADMIN" && (
                <div>
                  <label htmlFor="unit_id" className="block text-sm font-medium text-gray-700 mb-2">
                    Unidad *
                  </label>
                  <select
                    id="unit_id"
                    value={formData.unit_id}
                    onChange={(e) => setFormData({ ...formData, unit_id: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">Seleccionar unidad</option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {user?.role === "SUPERADMIN" && formData.role === "SUPERADMIN" && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm text-purple-700">
                    ℹ️ Los usuarios SUPERADMIN tienen acceso a todas las unidades y no necesitan una unidad asignada.
                  </p>
                </div>
              )}

              <div className="flex gap-2 justify-end pt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={!editingUser && !ciValid}>
                  {editingUser ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false)
          setUserToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
        title="¿Eliminar Usuario?"
        message={`¿Estás seguro de que deseas eliminar al usuario "${userToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  )
}