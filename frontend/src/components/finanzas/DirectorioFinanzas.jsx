import {
  Search,
  Filter,
  ChevronDown,
  Loader2,
  FileText,
  ReceiptText,
} from "lucide-react";
import TarjetaTransaccion from "./TarjetaTransaccion";

const DirectorioFinanzas = ({
  transacciones,
  cargando,
  busqueda,
  setBusqueda,
  filtroMetodo,
  setFiltroMetodo,
  mostrarDropdownMetodo,
  setMostrarDropdownMetodo,
  formatearDinero,
  onDescargarPDF,
  // NUEVAS PROPS:
  filtroTiempo,
  fechaSeleccionada,
}) => {
  // Formatea la fecha para el título si estamos en modo calendario
  const tituloDirectorio =
    filtroTiempo === "calendario" && fechaSeleccionada
      ? `Movimientos del ${fechaSeleccionada.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}`
      : "Libro Mayor Contable";

  return (
    <div className="flex-1 bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col min-h-0 overflow-hidden">
      <header className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <ReceiptText size={28} className="text-taller-600 shrink-0" />
          {tituloDirectorio}
        </h3>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar cliente o comprobante..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 text-sm border-2 border-slate-200 rounded-xl focus:border-taller-500 outline-none bg-slate-50 transition-all font-bold text-slate-700"
            />
          </div>

          <div className="relative shrink-0 sm:w-48">
            <button
              onClick={() => setMostrarDropdownMetodo(!mostrarDropdownMetodo)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-slate-200 rounded-xl outline-none text-left font-bold bg-slate-50 flex items-center justify-between"
            >
              <span className="flex items-center gap-2 truncate text-slate-700">
                <Filter
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <span className="truncate">
                  {filtroMetodo || "Todos los pagos"}
                </span>
              </span>
              <ChevronDown size={16} className="text-slate-400 shrink-0" />
            </button>

            {mostrarDropdownMetodo && (
              <div className="absolute right-0 top-full mt-1 w-full sm:w-56 bg-white border-2 border-slate-200 rounded-xl shadow-2xl z-50 flex flex-col max-h-64 overflow-y-auto custom-scrollbar">
                <button
                  onClick={() => {
                    setFiltroMetodo("");
                    setMostrarDropdownMetodo(false);
                  }}
                  className="w-full p-3 hover:bg-slate-50 transition-colors text-left font-black text-slate-800 text-xs border-b border-slate-100"
                >
                  Todos los métodos
                </button>
                <button
                  onClick={() => {
                    setFiltroMetodo("Efectivo");
                    setMostrarDropdownMetodo(false);
                  }}
                  className="w-full p-3 hover:bg-slate-50 transition-colors text-left font-bold text-slate-600 text-xs border-b border-slate-50"
                >
                  Efectivo
                </button>
                <button
                  onClick={() => {
                    setFiltroMetodo("Transferencia");
                    setMostrarDropdownMetodo(false);
                  }}
                  className="w-full p-3 hover:bg-slate-50 transition-colors text-left font-bold text-slate-600 text-xs border-b border-slate-50"
                >
                  Transferencia
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Área de scroll contenido */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {cargando ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 .min-h-[200px]">
            <Loader2 className="animate-spin mb-3" size={40} />
            <p className="text-lg font-bold">Consolidando flujos...</p>
          </div>
        ) : transacciones.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center .min-h-[200px] py-10">
            <div className="p-5 bg-slate-100 rounded-full mb-3">
              <FileText size={44} className="text-slate-300" />
            </div>
            <p className="text-xl font-black text-slate-500 mb-1">
              No se encontraron movimientos
            </p>
            <p className="text-sm text-slate-400">
              Los cobros y anticipos registrados aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pb-2">
            {transacciones.map((tx) => (
              <TarjetaTransaccion
                key={tx.id_transaccion}
                tx={tx}
                formatearDinero={formatearDinero}
                onDescargarPDF={onDescargarPDF}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectorioFinanzas;
