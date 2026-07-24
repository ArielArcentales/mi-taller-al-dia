import { useState } from "react";
import { Search, Filter, ChevronDown, Loader2, Package } from "lucide-react";
import TarjetaInventario from "./TarjetaInventario";

const DirectorioInventario = ({
  inventarioFiltrado,
  cargandoLista,
  busqueda,
  onBusqueda,
  filtroCategoria,
  setFiltroCategoria,
  categoriasTaller,
  idEdicion,
  onAbrirAjuste,
  onVerHistorial,
  onEditar,
  onArchivar,
}) => {
  const [showFiltro, setShowFiltro] = useState(false);

  return (
    <div className="xl:col-span-2 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col h-full min-h-0">
      <header className="shrink-0 flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
        <h3 className="text-3xl font-black text-slate-800">Materiales</h3>

        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar insumo"
              value={busqueda}
              onChange={onBusqueda}
              className="w-full pl-11 pr-4 py-2.5 text-sm border-2 border-slate-200 rounded-xl focus:border-taller-500 outline-none bg-slate-50 transition-all font-bold text-slate-700"
            />
          </div>

          <div className="relative shrink-0 sm:w-52">
            <button
              onClick={() => setShowFiltro(!showFiltro)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-slate-200 rounded-xl outline-none text-left font-bold bg-slate-50 flex items-center justify-between"
            >
              <span className="flex items-center gap-2 truncate text-slate-700">
                <Filter
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <span className="truncate">
                  {filtroCategoria || "Categorías"}
                </span>
              </span>
              <ChevronDown size={16} className="text-slate-400 shrink-0" />
            </button>

            {showFiltro && (
              <div className="absolute right-0 top-full mt-1 w-full bg-white border-2 border-slate-200 rounded-xl shadow-2xl z-50 flex flex-col max-h-56 overflow-y-auto custom-scrollbar">
                <button
                  onClick={() => {
                    setFiltroCategoria("");
                    setShowFiltro(false);
                  }}
                  className="w-full p-3 hover:bg-slate-50 text-left font-black text-slate-800 text-xs border-b border-slate-100"
                >
                  Todas las categorías
                </button>
                {categoriasTaller.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setFiltroCategoria(cat);
                      setShowFiltro(false);
                    }}
                    className="w-full p-3 hover:bg-slate-50 text-left font-bold text-slate-600 text-xs border-b border-slate-50 last:border-0"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {cargandoLista ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 min-h-[300px]">
            <Loader2 className="animate-spin mb-3" size={40} />
            <p className="text-lg font-bold">Cargando inventario...</p>
          </div>
        ) : inventarioFiltrado.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center min-h-[300px] py-10">
            <div className="p-5 bg-slate-100 rounded-full mb-3">
              <Package size={44} className="text-slate-300" />
            </div>
            <p className="text-xl font-black text-slate-500 mb-1">
              No se encontraron materiales
            </p>
            <p className="text-sm text-slate-400">
              Usa el formulario para registrar uno nuevo.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {inventarioFiltrado.map((item) => (
              <TarjetaInventario
                key={item.id_producto}
                item={item}
                idEdicion={idEdicion}
                onAbrirAjuste={onAbrirAjuste}
                onVerHistorial={onVerHistorial}
                onEditar={onEditar}
                onArchivar={onArchivar}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectorioInventario;
