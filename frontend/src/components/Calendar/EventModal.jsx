"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import ConfirmDeleteModal from "./ConfirmDeleteModal"
import useAuthStore from "../../store/authStore"

const MAX_TITLE_LENGTH = 255

export default function EventModal({
  isOpen,
  onClose,
  event,
  onSave,
  onDelete,
  units = [],
  selectedDate,
}) {
  const { user } = useAuthStore()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    start_time: "",
    end_time: "",
    unit_id: "",
    category: "",
    location: "",
    organizer: "",
    attendees: "",
    color: "#00b1e1",
  })
  
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [titleLength, setTitleLength] = useState(0)

  useEffect(() => {
    if (isOpen) {
      if (event) {
        setFormData({
          title: event.title || "",
          description: event.description || "",
          start_date: event.start_date?.split("T")[0] || "",
          end_date: event.end_date ? format(new Date(new Date(event.end_date).getTime() - 24 * 60 * 60 * 1000), "yyyy-MM-dd") : "",
          start_time: event.start_time || "",
          end_time: event.end_time || "",
          unit_id: event.unit_id || "",
          category: event.category || "",
          location: event.location || "",
          organizer: event.organizer || "",
          attendees: event.attendees || "",
          color: event.color || "#00b1e1",
        })
        setTitleLength((event.title || "").length)
      } else {
        setFormData({
          title: "",
          description: "",
          start_date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
          end_date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
          start_time: "",
          end_time: "",
          category: "",
          location: "",
          organizer: "",
          attendees: "",
          color: "#00b1e1",
          unit_id: user?.role === "UNITADMIN" ? user.unit_id : "",
        })
        setTitleLength(0)
      }
      // Limpiar errores al abrir el modal
      setErrors({})
    }
  }, [event, selectedDate, user, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name === "title") {
      if (value.length > MAX_TITLE_LENGTH) {
        return
      }
      setTitleLength(value.length)
    }
    
    setFormData((prev) => ({ ...prev, [name]: value }))
    
    // Limpiar el error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Limpiar errores previos
    const newErrors = {}
    
    // Validación de campos obligatorios
    if (!formData.title.trim()) {
      newErrors.title = "Este campo es obligatorio"
    } else if (formData.title.length > MAX_TITLE_LENGTH) {
      newErrors.title = `El motivo/evento no puede exceder ${MAX_TITLE_LENGTH} caracteres`
    }
    
    if (!formData.organizer.trim()) {
      newErrors.organizer = "Este campo es obligatorio"
    }
    
    if (!formData.location.trim()) {
      newErrors.location = "Este campo es obligatorio"
    }
    
    if (!formData.attendees.trim()) {
      newErrors.attendees = "Este campo es obligatorio"
    }
    
    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      newErrors.end_date = "La fecha de fin no puede ser anterior a la fecha de inicio"
    }
    
    // Si hay errores, mostrarlos y no continuar
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setErrors({})
    setLoading(true)
    try {
      await onSave(formData)
      onClose()
    } catch (err) {
      setErrors({ general: err.response?.data?.error || err.message || "Error al guardar el evento" })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = async () => {
    setShowDeleteConfirm(false)
    setLoading(true)
    try {
      await onDelete(event.id)
      setLoading(false)
      onClose()
    } catch (err) {
      setErrors({ general: err.response?.data?.error || err.message || "Error al eliminar el evento" })
      setLoading(false)
    }
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose()
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  if (!isOpen) return null

  const canEdit = user?.role === "SUPERADMIN" || user?.role === "UNITADMIN"
  const isViewMode = event && !canEdit

  const eventColors = [
    { name: "Celeste", value: "#00b1e1" }, 
    { name: "Celeste suave", value: "#63d3e9" },
    { name: "Verde claro", value: "#91c854" }, 
    { name: "Naranja", value: " #ffbf17" },
    { name: "Rojo", value: "#ed5466" }, 
    { name: "Verde", value: "#6bccb4" }, 
    { name: "Negro", value: "#2A2A2A" },
  ]

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={handleOverlayClick}
      >
        <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[95vh] flex flex-col">
          <div className="flex items-start justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {event ? "Editar Evento" : "Adicionar Evento"}
              </h2>
              <p className="text-gray-600 mt-1">
                {event ? "Modifica la información del evento" : "Formulario de ingreso de nuevo evento a guardar en la Agenda"}
              </p>
            </div>
            <button 
              onClick={handleClose} 
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 text-3xl leading-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              &times;
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
            {errors.general && <div className="text-[#584291] bg-purple-100 p-3 rounded-md">{errors.general}</div>}

            {/* Campo de título convertido a TEXTAREA con contador de caracteres */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Motivo / Evento *</label>
                <span className={`text-xs font-medium ${titleLength > MAX_TITLE_LENGTH * 0.9 ? 'text-[#584291]' : 'text-gray-500'}`}>
                  {titleLength}/{MAX_TITLE_LENGTH}
                </span>
              </div>
              <textarea
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                className={`input-field mt-1 resize-none ${errors.title ? 'border-[#584291] placeholder-[#584291]' : ''}`}
                placeholder={errors.title || "Ingrese el nombre del evento o Motivo"}
                required 
                disabled={isViewMode || loading}
                maxLength={MAX_TITLE_LENGTH}
                rows={2}
              />
              {!errors.title && titleLength > MAX_TITLE_LENGTH * 0.9 && (
                <p className="text-xs text-orange-600 mt-1">
                  ⚠️ Te estás acercando al límite de caracteres
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Del *</label>
                <input 
                  name="start_date" 
                  type="date" 
                  value={formData.start_date} 
                  onChange={handleChange} 
                  className={`input-field mt-1 ${errors.start_date ? 'border-[#584291]' : ''}`}
                  required 
                  disabled={isViewMode || loading} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Hora Inicio *</label>
                <input 
                  name="start_time" 
                  type="time" 
                  value={formData.start_time} 
                  onChange={handleChange} 
                  className={`input-field mt-1 ${errors.start_time ? 'border-[#584291]' : ''}`}
                  required 
                  disabled={isViewMode || loading} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Hasta *</label>
                <input 
                  name="end_date" 
                  type="date" 
                  value={formData.end_date} 
                  onChange={handleChange} 
                  className={`input-field mt-1 ${errors.end_date ? 'border-[#584291]' : ''}`}
                  required 
                  disabled={isViewMode || loading} 
                />
                {errors.end_date && (
                  <p className="text-xs text-[#584291] mt-1">{errors.end_date}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Hora Finaliza *</label>
                <input 
                  name="end_time" 
                  type="time" 
                  value={formData.end_time} 
                  onChange={handleChange} 
                  className={`input-field mt-1 ${errors.end_time ? 'border-[#584291]' : ''}`}
                  required 
                  disabled={isViewMode || loading} 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Color del evento</label>
              <div className="flex gap-3 items-center mt-2">
                {eventColors.map((color) => (
                  <button 
                    key={color.value} 
                    type="button" 
                    onClick={() => handleChange({ target: { name: 'color', value: color.value } })} 
                    className={`w-8 h-8 rounded-full border-2 transition-all ${formData.color === color.value ? 'ring-2 ring-offset-2 ring-gray-500' : 'border-gray-300'}`} 
                    style={{ backgroundColor: color.value }} 
                    title={color.name} 
                    disabled={isViewMode || loading} 
                  />
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Solicita: *</label>
              <input 
                name="organizer" 
                value={formData.organizer} 
                onChange={handleChange} 
                className={`input-field mt-1 ${errors.organizer ? 'border-[#584291] placeholder-[#584291]' : ''}`}
                placeholder={errors.organizer || "Nombre de la unidad solicitante"}
                required 
                disabled={isViewMode || loading} 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Lugar: *</label>
              <input 
                name="location" 
                value={formData.location} 
                onChange={handleChange} 
                className={`input-field mt-1 ${errors.location ? 'border-[#584291] placeholder-[#584291]' : ''}`}
                placeholder={errors.location || "Lugar donde se desarrollará el evento"}
                required 
                disabled={isViewMode || loading} 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Asisten: *</label>
                <textarea 
                  name="attendees" 
                  value={formData.attendees} 
                  onChange={handleChange} 
                  rows={4} 
                  className={`input-field mt-1 resize-none ${errors.attendees ? 'border-[#584291] placeholder-[#584291]' : ''}`}
                  placeholder={errors.attendees || "Personas que asistirán al evento"}
                  required 
                  disabled={isViewMode || loading} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción:</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  rows={4} 
                  className="input-field mt-1 resize-none" 
                  placeholder="Describa su evento" 
                  disabled={isViewMode || loading} 
                />
              </div>
            </div>

            {user?.role === "SUPERADMIN" && (
              <div>
                <label htmlFor="unit_id" className="block text-sm font-medium text-gray-700">Unidad *</label>
                <select 
                  id="unit_id" 
                  name="unit_id" 
                  value={formData.unit_id} 
                  onChange={handleChange} 
                  className="input-field mt-1" 
                  required 
                  disabled={isViewMode || loading}
                >
                  <option value="">Seleccionar unidad</option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>{unit.name}</option>
                  ))}
                </select>
              </div>
            )}
          </form>

          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <div>
              {event && canEdit && (
                <button type="button" onClick={handleDeleteClick} disabled={loading} className="text-red-600 hover:text-red-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? "Procesando..." : "Eliminar Evento"}
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={handleClose} disabled={loading} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                Cancelar
              </button>
              {!isViewMode && (
                <button type="submit" onClick={handleSubmit} disabled={loading} className="px-6 py-2 bg-gradient-to-r from-[#584291] to-[#341a67] text-white rounded-lg hover:opacity-90 font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? "Guardando..." : event ? "Actualizar" : "Adicionar"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        eventTitle={formData.title}
      />
    </>
  )
}