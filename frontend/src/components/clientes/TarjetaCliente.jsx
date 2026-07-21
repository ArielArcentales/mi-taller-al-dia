import { ChevronRight, Phone } from "lucide-react";

// Función para generar un color consistente basado en el nombre
const obtenerColorAvatar = (nombre) => {
  const colores = [
    "bg-red-100 text-red-800 border-red-200",
    "bg-blue-100 text-blue-800 border-blue-200",
    "bg-emerald-100 text-emerald-800 border-emerald-200",
    "bg-amber-100 text-amber-800 border-amber-200",
    "bg-purple-100 text-purple-800 border-purple-200",
    "bg-pink-100 text-pink-800 border-pink-200",
    "bg-teal-100 text-teal-800 border-teal-200",
    "bg-orange-100 text-orange-800 border-orange-200",
  ];
  let hash = 0;
  for (let i = 0; i < nombre.length; i++) {
    hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colores[Math.abs(hash) % colores.length];
};

const TarjetaCliente = ({ cliente, onVerDetalle, modoEdicion }) => {
  const estaSiendoEditado = modoEdicion === cliente.id_cliente;
  const colorAvatar = obtenerColorAvatar(cliente.nombre_completo || "X");

  return (
    <div
      onClick={() => onVerDetalle(cliente)}
      className={`group cursor-pointer p-5 rounded-3xl border-2 transition-all duration-200 flex items-center justify-between gap-4
        ${
          estaSiendoEditado
            ? "bg-indigo-50 border-indigo-200 shadow-sm"
            : "bg-slate-50 border-slate-100 hover:bg-white hover:border-taller-300 hover:shadow-md"
        }`}
    >
      <div className="flex items-center gap-5 overflow-hidden">
        {/* Avatar Dinámico */}
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-black shrink-0 border-2 transition-colors
          ${estaSiendoEditado ? "bg-indigo-100 text-indigo-800 border-indigo-200" : colorAvatar}`}
        >
          {cliente.nombre_completo.charAt(0).toUpperCase()}
        </div>

        <div className="overflow-hidden">
          <h4 className="text-xl font-black text-slate-800 capitalize truncate">
            {cliente.nombre_completo}
          </h4>
          <p className="text-md text-slate-500 flex items-center gap-1.5 font-medium mt-0.5">
            <Phone size={16} /> {cliente.telefono}
          </p>
        </div>
      </div>

      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0 group-hover:bg-taller-100 group-hover:text-taller-600 transition-colors">
        <ChevronRight size={24} />
      </div>
    </div>
  );
};

export default TarjetaCliente;
