import {
  AlertTriangle,
  AlertCircle,
  DollarSign,
  ArrowRightLeft,
  History,
  Edit2,
  Archive,
} from "lucide-react";

// Mantenemos los colores por categoría
const obtenerColorCategoria = (categoria) => {
  const mapaColores = {
    "Suelas y Tapas": "bg-amber-100 text-amber-800 border-amber-200",
    "Pegamentos y Químicos": "bg-cyan-100 text-cyan-800 border-cyan-200",
    "Hilos y Agujas": "bg-rose-100 text-rose-800 border-rose-200",
    Plantillas: "bg-lime-100 text-lime-800 border-lime-200",
    "Cierres y Herrajes": "bg-slate-200 text-slate-800 border-slate-300",
    "Cueros y Telas": "bg-orange-100 text-orange-800 border-orange-200",
    Herramientas: "bg-blue-100 text-blue-800 border-blue-200",
    Pinturas: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200",
    Otros: "bg-gray-100 text-gray-800 border-gray-200",
  };
  return (
    mapaColores[categoria] || "bg-indigo-100 text-indigo-800 border-indigo-200"
  );
};

const TarjetaInventario = ({
  item,
  idEdicion,
  onAbrirAjuste,
  onVerHistorial,
  onEditar,
  onArchivar,
}) => {
  const cantidadActual =
    item.cantidad_actual !== undefined
      ? item.cantidad_actual
      : item.amount_actual;
  const esBajoStock = cantidadActual <= item.stock_minimo;
  const sinStock = cantidadActual === 0;
  const unidadMedida = item.unidad_medida || "Unidades";
  const estaSiendoEditado = idEdicion === item.id_producto;

  const colorCat = obtenerColorCategoria(item.categoria);

  return (
    <div
      className={`p-5 border-2 rounded-2xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 ${estaSiendoEditado ? "border-blue-300 bg-blue-50/30 shadow-md" : sinStock ? "bg-red-50/50 border-red-200" : esBajoStock ? "bg-amber-50/50 border-amber-200" : "bg-slate-50 border-slate-100 hover:bg-white hover:border-slate-300"}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          {item.categoria && (
            <span
              className={`text-[10px] uppercase tracking-wider font-black px-2.5 py-1 rounded-md shadow-sm border ${colorCat}`}
            >
              {item.categoria}
            </span>
          )}
          {sinStock ? (
            <span className="flex items-center gap-1 text-red-600 font-black text-[10px] uppercase tracking-wider bg-red-100 px-2.5 py-1 rounded-md border border-red-200">
              <AlertTriangle size={12} /> Agotado
            </span>
          ) : esBajoStock ? (
            <span className="flex items-center gap-1 text-amber-600 font-black text-[10px] uppercase tracking-wider bg-amber-100 px-2.5 py-1 rounded-md border border-amber-200">
              <AlertCircle size={12} /> Stock Bajo
            </span>
          ) : null}
        </div>

        <h4 className="text-2xl font-black text-slate-800 capitalize truncate leading-tight">
          {item.nombre}
        </h4>

        {item.precio_costo > 0 && (
          <p className="text-sm font-bold text-slate-500 flex items-center gap-1.5 mt-1.5">
            <DollarSign size={16} className="text-slate-400" /> Costo: $
            {parseFloat(item.precio_costo).toFixed(2)}
          </p>
        )}
      </div>

      <div className="flex flex-row md:flex-col justify-between items-center md:items-end gap-3 .min-w-[200px] shrink-0 border-t md:border-t-0 border-slate-200 pt-4 md:pt-0 mt-2 md:mt-0">
        <div className="text-left md:text-right">
          <div className="flex items-end md:justify-end gap-1.5">
            <p
              className={`text-4xl font-black leading-none ${sinStock ? "text-red-600" : esBajoStock ? "text-amber-600" : "text-slate-800"}`}
            >
              {cantidadActual}
            </p>
            <div className="flex flex-col text-left md:text-right">
              <span className="text-sm font-black text-slate-600 capitalize leading-none mb-0.5">
                {unidadMedida}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                MIN {item.stock_minimo}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-1.5 justify-end mt-1">
          <button
            onClick={() => onAbrirAjuste(item)}
            className="p-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl transition-colors shadow-sm flex items-center gap-1.5 font-bold text-xs"
          >
            <ArrowRightLeft size={16} /> Ajustar
          </button>
          <button
            onClick={() => onVerHistorial(item)}
            className="p-2.5 text-taller-600 bg-white border border-taller-200 hover:bg-taller-50 rounded-xl transition-colors shadow-sm"
          >
            <History size={16} />
          </button>
          <button
            onClick={() => onEditar(item)}
            className={`p-2.5 rounded-xl transition-colors shadow-sm border ${estaSiendoEditado ? "bg-blue-600 text-white border-blue-600" : "text-blue-600 bg-white border-blue-200 hover:bg-blue-50"}`}
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onArchivar(item)}
            className="p-2.5 text-slate-500 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors shadow-sm"
          >
            <Archive size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TarjetaInventario;
