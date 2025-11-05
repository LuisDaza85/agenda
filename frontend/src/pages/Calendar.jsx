"use client"

import { useState, useEffect } from "react"
import { format, addMonths, subMonths, isToday, isFuture, parseISO, addDays, isBefore, startOfDay, startOfMonth, endOfMonth } from "date-fns"
import { es } from "date-fns/locale"
import useAuthStore from "../store/authStore"
import api from "../services/api"
import CalendarGrid from "../components/Calendar/CalendarGrid"
import EventList from "../components/Calendar/EventList"
import EventModal from "../components/Calendar/EventModal"
import ExpandedCalendarView from "../components/Calendar/ExpandedCalendarView"
import PrintModal from "../components/Calendar/PrintModal"
import EventDetailsModal from "../components/Calendar/EventDetailsModal"
import ConfirmModal from "../components/ui/ConfirmModal"

export default function Calendar() {
  const { user } = useAuthStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [events, setEvents] = useState([])
  const [units, setUnits] = useState([])
  const [selectedUnitId, setSelectedUnitId] = useState("all") // Nuevo estado para filtrar por unidad
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [printModalOpen, setPrintModalOpen] = useState(false)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [showAddConfirm, setShowAddConfirm] = useState(false)
  const [dateToAdd, setDateToAdd] = useState(null)

  useEffect(() => {
    fetchEvents()
    if (user?.role === "SUPERADMIN") {
      fetchUnits()
    }
  }, [currentDate])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const startRange = startOfMonth(subMonths(currentDate, 1))
      const endRange = endOfMonth(addMonths(currentDate, 1))
      const params = {
        start_date: format(startRange, 'yyyy-MM-dd'),
        end_date: format(endRange, 'yyyy-MM-dd')
      }
      console.log('â€¦ Cargando eventos del', format(startRange, 'dd MMM'), 'al', format(endRange, 'dd MMM yyyy'))
      const response = await api.getEvents(params)
      const transformedEvents = (response.data?.events || []).map(event => ({
        ...event,
        date: event.start_date
      }))
      console.log('Ã¢Å“â€¦ Cargados', transformedEvents.length, 'eventos')
      setEvents(transformedEvents)
    } catch (error) {
      console.error("Error fetching events:", error)
      setEvents([])
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

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  const handleDateClick = (date) => {
    setSelectedDate(date)
  }

  const handleAddEventFromCalendar = (date) => {
    const today = startOfDay(new Date())
    const selectedDay = startOfDay(date)
    if (isBefore(selectedDay, today)) {
      setDateToAdd(date)
      setShowAddConfirm(true)
    } else {
      setSelectedDate(date)
      setSelectedEvent(null)
      setModalOpen(true)
    }
  }

  const handleAddEvent = () => {
    const dateToCheck = selectedDate || new Date()
    const today = startOfDay(new Date())
    const selectedDay = startOfDay(dateToCheck)
    if (isBefore(selectedDay, today)) {
      setDateToAdd(dateToCheck)
      setShowAddConfirm(true)
    } else {
      setSelectedDate(dateToCheck)
      setSelectedEvent(null)
      setModalOpen(true)
    }
  }

  const handleAddConfirm = () => {
    setShowAddConfirm(false)
    setSelectedDate(dateToAdd)
    setSelectedEvent(null)
    setModalOpen(true)
  }

  const handleEventClick = (event) => {
    setSelectedEvent(event)
    setDetailsModalOpen(true)
  }

  const handleEditFromDetails = () => {
    setDetailsModalOpen(false)
    setModalOpen(true)
  }

  const handleSaveEvent = async (eventData) => {
    try {
      if (selectedEvent) {
        await api.updateEvent(selectedEvent.id, eventData)
      } else {
        await api.createEvent(eventData)
      }
      await fetchEvents()
      setModalOpen(false)
      setDetailsModalOpen(false)
      setSelectedEvent(null)
      setSelectedDate(null)
    } catch (error) {
      throw error
    }
  }

  const handleDeleteEvent = async (eventId) => {
    try {
      await api.deleteEvent(eventId)
      await fetchEvents()
      setModalOpen(false)
      setDetailsModalOpen(false)
      setSelectedEvent(null)
      setSelectedDate(null)
    } catch (error) {
      throw error
    }
  }

  const totalEvents = events.length
  const upcomingEvents = events.filter((event) => {
    const eventDate = parseISO(event.date.split('T')[0])
    return isFuture(eventDate) || isToday(eventDate)
  }).length
  const todayEvents = events.filter((event) => {
    const eventDate = parseISO(event.date.split('T')[0])
    return isToday(eventDate)
  }).length

  // Filtrar eventos por busqueda y por unidad seleccionada (solo para SUPERADMIN)
  const filteredEvents = events.filter((event) => {
    // Filtro por busqueda
    const matchesSearch = 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.organizer?.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Filtro por unidad (solo para SUPERADMIN)
    const matchesUnit = user?.role === 'SUPERADMIN' 
      ? (selectedUnitId === 'all' || event.unit_id === parseInt(selectedUnitId))
      : true // Para UNITADMIN y VIEWER, mostrar todos sus eventos (ya filtrados por el backend)
    
    return matchesSearch && matchesUnit
  })

  const selectedDateEvents = selectedDate
    ? filteredEvents.filter((event) => {
          const eventDate = event.date.split('T')[0]
          return eventDate === format(selectedDate, "yyyy-MM-dd")
        }).sort((a, b) => a.start_time.localeCompare(b.start_time))
    : []

  const canEdit = user?.role === "SUPERADMIN" || user?.role === "UNITADMIN"

  return (
    <div className="space-y-3">
      {isFullscreen ? (
        <div>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-4 mb-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <button onClick={handlePreviousMonth} className="p-2 hover:bg-gray-100/50 rounded-lg transition-colors">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100/50 rounded-lg transition-colors">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button onClick={handleToday} className="px-4 py-2 bg-gray-100/70 hover:bg-gray-200/70 rounded-lg font-medium text-gray-700 text-sm">Hoy</button>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 uppercase">{format(currentDate, "MMMM yyyy", { locale: es })}</h2>
              <div className="flex items-center gap-2">
                {/* Selector de Unidades para SUPERADMIN */}
                {user?.role === "SUPERADMIN" && units.length > 0 && (
                  <div className="relative">
                    <select
                      value={selectedUnitId}
                      onChange={(e) => setSelectedUnitId(e.target.value)}
                      className="px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#47b4d8] focus:border-transparent text-sm font-medium text-gray-700 bg-white appearance-none cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <option value="all">Todas las Unidades</option>
                      {units.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                           {unit.name}
                        </option>
                      ))}
                    </select>
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                )}
                <div className="relative hidden md:block">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input type="text" placeholder="Buscar eventos..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#47b4d8] focus:border-transparent text-sm" />
                </div>
                {canEdit && (
                  <button onClick={handleAddEvent} className="px-4 py-2 bg-gradient-to-r from-[#584291] to-[#341a67] hover:from-[#341a67] hover:to-[#584291] text-white rounded-lg font-semibold flex items-center gap-2 shadow-md transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="hidden sm:inline">Agregar</span>
                  </button>
                )}
                <button onClick={() => setPrintModalOpen(true)} className="px-4 py-2 bg-[#009ed0] hover:bg-[#47b4d8] text-white rounded-lg font-semibold flex items-center gap-2 shadow-md transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span className="hidden sm:inline">Imprimir</span>
                </button>
                <button onClick={() => setIsFullscreen(false)} className="px-4 py-2 bg-[#341a67] hover:bg-[#584291] text-white rounded-lg font-semibold flex items-center gap-2 shadow-md transition-all hover:shadow-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="hidden sm:inline">Vista Normal</span>
                </button>
              </div>
            </div>
            <div className="md:hidden mt-4">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" placeholder="Buscar eventos..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#47b4d8] focus:border-transparent text-sm" />
              </div>
            </div>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="inline-block w-12 h-12 border-4 border-[#47b4d8] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-600 font-medium">Cargando eventos...</p>
              </div>
            </div>
          ) : (
            <ExpandedCalendarView currentDate={currentDate} events={filteredEvents} onEventClick={handleEventClick} onDateClick={handleDateClick} onAddEvent={handleAddEventFromCalendar} canEdit={canEdit} selectedDate={selectedDate} />
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between px-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 drop-shadow-md">Agenda Municipal</h1>
              <p className="text-sm text-gray-700"></p>
            </div>
            <div className="flex items-center gap-3">
               <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border border-white/30">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">{user?.name || "Usuario"}</span>
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-[#47b4d8] text-white">{user?.role === "VIEWER" ? "Visualizador" : user?.role === "UNITADMIN" ? "Admin Unidad" : "Super Admin"}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 px-4">
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              {/* Selector de Unidades para SUPERADMIN */}
              {user?.role === "SUPERADMIN" && units.length > 0 && (
                <div className="relative min-w-[200px]">
                  <select
                    value={selectedUnitId}
                    onChange={(e) => setSelectedUnitId(e.target.value)}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#47b4d8] focus:border-transparent text-sm font-medium text-gray-700 bg-white appearance-none cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <option value="all">Todas las Unidades</option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                         {unit.name}
                      </option>
                    ))}
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              )}
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" placeholder="Buscar eventos..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#47b4d8] focus:border-transparent" />
              </div>
              
                
              
            </div>
            <div className="flex flex-wrap gap-2">
              {canEdit && (
                <button onClick={handleAddEvent} className="px-5 py-2.5 bg-gradient-to-r from-[#584291] to-[#341a67] text-white rounded-lg hover:from-[#341a67] hover:to-[#584291] font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="hidden sm:inline">Agregar Evento</span>
                  <span className="sm:hidden">Agregar</span>
                </button>
              )}
              <button onClick={() => setIsFullscreen(!isFullscreen)} className="px-4 py-2 border-2 border-[#47b4d8] text-[#47b4d8] rounded-lg bg-white/70 hover:bg-[#47b4d8] hover:text-white font-semibold flex items-center gap-2 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m5 5v-4m0 4h-4m4 0l-5-5" />
                </svg>
                <span className="hidden sm:inline">Expandir</span>
              </button>
              <button onClick={() => setPrintModalOpen(true)} className="px-4 py-2 border-2 border-[#009ed0] text-[#009ed0] rounded-lg bg-white/70 hover:bg-[#009ed0] hover:text-white font-semibold flex items-center gap-2 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span className="hidden sm:inline">Imprimir</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4">
            <div className="bg-gradient-to-br from-[#584291]/90 to-[#341a67]/90 backdrop-blur-sm rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium opacity-90">
                    {user?.role === "SUPERADMIN" && selectedUnitId !== "all" 
                      ? "Eventos de la Unidad" 
                      : "Total Eventos"}
                  </p>
                  <p className="text-4xl font-bold mt-2">{filteredEvents.length}</p>
                  {user?.role === "SUPERADMIN" && selectedUnitId !== "all" && (
                    <p className="text-xs mt-1 opacity-75">
                      {units.find(u => u.id === parseInt(selectedUnitId))?.name || 'Unidad'}
                    </p>
                  )}
                  {(user?.role !== "SUPERADMIN" || selectedUnitId === "all") && (
                    <p className="text-xs mt-1 opacity-75">Registrados</p>
                  )}
                </div>
                <div className="bg-white/20 p-3 rounded-lg">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#47b4d8]/90 to-[#009ed0]/90 backdrop-blur-sm rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium opacity-90">Proximos Eventos</p>
                  <p className="text-4xl font-bold mt-2">{upcomingEvents}</p>
                  <p className="text-xs mt-1 opacity-75">Planificados</p>
                </div>
                <div className="bg-white/20 p-3 rounded-lg">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#341a67]/90 to-[#1a0d33]/90 backdrop-blur-sm rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium opacity-90">Eventos Hoy</p>
                  <p className="text-4xl font-bold mt-2">{todayEvents}</p>
                  <p className="text-xs mt-1 opacity-75">En curso</p>
                </div>
                <div className="bg-white/20 p-3 rounded-lg">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 p-4 mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Calendario</h2>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 bg-gray-100/70 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200/70">Alcaldia</button>
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button className="px-3 py-1.5 bg-white/70 text-gray-700 text-sm font-medium hover:bg-gray-50/70">Mes</button>
                  <button className="px-3 py-1.5 bg-white/70 text-gray-700 text-sm font-medium hover:bg-gray-50/70 border-l border-gray-300">Semana</button>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mb-4">
              <button onClick={handlePreviousMonth} className="p-2 hover:bg-gray-100/50 rounded-lg transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 capitalize">{format(currentDate, "MMMM yyyy", { locale: es })}</h3>
              </div>
              <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100/50 rounded-lg transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
              <div>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block w-8 h-8 border-4 border-[#47b4d8] border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-600 mt-2 font-medium">Cargando eventos...</p>
                  </div>
                ) : (
                  <CalendarGrid currentDate={currentDate} events={filteredEvents} onDateClick={handleDateClick} selectedDate={selectedDate} onAddEvent={handleAddEventFromCalendar} canEdit={canEdit} />
                )}
              </div>
              {!isFullscreen && <EventList events={selectedDateEvents} selectedDate={selectedDate} onEventClick={handleEventClick} onAddEvent={handleAddEvent} canEdit={canEdit} />}
            </div>
          </div>
          {!isFullscreen && (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 p-4 mx-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#47b4d8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Proximos Eventos
              </h3>
              <div className="space-y-2">
                {events.filter((event) => {
                  const eventDate = parseISO(event.date.split('T')[0])
                  const tomorrow = addDays(new Date(), 1)
                  const tomorrowStr = format(tomorrow, 'yyyy-MM-dd')
                  const eventDateStr = format(eventDate, 'yyyy-MM-dd')
                  return eventDateStr === tomorrowStr
                }).sort((a, b) => a.start_time.localeCompare(b.start_time)).slice(0, 5).map((event) => (
                  <div key={event.id} onClick={() => handleEventClick(event)} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50/50 cursor-pointer border border-gray-100 transition-all hover:shadow-md">
                    <div className="w-1 h-12 rounded-full" style={{ backgroundColor: event.color || "#47b4d8" }}></div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm">{event.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">{format(parseISO(event.date.split('T')[0]), "d 'de' MMMM", { locale: es })}</span>
                        <span className="text-xs text-gray-400">Ã¢â‚¬Â¢</span>
                        <span className="text-xs text-gray-500">{event.start_time}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {events.filter((event) => {
                  const eventDate = parseISO(event.date.split('T')[0])
                  const tomorrow = addDays(new Date(), 1)
                  const tomorrowStr = format(tomorrow, 'yyyy-MM-dd')
                  const eventDateStr = format(eventDate, 'yyyy-MM-dd')
                  return eventDateStr === tomorrowStr
                }).length === 0 && (
                  <p className="text-center text-gray-500 py-4 text-sm">No hay eventos para maÃ±ana</p>
                )}
              </div>
            </div>
          )}
        </>
      )}

      <ConfirmModal
        isOpen={showAddConfirm}
        onClose={() => {
          setShowAddConfirm(false)
          setDateToAdd(null)
        }}
        onConfirm={handleAddConfirm}
        title="Agregar Evento en Fecha Pasada"
        subtitle={dateToAdd ? format(dateToAdd, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es }) : ""}
        message={`Estas intentando agregar un evento en una fecha pasada (${dateToAdd ? format(dateToAdd, "d 'de' MMMM", { locale: es }) : ""}). Â¿Deseas continuar?`}
        confirmText="Si Continuar"
        cancelText="Cancelar"
        type="warning"
      />

      <EventDetailsModal 
        isOpen={detailsModalOpen} 
        onClose={() => { 
          setDetailsModalOpen(false)
          setSelectedEvent(null)
        }} 
        event={selectedEvent} 
        onEdit={handleEditFromDetails} 
        canEdit={canEdit} 
      />

      <EventModal 
        isOpen={modalOpen} 
        onClose={() => { 
          setModalOpen(false)
          setSelectedEvent(null)
          setSelectedDate(null)
        }} 
        onSave={handleSaveEvent} 
        onDelete={handleDeleteEvent} 
        event={selectedEvent} 
        selectedDate={selectedDate} 
        units={units} 
      />

      <PrintModal 
        isOpen={printModalOpen} 
        onClose={() => setPrintModalOpen(false)} 
        currentDate={currentDate} 
        events={events}
        units={units}
        selectedUnitId={selectedUnitId}
      />
    </div>
  )
}