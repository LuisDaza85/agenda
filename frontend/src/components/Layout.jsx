import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import useAuthStore from "../store/authStore"
import ConfirmModal from "./ui/ConfirmModal"

export default function Layout({ children }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true)
  }

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false)
    logout()
    navigate("/login")
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: `url('/images/fondo-yo-amo-cocha.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Decoración de fondo */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#47b4d8]/15 to-[#a8daed]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#009ed0]/10 to-[#47b4d8]/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      {/* Header */}
      <header className="bg-gradient-to-r from-[#47b4d8]/80 via-[#009ed0]/80 to-[#47b4d8]/80 shadow-2xl border-b-4 border-[#a8daed]/50 sticky top-0 z-0 backdrop-blur-sm w-full">
        <div className="w-full px-2 lg:px-4">
          <div className="flex justify-between items-center h-20 lg:h-24">
            
            {/* IZQUIERDA: LOGO OFICIAL + Texto + Nav */}
            <div className="flex items-center gap-3 lg:gap-6">
              <Link to="/" className="flex items-center gap-3 lg:gap-4 group">
                {/* LOGO OFICIAL COMPLETO - MÁS GRANDE */}
                <img 
                  src="/images/izquierdo.png" 
                  alt="Alcaldía de Cochabamba" 
                  className="h-14 lg:h-16 w-auto object-contain group-hover:scale-105 transition-all duration-300"
                />
                
                {/* Texto - MÁS GRANDE */}
                <div className="hidden sm:block">
                  <span className="text-xl lg:text-2xl font-bold text-white drop-shadow-lg leading-tight block">
                    CALENDARIO MUNICIPAL
                  </span>
                  <p className="text-sm lg:text-base text-white/90 font-medium leading-tight mt-0.5">
                    Gobierno Autónomo Municipal de Cochabamba
                  </p>
                </div>
              </Link>

              {/* Navegación */}
              <nav className="hidden md:flex gap-2">
                <Link
                  to="/"
                  className={`px-4 lg:px-5 py-2 lg:py-2.5 rounded-xl text-sm lg:text-base font-semibold transition-all duration-300 ${
                    isActive("/")
                      ? "bg-white text-[#47b4d8] shadow-lg scale-105"
                      : "text-white hover:bg-white/20 hover:backdrop-blur-sm hover:scale-105"
                  }`}
                >
                  Calendario
                </Link>
                {(user?.role === "SUPERADMIN" || user?.role === "UNITADMIN") && (
                  <Link
                    to="/admin"
                    className={`px-4 lg:px-5 py-2 lg:py-2.5 rounded-xl text-sm lg:text-base font-semibold transition-all duration-300 ${
                      isActive("/admin")
                        ? "bg-white text-[#47b4d8] shadow-lg scale-105"
                        : "text-white hover:bg-white/20 hover:backdrop-blur-sm hover:scale-105"
                    }`}
                  >
                    Administración
                  </Link>
                )}
              </nav>
            </div>

            {/* DERECHA: Usuario + Cerrar sesión */}
            <div className="flex items-center gap-2 lg:gap-3">
              {/* Info del usuario */}
              <div className="text-right hidden sm:block bg-white/15 backdrop-blur-md px-3 lg:px-4 py-2 rounded-xl border border-white/20">
                <p className="text-sm lg:text-base font-bold text-white leading-tight">{user?.name}</p>
                <p className="text-xs lg:text-sm text-white/80 leading-tight font-medium">
                  {(user?.role === "UNITADMIN" || user?.role === "VIEWER") && user?.unit_name ? user.unit_name : user?.role}
                </p>
              </div>

              {/* Botón cerrar sesión */}
              <button
                onClick={handleLogoutClick}
                className="bg-white text-[#47b4d8] px-5 lg:px-6 py-2 lg:py-2.5 rounded-xl text-sm lg:text-base font-bold hover:shadow-xl hover:scale-105 transition-all duration-300 hover:bg-[#a8daed] hover:text-white"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="py-6 lg:py-8 relative z-0">{children}</main>

      {/* Modal de confirmación de cierre de sesión */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogoutConfirm}
        title="¿Cerrar Sesión?"
        message="¿Estás seguro de que deseas cerrar tu sesión? Deberás iniciar sesión nuevamente para acceder al sistema."
        confirmText="Cerrar Sesión"
        cancelText="Cancelar"
        type="info"
      />
    </div>
  )
}