import { useState } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Briefcase,
  FileText,
  Users,
  LogOut,
  Menu,
  UserCircle,
} from "lucide-react";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [usuario] = useState(() => {
    const usuarioGuardado = localStorage.getItem("usuario");
    return usuarioGuardado ? JSON.parse(usuarioGuardado) : {};
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  const menuItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: "/dashboard",
      roles: ["ALL"],
    },
    {
      title: "Trabajos",
      icon: <Briefcase size={20} />,
      path: "/trabajos",
      roles: ["ALL"],
    },
    {
      title: "Inventario",
      icon: <Package size={20} />,
      path: "/inventario",
      roles: ["ALL"],
    },
    {
      title: "Notas de Venta",
      icon: <FileText size={20} />,
      path: "/notas-venta",
      roles: ["ALL"],
    },
    {
      title: "Gestión Usuarios",
      icon: <Users size={20} />,
      path: "/usuarios",
      roles: ["ADMIN", "ADMINISTRADOR"],
    },
  ];

  const menuFiltrado = menuItems.filter(
    (item) =>
      item.roles.includes("ALL") ||
      item.roles.includes(usuario?.rol?.toUpperCase()),
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <aside
        className={`${isSidebarOpen ? "w-64" : "w-20"} bg-white border-r border-slate-200 transition-all duration-300 flex flex-col`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
          {isSidebarOpen && (
            <span className="font-black text-xl text-taller-950 font-dm">
              Mi Taller
            </span>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-slate-500 hover:text-taller-600 rounded-lg"
          >
            <Menu size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuFiltrado.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                location.pathname === item.path
                  ? "bg-taller-100 text-taller-900 font-bold"
                  : "text-slate-600 hover:bg-slate-100 font-medium"
              }`}
            >
              {item.icon}
              {isSidebarOpen && <span>{item.title}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-3 w-full text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-xs">
          <h1 className="text-2xl font-bold text-slate-800 font-dm">
            {menuItems.find((m) => m.path === location.pathname)?.title ||
              "Panel"}
          </h1>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800">
                {usuario.username || "Usuario"}
              </p>
              <p className="text-xs text-slate-500 font-medium capitalize">
                {usuario.rol?.toLowerCase() || "Personal"}
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-taller-200 flex items-center justify-center text-taller-800">
              <UserCircle size={28} />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
