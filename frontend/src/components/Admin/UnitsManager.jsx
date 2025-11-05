"use client"

import { useState, useEffect } from "react"
import api from "../../services/api"
import ConfirmModal from "../ui/ConfirmModal"

export default function UnitsManager() {
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUnit, setEditingUnit] = useState(null)
  const [formData, setFormData] = useState({ name: "" })
  const [error, setError] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [unitToDelete, setUnitToDelete] = useState(null)

  useEffect(() => {
    fetchUnits()
  }, [])

  const fetchUnits = async () => {
    try {
      setLoading(true)
      const response = await api.getUnits()
      setUnits(response.data?.units || [])
    } catch (error) {
      console.error("Error fetching units:", error)
      setUnits([])
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingUnit(null)
    setFormData({ name: "" })
    setError("")
    setModalOpen(true)
  }

  const handleEdit = (unit) => {
    setEditingUnit(unit)
    setFormData({ name: unit.name })
    setError("")
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    try {
      if (editingUnit) {
        await api.updateUnit(editingUnit.id, formData.name)
      } else {
        await api.createUnit(formData.name)
      }
      await fetchUnits()
      setModalOpen(false)
    } catch (err) {
      setError(err.message || "Error al guardar la unidad")
    }
  }

  const handleDeleteClick = (unit) => {
    setUnitToDelete(unit)
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = async () => {
    setShowDeleteConfirm(false)
    
    try {
      await api.deleteUnit(unitToDelete.id)
      await fetchUnits()
    } catch (error) {
      setError(error.message || "Error al eliminar la unidad")
    } finally {
      setUnitToDelete(null)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-[#47b4d8] border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600 mt-4">Cargando unidades...</p>
      </div>
    )
  }

  return (
    <div className="px-1 lg:px-2 xl:px-2">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Unidades Municipales</h2>
        <button onClick={handleAdd} className="btn-primary">
          + Nueva Unidad
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {units.map((unit) => (
          <div key={unit.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{unit.name}</h3>
                <p className="text-sm text-gray-500 mt-1">ID: {unit.id}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(unit)}
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
                  onClick={() => handleDeleteClick(unit)}
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
            </div>
          </div>
        ))}
      </div>

      {units.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No hay unidades registradas
        </div>
      )}

      {/* Modal de Formulario */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                {editingUnit ? "Editar Unidad" : "Nueva Unidad"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Unidad *
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  className="input-field"
                  required
                  placeholder="Ej: Despacho del Alcalde"
                />
              </div>

              <div className="flex gap-2 justify-end mt-6">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingUnit ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false)
          setUnitToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
        title="¿Eliminar Unidad?"
        message={`¿Estás seguro de que deseas eliminar la unidad "${unitToDelete?.name}"? Esto eliminará todos sus eventos asociados. Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  )
}