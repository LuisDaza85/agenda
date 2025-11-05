"use client"

import { es } from "date-fns/locale"

export default function EventDetailsModal({ isOpen, onClose, event, onEdit, canEdit }) {
  if (!isOpen || !event) return null

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // ✅ CORRECCIÓN: Extraer fechas sin parseISO para evitar problemas de timezone
  const getEventStartDate = () => {
    if (!event.start_date && !event.date) return null;
    const dateStr = (event.start_date || event.date).split('T')[0]; // "2025-10-07"
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day); // Mes es 0-indexed
  }

  const getEventEndDate = () => {
    if (!event.end_date) return null;
    const dateStr = event.end_date.split('T')[0]; // "2025-10-08"
    const [year, month, day] = dateStr.split('-').map(Number);
    const endDate = new Date(year, month - 1, day);
    // Restar 1 día porque el backend usa formato exclusivo
    endDate.setDate(endDate.getDate() - 1);
    return endDate;
  }

  // ✅ NUEVA FUNCIÓN: Formatear hora sin segundos
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    // Si viene en formato HH:MM:SS, tomar solo HH:MM
    const parts = timeStr.split(':');
    return `${parts[0]}:${parts[1]}`;
  }

  const formatDate = (date) => {
    if (!date) return '';
    const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    
    return `${days[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
  }

  const formatShortDate = (date) => {
    if (!date) return '';
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return `${date.getDate()} de ${months[date.getMonth()]}`;
  }

  const startDate = getEventStartDate();
  const endDate = getEventEndDate();

  // Función para manejar el botón de editar
  const handleEditClick = () => {
    if (onEdit) {
      onEdit(event);
    }
  }

  // Verificar si es el mismo día
  const isSameDay = startDate && endDate && 
    startDate.getDate() === endDate.getDate() &&
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getFullYear() === endDate.getFullYear();

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header - CON COLOR DEL EVENTO */}
        <div 
          className="text-white p-6 rounded-t-xl flex-shrink-0" 
          style={{ backgroundColor: event.color || '#47b4d8' }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{event.title}</h2>
              {startDate && (
                <div className="flex items-center gap-2 text-white/90">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium">
                    {isSameDay 
                      ? formatDate(startDate)
                      : `${formatShortDate(startDate)} - ${formatShortDate(endDate)}, ${endDate.getFullYear()}`
                    }
                  </span>
                </div>
              )}
              {event.start_time && (
                <div className="flex items-center gap-2 text-white/90 mt-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">
                    {formatTime(event.start_time)} {event.end_time && `- ${formatTime(event.end_time)}`}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-2xl leading-none ml-4"
            >
              ×
            </button>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Horario adicional si el evento dura varios días */}
          {!isSameDay && (
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#47b4d8] to-[#4bc5e8] rounded-lg flex items-center justify-center shadow-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Duración</h3>
                <p className="text-base text-gray-900">
                  Hasta: {formatShortDate(endDate)}
                </p>
              </div>
            </div>
          )}

          {/* Ubicación */}
          {event.location && (
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#4bc5e8] to-[#47b4d8] rounded-lg flex items-center justify-center shadow-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Lugar</h3>
                <p className="text-base text-gray-900">{event.location}</p>
              </div>
            </div>
          )}

          {/* Organizador */}
          {event.organizer && (
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#47b4d8] to-[#009ed0] rounded-lg flex items-center justify-center shadow-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Solicita</h3>
                <p className="text-base text-gray-900">{event.organizer}</p>
              </div>
            </div>
          )}

          {/* Asistentes */}
          {event.attendees && (
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#009ed0] to-[#47b4d8] rounded-lg flex items-center justify-center shadow-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Asisten</h3>
                <p className="text-base text-gray-900 whitespace-pre-wrap">{event.attendees}</p>
              </div>
            </div>
          )}

          {/* Descripción */}
          {event.description && (
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#4bc5e8] to-[#009ed0] rounded-lg flex items-center justify-center shadow-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Descripción</h3>
                <p className="text-base text-gray-900 whitespace-pre-wrap">{event.description}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Botones */}
        <div className="flex-shrink-0 flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Cerrar
          </button>
          {canEdit && onEdit && (
            <button
              onClick={handleEditClick}
              className="px-6 py-2.5 bg-gradient-to-r from-[#47b4d8] to-[#009ed0] text-white rounded-lg hover:from-[#009ed0] hover:to-[#47b4d8] font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}