import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import useAuthStore from "./store/authStore"
import useInactivityLogout from "./store/useInactivityLogout"
import ProtectedRoute from "./components/ProtectedRoute"
import Layout from "./components/Layout"

// ✅ Lazy loading de páginas para mejor performance
const Login = lazy(() => import("./pages/Login"))
const Calendar = lazy(() => import("./pages/Calendar"))
const Admin = lazy(() => import("./pages/Admin"))

// Componente de carga
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#47b4d8] mx-auto mb-4"></div>
      <p className="text-gray-600 font-medium">Cargando...</p>
    </div>
  </div>
)

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  
  // Hook para cerrar sesión automáticamente después de 4 horas de inactividad
  // Redirige directamente al login sin mostrar modal
  useInactivityLogout(4 * 60 * 60 * 1000); // 4 horas en milisegundos

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} 
          />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Calendar />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["SUPERADMIN", "UNITADMIN"]}>
                <Layout>
                  <Admin />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App