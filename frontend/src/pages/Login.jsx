"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import useAuthStore from "../store/authStore"
import api from "../services/api"

// Componente para las partículas flotantes (adaptadas para el nuevo fondo)
const FloatingParticles = () => {
  useEffect(() => {
    const particlesContainer = document.getElementById("particles")
    if (!particlesContainer) return

    for (let i = 0; i < 35; i++) {
      const particle = document.createElement("div")
      // Colores que combinan con el nuevo fondo
      const colors = [
        "rgba(255, 255, 255, 0.4)", 
        "rgba(168, 218, 237, 0.5)", 
        "rgba(71, 180, 216, 0.4)",
        "rgba(88, 66, 145, 0.3)"
      ]
      const size = Math.random() * 6 + 2
      
      particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        animation: floatUp ${15 + Math.random() * 15}s infinite linear;
        animation-delay: ${Math.random() * 10}s;
        box-shadow: 0 0 ${size * 2}px ${colors[Math.floor(Math.random() * colors.length)]};
      `
      particlesContainer.appendChild(particle)
    }

    return () => {
      if (particlesContainer) {
        particlesContainer.innerHTML = ""
      }
    }
  }, [])

  return <div id="particles" className="absolute w-full h-full top-0 left-0 pointer-events-none overflow-hidden" />
}

// Componente para las formas de fondo animadas (adaptadas)
const BackgroundShapes = () => (
  <>
    <div className="absolute w-full h-full overflow-hidden pointer-events-none">
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "5%",
          width: "350px",
          height: "350px",
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(168, 218, 237, 0.12))",
          borderRadius: "50%",
          filter: "blur(70px)",
          animation: "float 20s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          right: "5%",
          width: "450px",
          height: "450px",
          background: "linear-gradient(135deg, rgba(71, 180, 216, 0.12), rgba(168, 218, 237, 0.15))",
          borderRadius: "50%",
          filter: "blur(70px)",
          animation: "float 25s ease-in-out infinite",
          animationDelay: "3s",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "5%",
          left: "40%",
          width: "300px",
          height: "300px",
          background: "linear-gradient(135deg, rgba(88, 66, 145, 0.1), rgba(168, 218, 237, 0.12))",
          borderRadius: "50%",
          filter: "blur(70px)",
          animation: "float 30s ease-in-out infinite",
          animationDelay: "6s",
        }}
      />
    </div>

    {/* Corazones sutiles */}
    <div className="absolute w-full h-full overflow-hidden pointer-events-none">
      <div 
        className="heart-shape-subtle" 
        style={{ top: "15%", left: "8%", transform: "scale(0.7)" }} 
      />
      <div 
        className="heart-shape-subtle" 
        style={{ top: "55%", right: "8%", animationDelay: "4s", transform: "scale(1.3)" }} 
      />
      <div 
        className="heart-shape-subtle" 
        style={{ bottom: "15%", left: "45%", animationDelay: "8s", transform: "scale(0.5)" }} 
      />
      <div 
        className="heart-shape-subtle" 
        style={{ top: "30%", right: "30%", animationDelay: "12s", transform: "scale(0.9)" }} 
      />
    </div>

    <style jsx>{`
      @keyframes float {
        0%, 100% { transform: translate(0, 0) rotate(0deg); }
        25% { transform: translate(10px, -10px) rotate(5deg); }
        50% { transform: translate(-5px, 10px) rotate(-5deg); }
        75% { transform: translate(-10px, -5px) rotate(3deg); }
      }

      @keyframes floatUp {
        0% {
          transform: translateY(100vh) rotate(0deg);
          opacity: 0;
        }
        10% {
          opacity: 1;
        }
        90% {
          opacity: 1;
        }
        100% {
          transform: translateY(-100vh) rotate(360deg);
          opacity: 0;
        }
      }

      @keyframes heartbeat {
        0%, 100% { transform: scale(1); opacity: 0.2; }
        50% { transform: scale(1.1); opacity: 0.3; }
      }

      .heart-shape-subtle {
        position: absolute;
        width: 40px;
        height: 40px;
        animation: heartbeat 4s ease-in-out infinite;
      }

      .heart-shape-subtle::before,
      .heart-shape-subtle::after {
        content: "";
        position: absolute;
        width: 40px;
        height: 60px;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(168, 218, 237, 0.2));
        border-radius: 40px 40px 0 0;
      }

      .heart-shape-subtle::before {
        left: 20px;
        transform: rotate(-45deg);
        transform-origin: 0 100%;
      }

      .heart-shape-subtle::after {
        left: 0;
        transform: rotate(45deg);
        transform-origin: 100% 100%;
      }
    `}</style>
  </>
)

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await api.login(email, password)
      login(response.data.user, response.token)
      navigate("/")
    } catch (err) {
      setError(err.message || "Credenciales incorrectas. Por favor, intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: `url('/images/fondo3.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Overlay suave para mejorar contraste */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#a8daed]/10 via-transparent to-[#47b4d8]/10 pointer-events-none" />

      {/* Animaciones de fondo */}
      <BackgroundShapes />
      <FloatingParticles />

      <div className="w-full max-w-md relative z-10">
        {/* Formulario */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/50 p-10">
          {/* Logo dentro del formulario */}
          <div className="text-center mb-8">
            <img 
              src="/images/logo-alcaldia-yo-amo-cocha.png" 
              alt="Alcaldía de Cochabamba - Yo ❤ Cocha" 
              className="h-28 w-auto object-contain mx-auto mb-6"
            />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Sistema de Gestión Municipal
            </h1>
            <p className="text-base text-gray-600">
              Calendario de Eventos
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#47b4d8] focus:border-transparent transition-all bg-white"
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#47b4d8] focus:border-transparent transition-all bg-white"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#47b4d8] to-[#009ed0] text-white py-3 px-4 rounded-lg font-semibold hover:from-[#009ed0] hover:to-[#47b4d8] focus:outline-none focus:ring-2 focus:ring-[#47b4d8] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                <>
                  <span>Iniciar Sesión</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Footer del formulario */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Conexión segura</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-white drop-shadow-lg font-semibold">
            © 2025 Gobierno Autónomo Municipal de Cochabamba
          </p>
          <p className="text-xs text-white/90 mt-2 drop-shadow">
            Todos los derechos reservados
          </p>
        </div>
      </div>
    </div>
  )
}