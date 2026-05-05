import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import axios from "axios";
import foto1 from "../assets/images/foto1.png";
import foto2 from "../assets/images/foto2.png";
import foto3 from "../assets/images/foto3.png";

const Login = () => {
  const navigate = useNavigate();

  // Estados de la interfaz
  const [showPassword, setShowPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Estados de control de datos y peticiones
  const [credenciales, setCredenciales] = useState({
    usuario: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const slides = [
    { imagen: foto1, texto: '"Tu negocio de siempre, más fácil que nunca."' },
    {
      imagen: foto2,
      texto: '"Control de inventario y facturación al instante."',
    },
    {
      imagen: foto3,
      texto: '"Calidad en cada puntada, tradición en cada entrega."',
    },
  ];

  // Cambia la imagen del carrusel de forma automática
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) =>
        prevSlide === slides.length - 1 ? 0 : prevSlide + 1,
      );
    }, 5000);
    return () => clearInterval(timer); // Limpieza del intervalo al desmontar el componente
  }, [slides.length]);

  const manejarCambio = (e) => {
    setCredenciales({ ...credenciales, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg("");
  };

  // Función Iniciar Sesión
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    // Validación si los campos están vacíos
    if (!credenciales.usuario.trim() || !credenciales.password.trim()) {
      setErrorMsg("Por favor, completa tu usuario y contraseña.");
      return;
    }

    setIsLoading(true);

    try {
      // Petición HTTP POST al backend en Node.js
      const respuesta = await axios.post(
        "http://localhost:3000/api/usuarios/login",
        {
          username: credenciales.usuario,
          password: credenciales.password,
        },
      );

      localStorage.setItem("token", respuesta.data.token);
      localStorage.setItem("usuario", JSON.stringify(respuesta.data.usuario));

      setIsLoading(false);
      navigate("/dashboard");
    } catch (error) {
      setIsLoading(false);

      // Manejo de errores
      if (error.response) {
        // Errores controlados por la API
        if (
          error.response.status === 401 ||
          error.response.status === 400 ||
          error.response.status === 404
        ) {
          setErrorMsg(
            error.response.data.mensaje || "Usuario o contraseña incorrectos.",
          );
        } else {
          setErrorMsg(
            "Error interno del servidor. Revisa la consola del backend.",
          );
        }
      } else if (error.request) {
        setErrorMsg(
          "Error al conectar con el servidor. Asegúrate de que el backend esté corriendo.",
        );
      } else {
        setErrorMsg("Ocurrió un error inesperado. Inténtalo de nuevo.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-slate-200">
      <div className="bg-white w-full max-w-6xl h-[85vh] .min-h-[650px] rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        <div className="flex-[1.2] p-12 md:p-20 flex flex-col justify-center relative z-10 bg-white">
          <div className="mb-10">
            <h2 className="text-5xl font-black text-taller-950 mb-3 tracking-tight">
              Mi Taller al Día
            </h2>
            <p className="text-taller-700 text-xl font-medium">
              Ingresa tus datos para gestionar el taller
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 flex items-center gap-3 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl transition-all animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="text-red-500 .flex-shrink-0" size={24} />
              <p className="text-red-700 font-bold">{errorMsg}</p>
            </div>
          )}

          <form className="space-y-8" onSubmit={handleSubmit}>
            <div>
              <label className="block text-taller-950 font-bold text-sm uppercase tracking-wide mb-2 ml-1">
                Usuario
              </label>
              <div className="relative group">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-taller-500 transition-colors"
                  size={24}
                />
                <input
                  type="text"
                  name="usuario"
                  value={credenciales.usuario}
                  placeholder="Ej: victor_admin"
                  disabled={isLoading}
                  className="w-full pl-12 pr-4 py-5 text-xl border-2 border-slate-200 rounded-xl focus:border-taller-800 focus:ring-2 focus:ring-taller-100 outline-none transition-all text-taller-950 font-medium bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  onChange={manejarCambio}
                />
              </div>
            </div>

            <div>
              <label className="block text-taller-950 font-bold text-sm uppercase tracking-wide mb-2 ml-1">
                Contraseña
              </label>
              <div className="relative group">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-taller-500 transition-colors"
                  size={24}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={credenciales.password}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="w-full pl-12 pr-12 py-5 text-xl border-2 border-slate-200 rounded-xl focus:border-taller-800 focus:ring-2 focus:ring-taller-100 outline-none transition-all text-taller-950 font-medium bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  onChange={manejarCambio}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-taller-500 transition-colors disabled:opacity-50"
                >
                  {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  disabled={isLoading}
                  className="w-5 h-5 rounded border-slate-300 text-taller-500 focus:ring-taller-500 disabled:opacity-50"
                />
                <span className="text-slate-600 font-medium text-lg group-hover:text-taller-950 transition-colors">
                  Recordarme
                </span>
              </label>
              <a
                href="#"
                className="text-taller-700 font-bold text-lg hover:text-taller-950 transition-colors"
              >
                ¿Olvidaste tu clave?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-3 text-white text-2xl font-bold py-5 rounded-xl transition-all shadow-lg mt-4 
                ${
                  isLoading
                    ? "bg-taller-800 opacity-80 cursor-not-allowed"
                    : "bg-taller-950 hover:bg-taller-900 active:scale-[0.98] shadow-taller-950/20"
                }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={28} />
                  <span>Iniciando...</span>
                </>
              ) : (
                <span>Iniciar Sesión</span>
              )}
            </button>
          </form>
        </div>

        <div className="hidden lg:flex flex-1 bg-slate-900 relative overflow-hidden">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={slide.imagen}
                alt={`Slide ${index + 1}`}
                className="absolute inset-0 w-full h-full object-cover opacity-50 scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent"></div>
              <div className="absolute inset-0 z-10 p-16 flex flex-col justify-end h-full w-full">
                <h3 className="text-white text-3xl font-dm italic mb-8 leading-tight max-w-lg drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                  {slide.texto}
                </h3>
              </div>
            </div>
          ))}

          <div className="absolute bottom-16 left-16 z-20 flex space-x-2.5">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                  index === currentSlide
                    ? "w-10 bg-taller-100"
                    : "w-1.5 bg-taller-100/40 hover:bg-taller-100/70"
                }`}
                aria-label={`Ir a diapositiva ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
