"use client"

import { useState, useEffect, useCallback } from "react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
  subDays,
} from "date-fns"
import { es } from "date-fns/locale"

const DEFAULT_COLOR = "#47b4d8"
const MAX_VISIBLE_EVENT_ROWS = 4

// Función para formatear hora
const formatTime = (time) => {
  if (!time) return '';
  return time.slice(0, 5);
}

// Hook responsivo para detectar el tamaño de la ventana dinámicamente
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    
    window.addEventListener("resize", handleResize);
    handleResize();
    
    return () => window.removeEventListener("resize", handleResize);
  }, []); 

  return windowSize;
}

export default function ExpandedCalendarView({ 
  currentDate, 
  events = [], 
  onEventClick, 
  onDateClick, 
  onAddEvent, 
  canEdit, 
  selectedDate 
}) {
  const [hoveredEvent, setHoveredEvent] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  // Expansión por DÍA individual
  const [expandedDays, setExpandedDays] = useState(new Set())
  const { width: windowWidth, height: windowHeight } = useWindowSize();

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const weeks = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  // Altura base uniforme para todas las filas (más generosa)
  const BASE_ROW_HEIGHT = 140 // Altura predeterminada que se ve bien
  const EVENT_HEIGHT = 32 // Altura de cada evento
  const BUTTON_SPACE = 35 // Espacio para botones "Ver más/menos"

  // Obtener eventos para una SEMANA
  const getEventsForWeek = useCallback((weekDays) => {
    const weekStart = weekDays[0]
    const weekEnd = weekDays[6]
    return events.filter(event => {
      if (!event?.start_date || !event?.end_date) return false
      const eventStart = parseISO(event.start_date.split('T')[0])
      const eventEnd = subDays(parseISO(event.end_date.split('T')[0]), 1)
      return eventStart <= weekEnd && eventEnd >= weekStart
    })
  }, [events])

  // Obtener eventos para un DÍA específico
  const getEventsForDay = useCallback((day) => {
    return events.filter(event => {
      if (!event?.start_date || !event?.end_date) return false
      const eventStart = parseISO(event.start_date.split('T')[0])
      const eventEnd = subDays(parseISO(event.end_date.split('T')[0]), 1)
      return eventStart <= day && eventEnd >= day
    }).sort((a, b) => {
      const startCompare = a.start_date.localeCompare(b.start_date)
      if (startCompare !== 0) return startCompare
      
      const timeCompare = (a.start_time || '').localeCompare(b.start_time || '')
      if (timeCompare !== 0) return timeCompare
      
      if (a.created_at && b.created_at) {
        const createdCompare = a.created_at.localeCompare(b.created_at)
        if (createdCompare !== 0) return createdCompare
      }
      
      const durationA = parseISO(a.end_date) - parseISO(a.start_date)
      const durationB = parseISO(b.end_date) - parseISO(b.start_date)
      if (durationA !== durationB) return durationB - durationA
      
      return (a.id || 0) - (b.id || 0)
    })
  }, [events])

  // Procesar eventos en tracks para barras continuas
  const processWeekEvents = useCallback((weekEvents, weekDays) => {
    const eventLayouts = []
    const tracks = []

    const sortedEvents = [...weekEvents].sort((a, b) => {
      const startCompare = a.start_date.localeCompare(b.start_date)
      if (startCompare !== 0) return startCompare
      
      const timeCompare = (a.start_time || '00:00').localeCompare(b.start_time || '00:00')
      if (timeCompare !== 0) return timeCompare
      
      if (a.created_at && b.created_at) {
        const createdCompare = a.created_at.localeCompare(b.created_at)
        if (createdCompare !== 0) return createdCompare
      }
      
      const durationA = parseISO(a.end_date) - parseISO(a.start_date)
      const durationB = parseISO(b.end_date) - parseISO(b.start_date)
      if (durationA !== durationB) return durationB - durationA
      
      return (a.id || 0) - (b.id || 0)
    })

    sortedEvents.forEach(event => {
      const eventStart = parseISO(event.start_date.split('T')[0])
      const eventEnd = subDays(parseISO(event.end_date.split('T')[0]), 1)
      let assignedTrack = -1

      for (let i = 0; i < tracks.length; i++) {
        if (!tracks[i].some(e => {
          const eStart = parseISO(e.start_date.split('T')[0])
          const eEnd = subDays(parseISO(e.end_date.split('T')[0]), 1)
          return eventStart <= eEnd && eventEnd >= eStart
        })) {
          assignedTrack = i
          break
        }
      }

      if (assignedTrack === -1) {
        assignedTrack = tracks.length
        tracks.push([])
      }
      tracks[assignedTrack].push(event)

      const displayStart = eventStart < weekDays[0] ? weekDays[0] : eventStart
      const displayEnd = eventEnd > weekDays[6] ? weekDays[6] : eventEnd
      const startCol = weekDays.findIndex(day => isSameDay(day, displayStart))
      const endCol = weekDays.findIndex(day => isSameDay(day, displayEnd))

      eventLayouts.push({
        event,
        track: assignedTrack,
        startCol: startCol + 1,
        span: Math.max(1, endCol - startCol + 1),
        isStart: isSameDay(displayStart, eventStart),
      })
    })

    return { eventLayouts, totalTracks: tracks.length }
  }, [])
  
  // Alternar expansión de un día específico
  const toggleDayExpansion = (dayKey) => {
    setExpandedDays(prev => {
      const newSet = new Set(prev)
      newSet.has(dayKey) ? newSet.delete(dayKey) : newSet.add(dayKey)
      return newSet
    })
  }

  const handleAddEventClick = (e, day) => {
    e.stopPropagation()
    if (onAddEvent) onAddEvent(day)
  }

  const handleMouseEnter = (event, e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const tooltipWidth = 320, tooltipHeight = 280
    const margin = 10

    let x = rect.right + margin
    let y = rect.top
    
    // Ajustar posición horizontal
    if (x + tooltipWidth > window.innerWidth) {
      x = rect.left - tooltipWidth - margin
    }
    if (x < margin) {
      x = margin
    }
    
    // Ajustar posición vertical
    if (y + tooltipHeight > window.innerHeight) {
      y = rect.top - tooltipHeight - margin
    }
    
    if (y < margin) {
      y = Math.max(margin, (window.innerHeight - tooltipHeight) / 2)
    }

    setTooltipPosition({ x, y })
    setHoveredEvent(event)
  }

  const handleMouseLeave = () => {
    setHoveredEvent(null)
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 bg-gradient-to-r from-[#584291] to-[#341a67] text-white font-bold text-xs sm:text-sm">
        {["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"].map((day, idx) => (
          <div key={idx} className="p-2 sm:p-3 text-center border-r border-white/20 last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      <div className="border-t-2 border-gray-300">
        {weeks.map((week, weekIdx) => {
          const weekEvents = getEventsForWeek(week)
          const { eventLayouts, totalTracks } = processWeekEvents(weekEvents, week)

          // Calcular cuántos eventos realmente se van a mostrar en esta semana
          // considerando la expansión de días individuales
          let maxVisibleTracks = 0
          week.forEach(day => {
            const dayKey = format(day, 'yyyy-MM-dd')
            const isDayExpanded = expandedDays.has(dayKey)
            const dayEvents = getEventsForDay(day)
            
            // Si el día está expandido, contar todos sus eventos
            // Si no, contar máximo MAX_VISIBLE_EVENT_ROWS
            const visibleInDay = isDayExpanded 
              ? dayEvents.length 
              : Math.min(dayEvents.length, MAX_VISIBLE_EVENT_ROWS)
            
            maxVisibleTracks = Math.max(maxVisibleTracks, visibleInDay)
          })
          
          // Verificar si hay botones "Ver más/menos"
          const hasMoreButton = eventLayouts.some(layout => {
            const eventStartDate = parseISO(layout.event.start_date.split('T')[0])
            const startDayCol = week.findIndex(day => isSameDay(day, eventStartDate))
            if (startDayCol !== -1) {
              const dayEvents = getEventsForDay(week[startDayCol])
              return dayEvents.length > MAX_VISIBLE_EVENT_ROWS
            }
            return false
          })
          
          // Calcular el espacio necesario para los eventos
          const eventsSpace = maxVisibleTracks * EVENT_HEIGHT
          const buttonSpace = hasMoreButton ? BUTTON_SPACE : 0
          const neededHeight = eventsSpace + buttonSpace + 50 // 50px para header del día y padding
          
          // Usar la altura base predeterminada SIEMPRE, y solo crecer si los eventos necesitan más espacio
          const weekHeight = Math.max(BASE_ROW_HEIGHT, neededHeight)

          return (
            <div key={weekIdx} className="relative border-b border-gray-300 last:border-b-0">
              <div className="grid grid-cols-7">
                {week.map((day, dayIdx) => {
                  const isCurrentMonth = isSameMonth(day, currentDate)
                  const isSelected = selectedDate && isSameDay(day, selectedDate)
                  const isCurrentDay = isToday(day)
                  
                  // Obtener eventos para ESTE día específico
                  const dayEvents = getEventsForDay(day)
                  const totalEventsInDay = dayEvents.length
                  
                  // Clave única para este día
                  const dayKey = format(day, 'yyyy-MM-dd')
                  const isDayExpanded = expandedDays.has(dayKey)
                  
                  // Calcular cuántos eventos mostrar
                  const visibleEventsCount = isDayExpanded ? totalEventsInDay : Math.min(totalEventsInDay, MAX_VISIBLE_EVENT_ROWS)
                  const hiddenEventsCount = Math.max(0, totalEventsInDay - visibleEventsCount)

                  return (
                    <div
                      key={dayIdx}
                      onClick={() => onDateClick && onDateClick(day)}
                      className={`group relative border-r border-gray-300 last:border-r-0 p-1 sm:p-2 cursor-pointer hover:bg-blue-50 transition-colors ${
                        isSelected ? "bg-[#47b4d8]/20 ring-2 ring-[#47b4d8] ring-inset" : ""
                      } ${isCurrentDay ? "bg-[#47b4d8]/10" : ""} ${!isCurrentMonth ? "bg-gray-50" : "bg-white"}`}
                      style={{ minHeight: `${weekHeight}px` }}
                    >
                      <div className="flex items-center justify-between mb-1 relative z-20">
                        <span
                          className={`text-[10px] sm:text-xs font-semibold ${
                            isCurrentDay
                              ? "bg-[#47b4d8] text-white w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center"
                              : isCurrentMonth ? "text-gray-700" : "text-gray-400"
                          }`}
                        >
                          {format(day, "d")}
                        </span>
                        
                        {canEdit && isCurrentMonth && (
                          <button
                            onClick={(e) => handleAddEventClick(e, day)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 flex items-center justify-center bg-gradient-to-r from-[#584291] to-[#341a67] text-white rounded-full text-xs font-bold shadow-md"
                            title="Agregar evento"
                          >
                            +
                          </button>
                        )}
                      </div>

                      {/* Botón "Ver más" para ESTE día específico */}
                      {hiddenEventsCount > 0 && !isDayExpanded && (
                        <div className="absolute bottom-1 left-0 right-0 text-center z-30">
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleDayExpansion(dayKey) }} 
                            className="text-[10px] font-semibold text-[#47b4d8] hover:bg-[#47b4d8]/10 rounded px-2 py-0.5 transition-colors bg-white/90 backdrop-blur-sm inline-flex items-center gap-1 shadow-sm"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                            Ver {hiddenEventsCount} más
                          </button>
                        </div>
                      )}

                      {/* Botón "Ver menos" para ESTE día */}
                      {isDayExpanded && totalEventsInDay > MAX_VISIBLE_EVENT_ROWS && (
                        <div className="absolute bottom-1 left-0 right-0 text-center z-30">
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleDayExpansion(dayKey) }} 
                            className="text-[10px] font-semibold text-[#47b4d8] hover:bg-[#47b4d8]/10 rounded px-2 py-0.5 transition-colors bg-white/90 backdrop-blur-sm inline-flex items-center gap-1 shadow-sm"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                            Ver menos
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Contenedor de eventos con tracks (barras continuas) */}
              <div
                className="absolute top-8 left-0 right-0 grid grid-cols-7 pointer-events-none"
                style={{
                  gridTemplateRows: `repeat(${totalTracks}, 32px)`,
                  height: 'auto',
                  minHeight: `${totalTracks * 32}px`,
                }}
              >
                {eventLayouts.map(({ event, track, startCol, span, isStart }, idx) => {
                  // Determinar si este evento debe mostrarse según la expansión del día donde INICIA
                  const eventStartDate = parseISO(event.start_date.split('T')[0])
                  const startDayCol = week.findIndex(day => isSameDay(day, eventStartDate))
                  
                  let shouldShow = true
                  if (startDayCol !== -1) {
                    const startDay = week[startDayCol]
                    const startDayKey = format(startDay, 'yyyy-MM-dd')
                    const isStartDayExpanded = expandedDays.has(startDayKey)
                    const eventsInStartDay = getEventsForDay(startDay)
                    const eventIndexInDay = eventsInStartDay.findIndex(e => e.id === event.id)
                    
                    if (!isStartDayExpanded && eventIndexInDay >= MAX_VISIBLE_EVENT_ROWS) {
                      shouldShow = false
                    }
                  }

                  if (!shouldShow) return null

                  return (
                    <div
                      key={`${event.id}-${idx}`}
                      onClick={(e) => { e.stopPropagation(); if (onEventClick) onEventClick(event) }}
                      onMouseEnter={(e) => handleMouseEnter(event, e)}
                      onMouseLeave={handleMouseLeave}
                      className="cursor-pointer hover:opacity-90 hover:scale-[1.02] hover:z-50 transition-all flex items-center overflow-hidden rounded pointer-events-auto mx-px"
                      style={{
                        backgroundColor: event.color || DEFAULT_COLOR,
                        gridColumn: `${startCol} / span ${span}`,
                        gridRow: `${track + 1} / span 1`,
                        height: '32px',
                      }}
                      title=""
                    >
                      {windowWidth < 768 ? (
                        <div className="w-2 h-2 rounded-full mx-auto" style={{ backgroundColor: 'white' }}></div>
                      ) : (
                        <div className="truncate w-full text-white font-medium text-[11px] px-2 py-1">
                          {isStart && <span className="font-bold mr-1">{formatTime(event.start_time)}</span>}
                          <span>{event.title}</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Tooltip Personalizado */}
      {hoveredEvent && (
        <div 
          className="fixed z-[9999] w-full max-w-md bg-gray-900 text-white text-xs rounded-lg shadow-2xl pointer-events-none"
          style={{ left: `${tooltipPosition.x}px`, top: `${tooltipPosition.y}px` }}
        >
          <div className="p-4">
            <h4 className="font-bold text-sm mb-3 pb-2 border-b border-gray-700">{hoveredEvent.title}</h4>
            <div className="space-y-2 text-[11px]">
              <div className="flex items-center gap-2 text-blue-300">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span className="font-medium">
                  {format(parseISO(hoveredEvent.start_date.split('T')[0]), "d 'de' MMMM, yyyy", { locale: es })}
                  {hoveredEvent.end_date !== hoveredEvent.start_date && (
                    <> → {format(subDays(parseISO(hoveredEvent.end_date.split('T')[0]), 1), "d 'de' MMMM, yyyy", { locale: es })}</>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2 text-green-300">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="font-medium">{formatTime(hoveredEvent.start_time)} - {formatTime(hoveredEvent.end_time)}</span>
              </div>
              {hoveredEvent.location && (
                <div className="flex items-center gap-2 text-red-300">
                   <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span>{hoveredEvent.location}</span>
                </div>
              )}
              {hoveredEvent.organizer && (
                <div className="flex items-center gap-2 text-yellow-300">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  <span>{hoveredEvent.organizer}</span>
                </div>
              )}
              {hoveredEvent.attendees && (
                <div className="flex items-start gap-2 text-purple-300">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  <div className="flex-1">{hoveredEvent.attendees}</div>
                </div>
              )}
              {hoveredEvent.category && (
                <div className="flex items-center gap-2 text-indigo-300">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                  <span>{hoveredEvent.category}</span>
                </div>
              )}
              {hoveredEvent.unit_name && (
                <div className="flex items-center gap-2 text-cyan-300">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  <span>{hoveredEvent.unit_name}</span>
                </div>
              )}
              {hoveredEvent.description && (
                <div className="pt-2 mt-2 border-t border-gray-700 text-gray-300">
                  <p className="leading-relaxed whitespace-pre-wrap">{hoveredEvent.description}</p>
                </div>
              )}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-700 text-center text-[9px] text-gray-400">
              Click para ver todos los detalles
            </div>
          </div>
        </div>
      )}
    </div>
  )
}