import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, LayoutDashboard } from "lucide-react";
import PantallaCarga from "../components/PantallaCarga";

const Dashboard = () => {
  const navigate = useNavigate();

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const usuarioInfo = JSON.parse(localStorage.getItem("usuario")) || {
    username: "Empleado",
  };

  const manejarCierreSesion = async () => {
    setIsLoggingOut(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    localStorage.removeItem("token");
    localStorage.removeItem("usuario");

    navigate("/login");
  };

  return (
    <>
      {}
      {isLoggingOut && <PantallaCarga texto="Cerrando sesión" />}

      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-taller-100 rounded-full text-taller-950">
              <LayoutDashboard size={48} />
            </div>
          </div>

          <h1 className="text-3xl font-black text-slate-800 mb-2">
            ¡Bienvenido!
          </h1>
          <p className="text-lg text-slate-600 mb-8 font-medium">
            Sesión iniciada como:{" "}
            <span className="text-taller-700 font-bold">
              {usuarioInfo.username}
            </span>
          </p>

          <button
            onClick={manejarCierreSesion}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white text-xl font-bold py-4 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            <LogOut size={24} />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
