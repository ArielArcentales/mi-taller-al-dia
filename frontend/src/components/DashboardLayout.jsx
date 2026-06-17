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
  ChevronLeft,
  ChevronRight,
  Store,
} from "lucide-react";
import PantallaCarga from "../components/PantallaCarga";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Estados de la interfaz
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Recuperación de información del usuario
  const usuarioInfo = JSON.parse(localStorage.getItem("usuario")) || {
    username: "Empleado",
  };

  // Configuración del menú de navegación
  const menuNavegacion = [
    {
      ruta: "/dashboard",
      icono: <LayoutDashboard size={32} />,
      texto: "Panel Principal",
    },
    {
      ruta: "/dashboard/clientes",
      icono: <Users size={32} />,
      texto: "Clientes",
    },
    {
      ruta: "/dashboard/trabajos",
      icono: <Wrench size={32} />,
      texto: "Órdenes de Trabajo",
    },
    {
      ruta: "/dashboard/inventario",
      icono: <Package size={32} />,
      texto: "Inventario",
    },
  ];

  // Función para manejar el cierre de sesión
  const manejarCierreSesion = async () => {
    setIsLoggingOut(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  return (
    <>
      {/* Pantalla de carga superpuesta al cerrar sesión */}
      {isLoggingOut && <PantallaCarga texto="Cerrando Sesión" />}

      <div className="min-h-screen bg-slate-100 flex overflow-hidden">
        {/* Fondo oscuro para dispositivos móviles al abrir el menú */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/60 z-20 lg:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* BARRA DE NAVEGACIÓN LATERAL (SIDEBAR) */}
        <aside
          className={`fixed lg:relative inset-y-0 left-0 z-30 bg-slate-900 text-white transform transition-all duration-300 ease-in-out flex flex-col shadow-[20px_0_40px_-15px_rgba(0,0,0,0.3)] .lg:rounded-br-[2rem]
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${isCollapsed ? ".lg:w-[130px] .w-[340px]" : ".w-[340px]"}`}
        >
          {/* Pestaña flotante para colapsar/desplegar el menú (Solo PC) */}
          <button
            className="hidden lg:flex absolute top-0 -right-8 items-center justify-center w-10 h-20 bg-slate-900 text-slate-400 rounded-r-2xl hover:text-white transition-colors z-50 cursor-pointer shadow-[10px_5px_15px_-5px_rgba(0,0,0,0.3)]"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Desplegar menú" : "Ocultar menú"}
          >
            <div className="pl-1">
              {isCollapsed ? (
                <ChevronRight size={24} />
              ) : (
                <ChevronLeft size={24} />
              )}
            </div>
          </button>

          {/* Cabecera del menú (Logo y botón de cierre móvil) */}
          <div
            className={`p-8 flex items-center border-b border-slate-800 relative .h-[110px] ${isCollapsed ? "justify-center" : "justify-between"}`}
          >
            {!isCollapsed ? (
              <h2 className="text-3xl font-black text-white tracking-tight whitespace-nowrap overflow-hidden">
                Mi Taller <span className="text-taller-500">al Día</span>
              </h2>
            ) : (
              <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 shadow-inner">
                <Store className="text-taller-500" size={32} />
              </div>
            )}

            <button
              className={`lg:hidden text-slate-400 hover:text-white ${!isCollapsed && "absolute right-8"}`}
              onClick={() => setIsSidebarOpen(false)}
            >
              <X size={36} />
            </button>
          </div>

          {/* Perfil de usuario rápido */}
          <div
            className={`py-10 flex items-center border-b border-slate-800/50 transition-all ${isCollapsed ? "justify-center px-4" : "px-8 gap-5"}`}
          >
            <div className="w-16 h-16 shrink-0 rounded-full bg-taller-600 flex items-center justify-center text-3xl font-black border-4 border-taller-950 shadow-inner transition-all">
              {usuarioInfo.username.charAt(0).toUpperCase()}
            </div>

            {!isCollapsed && (
              <div className="overflow-hidden whitespace-nowrap">
                <p className="text-slate-400 text-base font-bold uppercase tracking-wider mb-1">
                  Bienvenido,
                </p>
                <p className="text-white font-black text-2xl truncate">
                  {usuarioInfo.username}
                </p>
              </div>
            )}
          </div>

          {/* Enlaces de navegación principales */}
          <nav className="flex-1 py-8 space-y-4 overflow-y-auto overflow-x-hidden">
            {menuNavegacion.map((item) => {
              const isActive = location.pathname === item.ruta;

              return (
                <NavLink
                  key={item.ruta}
                  to={item.ruta}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center py-5 rounded-2xl font-bold transition-all duration-200 group 
                    ${isCollapsed ? "justify-center px-0 mx-4" : "gap-5 px-5 mx-5"} 
                    ${
                      isActive
                        ? "bg-taller-600 text-white shadow-xl shadow-taller-900/40 border-l-8 border-white"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white border-l-8 border-transparent"
                    }`}
                  title={isCollapsed ? item.texto : ""}
                >
                  <span
                    className={`${isActive ? "text-white" : "text-slate-500 group-hover:text-taller-400"} transition-colors shrink-0`}
                  >
                    {item.icono}
                  </span>

                  {!isCollapsed && (
                    <span className="text-xl tracking-wide whitespace-nowrap">
                      {item.texto}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Sección inferior: Botón de cerrar sesión */}
          <div className="p-6 pb-8 border-t border-slate-800 mt-auto">
            <button
              onClick={manejarCierreSesion}
              disabled={isLoggingOut}
              className={`w-full flex items-center py-5 bg-slate-800 hover:bg-red-500 text-slate-300 hover:text-white rounded-2xl font-black transition-all duration-200 shadow-lg
                ${isCollapsed ? "justify-center px-0" : "justify-center gap-4 px-6"}`}
              title={isCollapsed ? "Cerrar Sesión" : ""}
            >
              <LogOut size={28} className="shrink-0" />

              {!isCollapsed && (
                <span className="text-xl whitespace-nowrap">Cerrar Sesión</span>
              )}
            </button>
          </div>
        </aside>

        {/* ÁREA DE CONTENIDO PRINCIPAL */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-100 transition-all duration-300">
          {/* Barra de navegación superior (Solo visible en móviles) */}
          <header className="bg-white shadow-sm border-b border-slate-200 h-24 flex items-center justify-between px-6 lg:hidden shrink-0">
            <div className="flex items-center gap-5">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
              >
                <Menu size={32} />
              </button>
              <h1 className="text-2xl font-black text-slate-800">
                Mi Taller al Día
              </h1>
            </div>
          </header>

          {/* Contenedor dinámico de rutas (Outlet) */}
          <div className="flex-1 overflow-auto p-6 md:p-10 lg:p-12">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
};

export default DashboardLayout;
