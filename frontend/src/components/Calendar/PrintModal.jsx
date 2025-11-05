import { useState, useEffect } from "react"
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import useAuthStore from "../../store/authStore"

export default function PrintModal({ isOpen, onClose, currentDate, events, units = [], selectedUnitId: initialSelectedUnitId = "all" }) {
  const { user } = useAuthStore()
  const [printType, setPrintType] = useState("day")
  const [startDate, setStartDate] = useState(format(currentDate, "yyyy-MM-dd"))
  const [endDate, setEndDate] = useState(format(currentDate, "yyyy-MM-dd"))
  const [selectedUnitForPrint, setSelectedUnitForPrint] = useState(initialSelectedUnitId)

  // Actualizar selectedUnitForPrint cuando cambie el filtro global
  useEffect(() => {
    setSelectedUnitForPrint(initialSelectedUnitId)
  }, [initialSelectedUnitId])

  if (!isOpen) return null

  // Función para manejar el clic en el overlay (área vacía)
  const handleOverlayClick = (e) => {
    // Solo cerrar si se hace clic directamente en el overlay
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handlePrint = () => {
    if (printType === "day" && new Date(startDate) > new Date(endDate)) {
      alert("La fecha de inicio no puede ser mayor que la fecha de fin")
      return
    }

    let filteredEvents = []
    let title = ""
    let subtitle = ""

    // Filtrar eventos primero por rango de fechas
    let eventsInRange = []
    switch (printType) {
      case "day":
        const start = parseISO(startDate)
        const end = parseISO(endDate)
        eventsInRange = events.filter((event) => {
          const eventDate = parseISO(event.date.split('T')[0])
          return isWithinInterval(eventDate, { start, end })
        })
        if (startDate === endDate) {
          subtitle = format(start, "EEEE d 'DE' MMMM 'DE' yyyy", { locale: es }).toUpperCase()
        } else {
          subtitle = `DEL ${format(start, "d 'DE' MMMM", { locale: es }).toUpperCase()} AL ${format(end, "d 'DE' MMMM 'DE' yyyy", { locale: es }).toUpperCase()}`
        }
        break

      case "week":
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
        eventsInRange = events.filter((event) => {
          const eventDate = parseISO(event.date.split('T')[0])
          return isWithinInterval(eventDate, { start: weekStart, end: weekEnd })
        })
        subtitle = `SEMANA DEL ${format(weekStart, "d 'DE' MMMM", { locale: es }).toUpperCase()} AL ${format(weekEnd, "d 'DE' MMMM 'DE' yyyy", { locale: es }).toUpperCase()}`
        break

      case "month":
        const monthStart = startOfMonth(currentDate)
        const monthEnd = endOfMonth(currentDate)
        eventsInRange = events.filter((event) => {
          const eventDate = parseISO(event.date.split('T')[0])
          return isWithinInterval(eventDate, { start: monthStart, end: monthEnd })
        })
        subtitle = format(currentDate, "MMMM 'DE' yyyy", { locale: es }).toUpperCase()
        break

      default:
        break
    }

    // Filtrar por unidad si es SUPERADMIN y no está seleccionado "all"
    if (user?.role === 'SUPERADMIN' && selectedUnitForPrint !== 'all') {
      filteredEvents = eventsInRange.filter(event => event.unit_id === parseInt(selectedUnitForPrint))
      const selectedUnit = units.find(u => u.id === parseInt(selectedUnitForPrint))
      title = `AGENDA ${selectedUnit?.name?.toUpperCase() || 'UNIDAD'}`
    } else {
      filteredEvents = eventsInRange
      // Determinar el título según el rol y el filtro
      if (user?.role === 'SUPERADMIN' && selectedUnitForPrint === 'all') {
        title = `AGENDA MUNICIPAL`
      } else {
        const unitName = user?.unit_name || "DESPACHO"
        title = `AGENDA ${unitName.toUpperCase()}`
      }
    }

    filteredEvents.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date)
      if (dateCompare !== 0) return dateCompare
      return a.start_time.localeCompare(b.start_time)
    })

    const printWindow = window.open("", "_blank")
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
          @page {
            size: 8.5in 14in;
            margin: 1.5cm 2cm;
          }

          /* === Variables de alineación === */
          :root {
            --header-h: 110px;    /* alto de la banda de logos */
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Poppins', sans-serif;
            color: #000;
            background: #fff;
            padding-top: 140px;
          }

          /* Cabecera fija con logos simétricos usando Grid */
          .doc-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            display: grid;
            grid-template-columns: 110px 1fr 110px;
            align-items: center;
            height: var(--header-h);
            padding: 0 20px;
            background: #fff;
            z-index: 10;
          }

          /* logos pegados a los extremos */
          .doc-header .logo {
            height: 90px;
            width: auto;
            object-fit: contain;
          }

          .doc-header .logo.left {
            justify-self: start;
            margin-left: -10px; /* Mueve hacia la izquierda */
          }

          .doc-header .logo.right {
            justify-self: end;
            margin-right: -10px; /* Mueve hacia la derecha */
          }

          .doc-header .spacer {
            /* Columna central vacía */
          }
          
          /* Títulos centrados debajo de la cabecera */
          .header {
            text-align: center;
            margin: 0 0 30px;
            padding: 0 20px;
          }
          
          .header h1 {
            color: #47b4d8;
            font-size: 18px;
            margin-bottom: 6px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.5px;
          }
          
          .header h2 {
            color: #47b4d8;
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          /* Contenedor de la tabla alineado con los logos */
          .table-container {
            padding: 0 20px;
          }

          .events-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 0;
            page-break-inside: auto;
          }

          .events-table thead {
            background-color: #fff;
          }

          .events-table thead tr {
            border-top: 2px solid #000;
            border-bottom: 2px solid #000;
          }
          
          .events-table th {
            padding: 10px 8px;
            text-align: center;
            font-weight: 600;
            font-size: 10px;
            text-transform: uppercase;
            border-left: 1px solid #000;
            border-right: 1px solid #000;
            letter-spacing: 0.5px;
          }

          .events-table th:first-child {
            border-left: 2px solid #000;
          }

          .events-table th:last-child {
            border-right: 2px solid #000;
          }
          
          .events-table tbody tr {
            page-break-inside: avoid;
            border-bottom: 1px solid #000;
          }

          .events-table tbody tr:last-child {
            border-bottom: 2px solid #000;
          }
          
          .events-table td {
            padding: 8px;
            font-size: 9px;
            font-weight: 400;
            vertical-align: top;
            border-left: 1px solid #000;
            border-right: 1px solid #000;
            line-height: 1.4;
          }

          .events-table td:first-child {
            border-left: 2px solid #000;
          }

          .events-table td:last-child {
            border-right: 2px solid #000;
          }

          .time-cell {
            text-align: center;
            font-weight: 600;
            width: 55px;
            white-space: nowrap;
          }

          .motive-cell {
  width: 25%;
  text-align: center;
  text-transform: uppercase;
  font-weight: 500;
  vertical-align: top;
  word-wrap: break-word;
}


          .location-cell {
  width: 25%;
  text-align: center;
  text-transform: uppercase;
  font-weight: 500;
  vertical-align: top;
  word-wrap: break-word;
}


          .organizer-cell {
  width: 25%;
  text-align: center;
  text-transform: uppercase;
  font-weight: 500;
  vertical-align: top;
  word-wrap: break-word;
}

          .attendees-cell {
  width: 25%;
  text-align: center;
  text-transform: uppercase;
  font-weight: 500;
  vertical-align: top;
  word-wrap: break-word;
}


          /* Estilos para eventos de múltiples días */
          .multi-day-dates {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
            font-size: 8px;
            color: #666;
          }
          
          .multi-day-dates span {
            font-weight: 500;
          }
          
          /* Página sin eventos */
          .no-events {
            text-align: center;
            padding: 60px 20px;
            color: #666;
          }
          
          .no-events h3 {
            font-size: 16px;
            margin-bottom: 10px;
            font-weight: 500;
          }
          
          .no-events p {
            font-size: 14px;
            font-weight: 300;
          }

          /* Evitar saltos de página dentro de fechas */
          .date-group {
            page-break-inside: avoid;
          }
          
          .date-header {
            background-color: #f0f9ff;
            padding: 12px 20px;
            margin: 20px 0 0;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            color: #47b4d8;
            border-left: 3px solid #47b4d8;
          }

          @media print {
            body {
              padding-top: 0;
              background: white;
            }
            
            .doc-header {
              position: static;
              margin-bottom: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="doc-header">
          <img  src="${window.location.origin}/images/escudo-cochabamba.png" alt="Escudo Cochabamba" class="logo left" onerror="this.style.display='none'" />
          <div class="spacer"></div>
          <img src="${window.location.origin}/images/yo-amo-cocha.png" alt="Yo ❤️ Cocha" class="logo right" onerror="this.style.display='none'" />
        </div>
        
        <div class="header">
          <h1>${title}</h1>
          <h2>${subtitle}</h2>
        </div>
        
        <div class="table-container">
          ${
            filteredEvents.length === 0
              ? `
              <div class="no-events">
                <h3>No hay eventos programados</h3>
                <p>No se encontraron eventos para el período seleccionado.</p>
              </div>
            `
              : `
              <table class="events-table">
                <thead>
                  <tr>
                    <th>HORA</th>
                    <th>MOTIVO</th>
                    <th>LUGAR</th>
                    <th>SOLICITA</th>
                    <th>ASISTENCIA</th>
                  </tr>
                </thead>
                <tbody>
                  ${filteredEvents
                    .map(
                      (event) => `
                    <tr>
                      <td class="time-cell">
                        ${event.start_time ? event.start_time.slice(0, 5) : ""}
                        ${event.end_time ? ` - ${event.end_time.slice(0, 5)}` : ""}
                      </td>
                      <td class="motive-cell">${event.title || ""}</td>
                      <td class="location-cell">${event.location || ""}</td>
                      <td class="organizer-cell">${event.organizer || ""}</td>
                      <td class="attendees-cell">${event.attendees || ""}</td>
                    </tr>
                  `,
                    )
                    .join("")}
                </tbody>
              </table>
            `
          }
        </div>
        
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `)

    printWindow.document.close()
  }

  // Calcular cantidad de eventos según el tipo de impresión y filtro de unidad seleccionados
  const getEventCount = () => {
    let eventsInRange = []
    
    if (printType === "day") {
      const start = parseISO(startDate)
      const end = parseISO(endDate)
      eventsInRange = events.filter(e => {
        const eventDate = parseISO(e.date.split('T')[0])
        return isWithinInterval(eventDate, { start, end })
      })
    } else if (printType === "week") {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
      eventsInRange = events.filter(e => {
        const eventDate = parseISO(e.date.split('T')[0])
        return isWithinInterval(eventDate, { start: weekStart, end: weekEnd })
      })
    } else if (printType === "month") {
      const monthStart = startOfMonth(currentDate)
      const monthEnd = endOfMonth(currentDate)
      eventsInRange = events.filter(e => {
        const eventDate = parseISO(e.date.split('T')[0])
        return isWithinInterval(eventDate, { start: monthStart, end: monthEnd })
      })
    }

    // Aplicar filtro de unidad si es SUPERADMIN
    if (user?.role === 'SUPERADMIN' && selectedUnitForPrint !== 'all') {
      return eventsInRange.filter(e => e.unit_id === parseInt(selectedUnitForPrint)).length
    }
    
    return eventsInRange.length
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header compacto */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#4bc5e8] to-[#47b4d8] rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Imprimir Agenda</h2>
              <p className="text-sm text-gray-600">Selecciona el tipo de impresión</p>
            </div>
          </div>
        </div>

        <div className="p-4">
          {/* Selector de Unidad para SUPERADMIN */}
          {user?.role === "SUPERADMIN" && units.length > 0 && (
            <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-[#584291]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h3 className="text-sm font-semibold text-gray-900">Filtrar por Unidad</h3>
              </div>
              <select
                value={selectedUnitForPrint}
                onChange={(e) => setSelectedUnitForPrint(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#584291] focus:border-transparent text-sm font-medium text-gray-700 bg-white"
              >
                <option value="all">Todas las Unidades</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Selector de tipo de impresión - más compacto */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <button
              onClick={() => setPrintType("day")}
              className={`py-2 px-3 rounded-lg font-medium transition-all flex flex-col items-center gap-1 ${
                printType === "day"
                  ? "bg-[#47b4d8] text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
              </svg>
              <span className="text-sm">Día</span>
            </button>

            <button
              onClick={() => setPrintType("week")}
              className={`py-2 px-3 rounded-lg font-medium transition-all flex flex-col items-center gap-1 ${
                printType === "week"
                  ? "bg-[#47b4d8] text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
              </svg>
              <span className="text-sm">Semanal</span>
            </button>

            <button
              onClick={() => setPrintType("month")}
              className={`py-2 px-3 rounded-lg font-medium transition-all flex flex-col items-center gap-1 ${
                printType === "month"
                  ? "bg-[#47b4d8] text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
              </svg>
              <span className="text-sm">Mensual</span>
            </button>
          </div>

          {/* Selector de fechas - más compacto */}
          {printType === "day" && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-[#47b4d8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-sm font-semibold text-gray-900">Seleccionar período</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Desde</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#47b4d8] focus:border-transparent text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Hasta</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#47b4d8] focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Vista previa - más compacta */}
          <div className="bg-white border-2 border-gray-200 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center gap-4 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#47b4d8] to-[#009ed0] rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-[#47b4d8]">
                  {user?.role === 'SUPERADMIN' && selectedUnitForPrint !== 'all'
                    ? `AGENDA ${units.find(u => u.id === parseInt(selectedUnitForPrint))?.name?.toUpperCase() || 'UNIDAD'}`
                    : user?.role === 'SUPERADMIN' && selectedUnitForPrint === 'all'
                    ? 'AGENDA MUNICIPAL'
                    : `AGENDA ${user?.unit_name ? user.unit_name.toUpperCase() : 'DESPACHO'}`
                  }
                </h3>
                <p className="text-sm font-medium text-gray-600">
                  {printType === "day" && startDate === endDate && format(parseISO(startDate), "d 'de' MMMM 'de' yyyy", { locale: es })}
                  {printType === "day" && startDate !== endDate && `${format(parseISO(startDate), "d MMM", { locale: es })} - ${format(parseISO(endDate), "d MMM yyyy", { locale: es })}`}
                  {printType === "week" && `Semana del ${format(startOfWeek(currentDate, { weekStartsOn: 1 }), "d", { locale: es })} al ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), "d 'de' MMMM", { locale: es })}`}
                  {printType === "month" && format(currentDate, "MMMM 'de' yyyy", { locale: es })}
                </p>
              </div>
            </div>

            {/* Contador de eventos */}
            <div className="inline-flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
              <span className="text-2xl font-bold text-[#47b4d8]">{getEventCount()}</span>
              <span className="text-sm font-medium text-gray-600">
                {getEventCount() === 1 ? 'Evento' : 'Eventos'}
              </span>
            </div>
          </div>
        </div>

        {/* Botones de acción - fijos en la parte inferior */}
        <div className="flex gap-3 justify-end px-4 py-3 bg-gray-50 rounded-b-xl border-t">
          <button
            onClick={onClose}
            className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handlePrint}
            disabled={printType === "day" && (!startDate || !endDate || new Date(startDate) > new Date(endDate))}
            className="px-5 py-2 bg-[#47b4d8] text-white rounded-lg font-medium hover:bg-[#009ed0] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir
          </button>
        </div>
      </div>
    </div>
  )
}