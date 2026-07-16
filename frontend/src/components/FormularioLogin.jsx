import { User, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

const FormularioLogin = ({
  credenciales,
  isLoading,
  errorMsg,
  showPassword,
  onCambio,
  onSubmit,
  onTogglePassword,
  onForgotPassword, // <-- Recibe la nueva prop
}) => {
  return (
    <div className="w-full lg:w-[55%] p-8 sm:p-16 xl:p-24 flex flex-col justify-center relative z-10 bg-white">
      <div className="mb-10">
        <h2 className="text-6xl xl:text-7xl font-black text-taller-950 mb-3 tracking-tight">
          Mi Taller al Día
        </h2>
        <p className="text-taller-700 text-2xl font-medium">
          Ingresa tus datos para gestionar el taller
        </p>
      </div>

      {errorMsg && (
        <div className="mb-8 flex items-center gap-4 bg-red-50 border-2 border-red-200 text-red-700 p-5 rounded-2xl transition-all">
          <AlertCircle className="shrink-0" size={32} />
          <p className="text-xl font-bold">{errorMsg}</p>
        </div>
      )}

      <form className="space-y-10" onSubmit={onSubmit}>
        <div>
          <label className="block text-taller-950 font-black text-lg uppercase tracking-wider mb-3 ml-2">
            Usuario
          </label>
          <div className="relative group">
            <User
              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-taller-500 transition-colors"
              size={32}
            />
            <input
              type="text"
              name="usuario"
              value={credenciales.usuario}
              placeholder="Ej: admin"
              disabled={isLoading}
              className="w-full pl-16 pr-5 py-6 text-2xl border-2 border-slate-200 rounded-2xl focus:border-taller-800 focus:ring-4 focus:ring-taller-100 outline-none transition-all text-taller-950 font-bold bg-slate-50 disabled:opacity-50"
              onChange={onCambio}
            />
          </div>
        </div>

        <div>
          <label className="block text-taller-950 font-black text-lg uppercase tracking-wider mb-3 ml-2">
            Contraseña
          </label>
          <div className="relative group">
            <Lock
              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-taller-500 transition-colors"
              size={32}
            />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={credenciales.password}
              placeholder="••••••••"
              disabled={isLoading}
              className="w-full pl-16 pr-16 py-6 text-2xl border-2 border-slate-200 rounded-2xl focus:border-taller-800 focus:ring-4 focus:ring-taller-100 outline-none transition-all text-taller-950 font-bold bg-slate-50 disabled:opacity-50"
              onChange={onCambio}
            />

            <button
              type="button"
              onClick={onTogglePassword}
              disabled={isLoading}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-taller-500 transition-colors disabled:opacity-50 p-2"
            >
              {showPassword ? <EyeOff size={32} /> : <Eye size={32} />}
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 ml-2">
          <label className="flex items-center space-x-3 cursor-pointer group">
            <input
              type="checkbox"
              disabled={isLoading}
              className="w-6 h-6 rounded border-slate-300 text-taller-500 focus:ring-taller-500 disabled:opacity-50 cursor-pointer"
            />
            <span className="text-slate-600 font-bold text-xl group-hover:text-taller-950 transition-colors">
              Recordarme
            </span>
          </label>
          <button
            type="button"
            onClick={onForgotPassword} // <-- Conectado aquí
            className="text-taller-700 font-black text-xl hover:text-taller-950 transition-colors text-left"
          >
            ¿Olvidaste tu clave?
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex items-center justify-center gap-4 text-white text-3xl font-black py-6 rounded-2xl transition-all shadow-xl mt-6 
            ${
              isLoading
                ? "bg-taller-800 opacity-80 cursor-not-allowed"
                : "bg-taller-950 hover:bg-taller-900 active:scale-[0.98] shadow-taller-950/30"
            }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={36} />
              <span>Iniciando...</span>
            </>
          ) : (
            <span>Iniciar Sesión</span>
          )}
        </button>
      </form>
    </div>
  );
};

export default FormularioLogin;
