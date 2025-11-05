"use client"

export default function ConfirmDeleteModal({ isOpen, onClose, onConfirm, eventTitle }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[20000] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all font-['Poppins']">
        {/* ✅ Cabecera con gradiente de colores institucionales (morados) */}
        <div className="bg-gradient-to-br from-[#341A67] via-[#584291] to-[#5842B8] p-6 text-center relative overflow-hidden">
          {/* Decoración de fondo */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-4 right-4 w-32 h-32 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-4 left-4 w-24 h-24 bg-[#47B4D8] rounded-full blur-2xl"></div>
          </div>
          
          {/* Icono de advertencia */}
          <div className="relative mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-xl border-4 border-[#47B4D8]">
            <svg className="w-12 h-12 text-[#341A67]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h3 className="relative text-2xl font-bold text-white drop-shadow-lg">¿Eliminar Evento?</h3>
        </div>

        {/* Contenido */}
        <div className="p-6">
          <p className="text-gray-700 text-center mb-3 font-medium text-base">
            ¿Estás seguro de que deseas eliminar este evento?
          </p>
          
          {eventTitle && (
            <div className="bg-gradient-to-br from-[#A8DAED]/20 via-[#47B4D8]/15 to-[#009ED0]/10 border-2 border-[#47B4D8] rounded-xl p-4 mb-4 shadow-sm">
              <p className="text-xs uppercase tracking-wider text-[#584291] text-center mb-2 font-semibold">Evento:</p>
              <p className="font-bold text-[#341A67] text-center text-lg leading-tight">{eventTitle}</p>
            </div>
          )}
          
          <div className="flex items-center justify-center gap-2 text-amber-600 bg-amber-50 rounded-lg p-3 mb-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-semibold">
              Esta acción no se puede deshacer
            </p>
          </div>
        </div>

        {/* ✅ Botones con colores institucionales */}
        <div className="flex gap-3 px-6 pb-6">
          {/* Botón Cancelar - celeste institucional */}
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-[#47B4D8] text-[#341A67] bg-white rounded-xl font-bold hover:bg-gradient-to-r hover:from-[#A8DAED]/30 hover:to-[#47B4D8]/20 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
          >
            Cancelar
          </button>
          
          {/* Botón Eliminar - gradiente morado institucional */}
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-[#341A67] via-[#584291] to-[#5842B8] text-white rounded-xl font-bold hover:from-[#584291] hover:via-[#5842B8] hover:to-[#341A67] shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}