import { Search, Loader2, User } from "lucide-react";
import TarjetaCliente from "./TarjetaCliente";

const DirectorioClientes = ({
  clientes,
  busqueda,
  cargandoLista,
  modoEdicion,
  onBusqueda,
  onVerDetalle,
}) => {
  return (
    <div className="xl:col-span-7 bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border-2 border-slate-100 flex flex-col h-full min-h-0">
      <header className="shrink-0 flex flex-col xl:flex-row xl:items-center justify-between gap-5 mb-8">
        <h3 className="text-3xl lg:text-4xl font-black text-slate-800">
          Directorio
        </h3>
        <div className="relative w-full .xl:w-[350px]">
          <Search
            className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
            size={24}
          />
          <input
            type="text"
            placeholder="Buscar por nombre o celular..."
            value={busqueda}
            onChange={onBusqueda}
            className="w-full pl-14 pr-5 py-4 text-lg border-2 border-slate-200 rounded-2xl focus:border-taller-500 outline-none bg-slate-50 transition-all font-medium text-slate-700"
          />
        </div>
      </header>

      {/* Este contenedor es la magia del scroll encapsulado */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-3 pb-2">
        {cargandoLista ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4 .min-h-[300px]">
            <Loader2 className="animate-spin text-taller-500" size={48} />
            <p className="text-xl font-bold">Cargando directorio</p>
          </div>
        ) : clientes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2 text-center .min-h-[300px]">
            <div className="p-6 bg-slate-100 rounded-full mb-2">
              <User size={48} className="text-slate-300" />
            </div>
            <p className="text-2xl font-black text-slate-500">
              No se encontraron clientes
            </p>
            <p className="text-lg font-medium mt-1">
              Usa el formulario para registrar uno nuevo.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {clientes.map((cliente) => (
              <TarjetaCliente
                key={cliente.id_cliente}
                cliente={cliente}
                modoEdicion={modoEdicion}
                onVerDetalle={onVerDetalle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectorioClientes;
