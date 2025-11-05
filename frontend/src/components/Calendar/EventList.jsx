"use client"

import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function EventList({ events, selectedDate, onEventClick, onAddEvent, canEdit }) {
  if (!selectedDate) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#47b4d8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          Eventos del día
        </h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📅</div>
          <p className="text-gray-500 text-sm">Selecciona una fecha para ver los eventos</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#47b4d8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          Eventos del {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
        </h3>
        {canEdit && (
          <button onClick={onAddEvent} className="text-[#584291] hover:text-[#341a67] font-semibold text-sm">
            + Añadir
          </button>
        )}
      </div>

      {events.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🔭</div>
          <p className="text-gray-500 text-sm font-medium mb-3">No hay eventos para esta fecha</p>
          {canEdit && (
            <button
              onClick={onAddEvent}
              className="px-4 py-2 bg-gradient-to-r from-[#584291] to-[#341a67] text-white rounded-lg hover:from-[#341a67] hover:to-[#584291] text-sm font-semibold"
            >
              Crear Evento
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {events.map((event) => (
            <div
              key={event.id}
              onClick={() => onEventClick(event)}
              className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-1 h-full rounded-full flex-shrink-0"
                  style={{ backgroundColor: event.color || "#47b4d8" }}
                ></div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">{event.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="font-medium">
                      {event.start_time} - {event.end_time}
                    </span>
                  </div>
                  {event.description && <p className="text-xs text-gray-600 mb-2 line-clamp-2">{event.description}</p>}
                  {event.location && (
                    <div className="flex flex-wrap gap-1">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                        📍 {event.location}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}