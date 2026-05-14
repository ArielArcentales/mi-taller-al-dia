// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { AlertCircle, TrendingUp, Briefcase, Package } from "lucide-react";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Hacemos la petición a tu ruta protegida enviando el Token
        const response = await axios.get(
          "http://localhost:3000/api/dashboard",
          {
            headers: {
              Authorization: `Bearer ${token}`, // ¡La llave maestra!
            },
          },
        );

        setData(response.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar la información del panel.");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-taller-600"></div>
      </div>
    );
  if (error)
    return (
      <div className="text-red-500 font-bold bg-red-50 p-4 rounded-lg">
        {error}
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in">
      {/* TARJETAS SUPERIORES (Estilo Mockup) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Tarjeta 1: Finanzas (Inspirado en la caja naranja de tu mockup) */}
        <div className="bg-orange-400 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-orange-100 font-medium mb-1">Total Ingresos</p>
          <h3 className="text-4xl font-black">
            ${data.finanzas?.total || "0.00"}
          </h3>
          <div className="mt-4 text-sm font-medium flex items-center gap-1">
            <TrendingUp size={16} /> Registrados hoy
          </div>
        </div>

        {/* Tarjeta 2: Resumen Trabajos */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <p className="text-slate-500 font-medium mb-1">Trabajos Activos</p>
            <h3 className="text-4xl font-black text-slate-800">
              {data.resumen_trabajos?.pendientes || 0}
            </h3>
          </div>
          <div className="mt-4 flex items-center text-taller-600 text-sm font-bold gap-2">
            <Briefcase size={16} /> En proceso
          </div>
        </div>

        {/* Tarjeta 3: Trabajos Completados */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <p className="text-slate-500 font-medium mb-1">Completados (Mes)</p>
            <h3 className="text-4xl font-black text-slate-800">
              {data.resumen_trabajos?.completados || 0}
            </h3>
          </div>
          <div className="mt-4 flex items-center text-green-600 text-sm font-bold gap-2">
            Entregados al cliente
          </div>
        </div>

        {/* Tarjeta 4: Alertas Generales */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <p className="text-slate-500 font-medium mb-1">Alertas Activas</p>
            <h3 className="text-4xl font-black text-red-500">
              {(data.alertas?.trabajos_atrasados?.length || 0) +
                (data.alertas?.inventario_bajo?.length || 0)}
            </h3>
          </div>
          <div className="mt-4 flex items-center text-red-500 text-sm font-bold gap-2">
            <AlertCircle size={16} /> Requieren atención
          </div>
        </div>
      </div>

      {/* TABLAS INFERIORES (Alertas) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Tabla: Trabajos Atrasados */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4 font-dm flex items-center gap-2">
            <Briefcase className="text-orange-500" /> Trabajos Atrasados
          </h2>
          {data.alertas?.trabajos_atrasados?.length === 0 ? (
            <p className="text-slate-500 italic">
              No hay trabajos atrasados. ¡Todo al día!
            </p>
          ) : (
            <ul className="space-y-3">
              {data.alertas?.trabajos_atrasados?.map((trabajo, i) => (
                <li
                  key={i}
                  className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg border border-slate-100"
                >
                  <span className="font-medium text-slate-700">
                    {trabajo.descripcion || "Trabajo Pendiente"}
                  </span>
                  <span className="text-sm bg-red-100 text-red-700 py-1 px-3 rounded-full font-bold">
                    Urgente
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Tabla: Inventario Bajo */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4 font-dm flex items-center gap-2">
            <Package className="text-taller-500" /> Inventario Bajo
          </h2>
          {data.alertas?.inventario_bajo?.length === 0 ? (
            <p className="text-slate-500 italic">
              El inventario está abastecido.
            </p>
          ) : (
            <ul className="space-y-3">
              {data.alertas?.inventario_bajo?.map((item, i) => (
                <li
                  key={i}
                  className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg border border-slate-100"
                >
                  <span className="font-medium text-slate-700">
                    {item.nombre || "Insumo"}
                  </span>
                  <span className="text-sm font-bold text-orange-500">
                    Quedan: {item.cantidad}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
