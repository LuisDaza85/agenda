"use client"

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirmar", cancelText = "Cancelar", type = "danger", subtitle = "" }) {
  if (!isOpen) return null

  const colors = {
    danger: {
      gradient: "from-red-500 to-pink-600",
      icon: "text-red-500",
      button: "from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700",
    },
    info: {
      gradient: "from-[#47b4d8] to-[#a8daed]",
      icon: "text-[#47b4d8]",
      button: "from-[#47b4d8] to-[#009ed0] hover:from-[#009ed0] hover:to-[#47b4d8]",
    },
    warning: {
      // CAMBIO: colores
      gradient: "from-[#584291] to-[#341a67]",
      icon: "text-[#584291]",
      button: "bg-gradient-to-r from-[#47b4d8] to-[#009ed0] hover:from-[#009ed0] hover:to-[#47b4d8] focus:ring-[#47b4d8]"
    }
  }

  const currentColors = colors[type] || colors.danger

  const icons = {
    danger: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    ),
    info: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    ),
    warning: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    )
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[20000] p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all">
        {/* Header con icono */}
        <div className={`bg-gradient-to-br ${currentColors.gradient} p-6 text-center`}>
          <div className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4">
            <svg className={`w-12 h-12 ${currentColors.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {icons[type]}
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white">{title}</h3>
          {subtitle && (
            <p className="text-white/90 text-sm mt-2">{subtitle}</p>
          )}
        </div>

        {/* Contenido */}
        <div className="p-6">
          <p className="text-gray-700 text-center">{message}</p>
        </div>

        {/* Botones */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-6 py-3 bg-gradient-to-r ${currentColors.button} text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}