import { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Wrench,
  Package,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import PantallaCarga from "../components/PantallaCarga";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Estados para la interfaz
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Recuperamos el usuario activo
  const usuarioInfo = JSON.parse(localStorage.getItem("usuario")) || {
    username: "Empleado",
  };

  // Menú de navegación dinámico
  const menuNavegacion = [
    {
      ruta: "/dashboard",
      icono: <LayoutDashboard size={24} />,
      texto: "Panel Principal",
    },
    {
      ruta: "/dashboard/clientes",
      icono: <Users size={24} />,
      texto: "Clientes",
    },
    {
      ruta: "/dashboard/trabajos",
      icono: <Wrench size={24} />,
      texto: "Órdenes de Trabajo",
    },
    {
      ruta: "/dashboard/inventario",
      icono: <Package size={24} />,
      texto: "Inventario",
    },
  ];

  const manejarCierreSesion = async () => {
    setIsLoggingOut(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  return (
    <>
      {isLoggingOut && <PantallaCarga texto="Cerrando Sesión" />}

      <div className="min-h-screen bg-slate-100 flex overflow-hidden">
        {/* FONDO OSCURO PARA MÓVILES (Aparece cuando el menú está abierto) */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/50 z-20 lg:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* MENÚ LATERAL (Sidebar) */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-30 w-72 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl ${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }`}
        >
          {/* Cabecera del Sidebar */}
          <div className="p-6 flex items-center justify-between border-b border-slate-800">
            <h2 className="text-2xl font-black text-white tracking-tight">
              Mi Taller <span className="text-taller-500">al Día</span>
            </h2>
            <button
              className="lg:hidden text-slate-400 hover:text-white"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X size={28} />
            </button>
          </div>

          {/* Perfil de Usuario Rápido */}
          <div className="px-6 py-8 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-taller-600 flex items-center justify-center text-xl font-bold border-2 border-taller-400">
              {usuarioInfo.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">
                Hola,
              </p>
              <p className="text-white font-bold text-lg truncate">
                {usuarioInfo.username}
              </p>
            </div>
          </div>

          {/* Links de Navegación */}
          <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
            {menuNavegacion.map((item) => {
              // Comprobamos si la ruta actual coincide exactamente para marcarla como activa
              const isActive = location.pathname === item.ruta;

              return (
                <NavLink
                  key={item.ruta}
                  to={item.ruta}
                  onClick={() => setIsSidebarOpen(false)} // Cierra el menú en móviles al hacer clic
                  className={`flex items-center gap-4 px-4 py-4 rounded-xl font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-taller-600 text-white shadow-lg shadow-taller-900/50"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                  }`}
                >
                  {item.icono}
                  <span className="text-lg">{item.texto}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Botón de Cerrar Sesión en la parte inferior */}
          <div className="p-4 border-t border-slate-800">
            <button
              onClick={manejarCierreSesion}
              disabled={isLoggingOut}
              className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-slate-800 hover:bg-red-600/90 text-slate-300 hover:text-white rounded-xl font-bold transition-all duration-200"
            >
              <LogOut size={24} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Cabecera superior (Navbar) visible en móviles */}
          <header className="bg-white shadow-sm border-b border-slate-200 h-20 flex items-center justify-between px-4 lg:hidden shrink-0">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <Menu size={28} />
              </button>
              <h1 className="text-xl font-black text-slate-800">
                Mi Taller al Día
              </h1>
            </div>
          </header>

          {/* Área dinámica donde se inyectan las demás pantallas */}
          <div className="flex-1 overflow-auto p-6 md:p-8 bg-slate-100">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
};

export default DashboardLayout;
