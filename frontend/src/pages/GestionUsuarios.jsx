import { useState, useEffect, useCallback } from "react";
import axiosClient from "../api/axiosClient";
import {
  ShieldAlert,
  Users,
  UserPlus,
  Edit,
  Trash2,
  Power,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Lock,
  KeyRound,
} from "lucide-react";

const GestionUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mantenimientoActivo, setMantenimientoActivo] = useState(false);

  const [idEdicion, setIdEdicion] = useState(null);
  const [formulario, setFormulario] = useState({
    username: "",
    password: "",
    rol: "operativo",
  });
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  const recargarUsuarios = useCallback(async () => {
    try {
      const res = await axiosClient.get("/usuarios");
      setUsuarios(res.data || []);
    } catch (e) {
      console.error("Error al recargar usuarios:", e);
    }
  }, []);

  useEffect(() => {
    const inicializarPanel = async () => {
      try {
        const [resUsuarios, resMant] = await Promise.all([
          axiosClient.get("/usuarios"),
          axiosClient.get("/usuarios/mantenimiento"),
        ]);
        setUsuarios(resUsuarios.data || []);
        setMantenimientoActivo(resMant.data?.modo_mantenimiento || false);
      } catch (e) {
        console.error("Error al inicializar el panel:", e);
      } finally {
        setCargando(false);
      }
    };
    inicializarPanel();
  }, []);
  const manejarCambio = (e) =>
    setFormulario({ ...formulario, [e.target.name]: e.target.value });

  const alternarMantenimiento = async () => {
    try {
      const nuevoEstado = !mantenimientoActivo;
      await axiosClient.post("/usuarios/mantenimiento", {
        estado: nuevoEstado,
      });

      setMantenimientoActivo(nuevoEstado);
      setMensaje({
        texto: `Mantenimiento ${nuevoEstado ? "ACTIVADO" : "DESACTIVADO"}`,
        tipo: nuevoEstado ? "error" : "exito",
      });
      setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3000);
    } catch (e) {
      console.error("Error al cambiar estado de mantenimiento:", e);
      alert("Error al cambiar estado");
    }
  };

  const guardarUsuario = async (e) => {
    e.preventDefault();
    if (!formulario.username || (!idEdicion && !formulario.password)) {
      return setMensaje({ texto: "Faltan datos", tipo: "error" });
    }
    setGuardando(true);
    try {
      if (idEdicion) {
        await axiosClient.put(`/usuarios/${idEdicion}`, {
          username: formulario.username,
          rol: formulario.rol,
        });
      } else {
        await axiosClient.post("/usuarios", formulario);
      }

      setIdEdicion(null);
      setFormulario({ username: "", password: "", rol: "operativo" });
      recargarUsuarios();
      setMensaje({ texto: "Éxito", tipo: "exito" });
    } catch (err) {
      console.error("Error al guardar el usuario:", err);
      setMensaje({
        texto: err.response?.data?.mensaje || "Error",
        tipo: "error",
      });
    } finally {
      setGuardando(false);
      setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3000);
    }
  };

  const iniciarEdicion = (u) => {
    setIdEdicion(u.id_usuario);
    setFormulario({ username: u.username, password: "", rol: u.rol });
  };

  const eliminarUsuario = async (id) => {
    if (!window.confirm("¿Eliminar usuario?")) return;
    try {
      await axiosClient.delete(`/usuarios/${id}`);
      recargarUsuarios();
    } catch (e) {
      console.error("Error al eliminar el usuario:", e);
      alert("Error al eliminar");
    }
  };

  if (cargando)
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin text-indigo-500" size={60} />
      </div>
    );

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-80px)] w-full relative z-0 pb-6 overflow-hidden">
      <div className="shrink-0 pt-2 flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black text-slate-800 flex items-center gap-3">
            <ShieldAlert className="text-indigo-600" size={40} /> Gestión de
            Accesos
          </h2>
          <p className="text-xl text-slate-600 mt-2">
            Panel exclusivo para Super Administradores
          </p>
        </div>
      </div>

      {mensaje.texto && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 font-bold ${mensaje.tipo === "exito" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
        >
          {mensaje.tipo === "exito" ? <CheckCircle2 /> : <AlertCircle />}{" "}
          {mensaje.texto}
        </div>
      )}

      {/* TARJETA MANTENIMIENTO */}
      <div
        className={`p-6 rounded-[2.5rem] border-4 flex justify-between items-center transition-all ${mantenimientoActivo ? "bg-red-50 border-red-200" : "bg-white border-slate-100"}`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`p-4 rounded-full ${mantenimientoActivo ? "bg-red-200 text-red-700 animate-pulse" : "bg-slate-100 text-slate-400"}`}
          >
            {mantenimientoActivo ? <Lock size={32} /> : <Power size={32} />}
          </div>
          <div>
            <h3
              className={`text-2xl font-black ${mantenimientoActivo ? "text-red-800" : "text-slate-800"}`}
            >
              {mantenimientoActivo ? "¡Sistema Bloqueado!" : "Sistema en Línea"}
            </h3>
          </div>
        </div>
        <button
          onClick={alternarMantenimiento}
          className={`px-8 py-4 rounded-2xl font-black text-white flex items-center gap-2 ${mantenimientoActivo ? "bg-red-600" : "bg-slate-800"}`}
        >
          <Power />{" "}
          {mantenimientoActivo
            ? "Desactivar Mantenimiento"
            : "Activar Mantenimiento"}
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
        {/* FORMULARIO */}
        <div className="col-span-4 bg-white p-6 rounded-[2.5rem] border-2 border-slate-100 flex flex-col">
          <h3 className="text-2xl font-black mb-6 flex items-center gap-2">
            <UserPlus className="text-indigo-500" />{" "}
            {idEdicion ? "Editar Cuenta" : "Nueva Cuenta"}
          </h3>
          <form
            onSubmit={guardarUsuario}
            className="flex-1 flex flex-col gap-4"
          >
            <div>
              <label className="font-bold text-sm ml-1">Usuario</label>
              <div className="relative mt-1">
                <Users
                  className="absolute left-4 top-3 text-slate-400"
                  size={20}
                />
                <input
                  type="text"
                  name="username"
                  value={formulario.username}
                  onChange={manejarCambio}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            {!idEdicion && (
              <div>
                <label className="font-bold text-sm ml-1">Contraseña</label>
                <div className="relative mt-1">
                  <KeyRound
                    className="absolute left-4 top-3 text-slate-400"
                    size={20}
                  />
                  <input
                    type="password"
                    name="password"
                    value={formulario.password}
                    onChange={manejarCambio}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}
            <div>
              <label className="font-bold text-sm ml-1">Rol</label>
              <select
                name="rol"
                value={formulario.rol}
                onChange={manejarCambio}
                className="w-full px-4 py-3 mt-1 bg-slate-50 border-2 border-slate-200 rounded-2xl font-bold outline-none focus:border-indigo-500"
              >
                <option value="operativo">Operativo</option>
                <option value="admin">Administrador</option>
                <option value="superadmin">SuperAdmin</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={guardando}
              className="mt-auto py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl"
            >
              {guardando ? "Guardando..." : "Guardar Usuario"}
            </button>
          </form>
        </div>

        {/* LISTA */}
        <div className="col-span-8 bg-white p-6 rounded-[2.5rem] border-2 border-slate-100 flex flex-col overflow-hidden">
          <h3 className="text-2xl font-black mb-6">Cuentas Activas</h3>
          <div className="overflow-y-auto space-y-4 pr-2">
            {usuarios.map((u) => (
              <div
                key={u.id_usuario}
                className="p-4 border-2 border-slate-100 rounded-2xl flex justify-between items-center"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-600">
                    {u.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-black text-lg">{u.username}</p>
                    <p className="text-sm font-bold text-slate-400 uppercase">
                      {u.rol}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => iniciarEdicion(u)}
                    className="px-4 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-xl"
                  >
                    <Edit size={18} />
                  </button>
                  {u.rol !== "superadmin" && (
                    <button
                      onClick={() => eliminarUsuario(u.id_usuario)}
                      className="px-4 py-2 bg-red-50 text-red-600 font-bold rounded-xl"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GestionUsuarios;
