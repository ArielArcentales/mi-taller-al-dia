import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
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
  DollarSign,
  ShieldAlert,
  Settings,
} from "lucide-react";
import PantallaCarga from "./PantallaCarga";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Estados de la interfaz
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mantenimientoActivo, setMantenimientoActivo] = useState(false);
  const [verificandoMantenimiento, setVerificandoMantenimiento] =
    useState(true);

  // Recuperación de información del usuario
  const usuarioInfo = JSON.parse(localStorage.getItem("usuario")) || {
    username: "Empleado",
    rol: "operativo",
  };

  useEffect(() => {
    // 1. Redirigir al Operativo si intenta entrar a la raíz del dashboard
    if (location.pathname === "/dashboard" && usuarioInfo.rol === "operativo") {
      navigate("/dashboard/trabajos", { replace: true });
    }

    // 2. Verificar estado de mantenimiento
    const verificarMantenimiento = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3000/api/usuarios/mantenimiento",
        );
        setMantenimientoActivo(res.data.modo_mantenimiento);
      } catch (error) {
        console.error("No se pudo verificar el estado del sistema", error);
      } finally {
        setVerificandoMantenimiento(false);
      }
    };

    verificarMantenimiento();
  }, [location.pathname, navigate, usuarioInfo.rol]);

  // Configuración dinámica del menú de navegación
  const menuNavegacion = [
    ...(usuarioInfo.rol !== "operativo"
      ? [
          {
            ruta: "/dashboard",
            icono: <LayoutDashboard size={32} />,
            texto: "Panel Principal",
          },
        ]
      : []),
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
    ...(usuarioInfo.rol !== "operativo"
      ? [
          {
            ruta: "/dashboard/finanzas",
            icono: <DollarSign size={32} />,
            texto: "Finanzas y Caja",
          },
        ]
      : []),
    ...(usuarioInfo?.rol === "superadmin"
      ? [
          {
            ruta: "/dashboard/usuarios",
            icono: <ShieldAlert size={32} />,
            texto: "Gestión de Accesos",
          },
        ]
      : []),
  ];

  const manejarCierreSesion = async () => {
    setIsLoggingOut(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  // ==============================================================================
  // PANTALLA DE BLOQUEO POR MANTENIMIENTO (Diseño Premium)
  // ==============================================================================
  if (
    !verificandoMantenimiento &&
    mantenimientoActivo &&
    usuarioInfo.rol !== "superadmin"
  ) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden animate-in fade-in duration-500">
        {/* Elementos decorativos de fondo tipo "glow" */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="bg-white p-8 md:p-12 rounded-[3rem] border-2 border-slate-100 shadow-2xl max-w-lg w-full flex flex-col items-center relative z-10 text-center">
          {/* Icono animado */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-75"></div>
            <div className="relative bg-indigo-50 p-6 rounded-full border-4 border-white shadow-sm text-indigo-600">
              <Settings
                size={64}
                className="animate-[spin_4s_linear_infinite]"
              />
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-4 tracking-tight">
            ¡Estamos mejorando!
          </h1>
          <p className="text-lg text-slate-500 mb-8 leading-relaxed font-medium">
            <strong className="text-slate-800">Mi Taller al Día</strong> se
            encuentra en{" "}
            <span className="text-indigo-600 font-bold">
              mantenimiento programado
            </span>
            . Estamos aplicando actualizaciones para ofrecerte una experiencia
            más rápida y segura.
          </p>

          <div className="bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 mb-8 w-full flex items-center justify-center gap-3">
            <Store className="text-slate-400" size={24} />
            <p className="text-sm text-slate-600 font-bold">
              Por favor, intenta ingresar más tarde.
            </p>
          </div>

          <button
            onClick={manejarCierreSesion}
            className="w-full py-4 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-black text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-3"
          >
            <LogOut size={24} /> Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  // ==============================================================================
  // RENDERIZADO NORMAL DEL DASHBOARD
  // ==============================================================================
  return (
    <>
      {isLoggingOut && <PantallaCarga texto="Cerrando Sesión" />}

      <div className="min-h-screen bg-slate-100 flex overflow-hidden">
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/60 z-20 lg:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* BARRA LATERAL */}
        <aside
          className={`fixed lg:relative inset-y-0 left-0 z-30 bg-slate-900 text-white transform transition-all duration-300 ease-in-out flex flex-col shadow-[20px_0_40px_-15px_rgba(0,0,0,0.3)]
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${isCollapsed ? ".lg:w-[130px] .w-[340px]" : ".w-[340px]"}`}
        >
          <button
            className="hidden lg:flex absolute top-0 -right-8 items-center justify-center w-10 h-20 bg-slate-900 text-slate-400 rounded-r-2xl hover:text-white transition-colors z-50 cursor-pointer shadow-[10px_5px_15px_-5px_rgba(0,0,0,0.3)]"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <div className="pl-1">
              {isCollapsed ? (
                <ChevronRight size={24} />
              ) : (
                <ChevronLeft size={24} />
              )}
            </div>
          </button>

          <div
            className={`p-8 flex items-center border-b border-slate-800 relative ${isCollapsed ? "justify-center" : "justify-between"}`}
          >
            {!isCollapsed ? (
              <h2 className="text-3xl font-black text-white tracking-tight whitespace-nowrap overflow-hidden">
                Mi Taller <span className="text-indigo-500">al Día</span>
              </h2>
            ) : (
              <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 shadow-inner">
                <Store className="text-indigo-500" size={32} />
              </div>
            )}
            <button
              className={`lg:hidden text-slate-400 hover:text-white ${!isCollapsed && "absolute right-8"}`}
              onClick={() => setIsSidebarOpen(false)}
            >
              <X size={36} />
            </button>
          </div>

          <div
            className={`py-10 flex items-center border-b border-slate-800/50 transition-all ${isCollapsed ? "justify-center px-4" : "px-8 gap-5"}`}
          >
            <div
              className={`w-16 h-16 shrink-0 rounded-full flex items-center justify-center text-3xl font-black border-4 shadow-inner transition-all
              ${usuarioInfo.rol === "superadmin" ? "bg-indigo-600 border-indigo-900" : "bg-slate-700 border-slate-900"}`}
            >
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
                <p
                  className={`text-xs font-bold uppercase mt-1 ${usuarioInfo.rol === "superadmin" ? "text-indigo-400" : "text-slate-400"}`}
                >
                  Rol: {usuarioInfo.rol}
                </p>
              </div>
            )}
          </div>

          <nav className="flex-1 py-8 space-y-4 overflow-y-auto custom-scrollbar">
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
                        ? "bg-slate-800 text-white shadow-xl border-l-8 border-indigo-500"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white border-l-8 border-transparent"
                    }`}
                  title={isCollapsed ? item.texto : ""}
                >
                  <span
                    className={`${isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-indigo-400"} transition-colors shrink-0`}
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

        {/* ÁREA PRINCIPAL */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-100 transition-all duration-300 relative">
          {/* Header móvil */}
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

          <div className="flex-1 overflow-auto p-4 md:p-8 lg:p-10">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
};

export default DashboardLayout;
