"use client"

import { useState } from "react"
import useAuthStore from "../store/authStore"
import UnitsManager from "../components/Admin/UnitsManager"
import UsersManager from "../components/Admin/UsersManager"

export default function Admin() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState(user?.role === "SUPERADMIN" ? "units" : "users")

  return (
    <div className="px-1 lg:px-2 xl:px-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
        <p className="text-gray-600 mt-1">
          {user?.role === "SUPERADMIN" ? "Gestión completa de unidades y usuarios" : "Gestión de usuarios de tu unidad"}
        </p>
      </div>

      {/* Tabs con colores oficiales */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          {user?.role === "SUPERADMIN" && (
            <button
              onClick={() => setActiveTab("units")}
              className={`px-4 py-2 border-b-2 font-medium transition-colors ${
                activeTab === "units"
                  ? "border-[#47b4d8] text-[#47b4d8]"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              Unidades Municipales
            </button>
          )}
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 border-b-2 font-medium transition-colors ${
              activeTab === "users"
                ? "border-[#47b4d8] text-[#47b4d8]"
                : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
            }`}
          >
            Usuarios
          </button>
        </nav>
      </div>

      {/* Content */}
      <div>{activeTab === "units" ? <UnitsManager /> : <UsersManager />}</div>
    </div>
  )
}