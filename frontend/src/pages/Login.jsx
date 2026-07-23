import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import PantallaCarga from "../components/comunes/PantallaCarga";
import FormularioLogin from "../components/usuarios/FormularioLogin";
import ModalRecuperarClave from "../components/usuarios/ModalRecuperarClave"; // <-- Nuevo import

import foto1 from "../assets/images/foto1.png";
import foto2 from "../assets/images/foto2.png";
import foto3 from "../assets/images/foto3.png";

const Login = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false); // <-- Estado del modal

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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) =>
        prevSlide === slides.length - 1 ? 0 : prevSlide + 1,
      );
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const manejarCambio = (e) => {
    setCredenciales({ ...credenciales, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!credenciales.usuario.trim() || !credenciales.password.trim()) {
      setErrorMsg("Por favor, completa tu usuario y contraseña.");
      return;
    }

    setIsLoading(true);

    try {
      const respuesta = await axiosClient.post("/usuarios/login", {
        username: credenciales.usuario,
        password: credenciales.password,
      });

      localStorage.setItem("token", respuesta.data.token);
      localStorage.setItem("usuario", JSON.stringify(respuesta.data.usuario));

      setIsLoading(false);
      navigate("/dashboard");
    } catch (error) {
      setIsLoading(false);

      if (error.response) {
        if ([401, 400, 404].includes(error.response.status)) {
          setErrorMsg(
            error.response.data.mensaje || "Usuario o contraseña incorrectos.",
          );
        } else {
          setErrorMsg(
            "Error interno del servidor. Revisa la consola del backend.",
          );
        }
      } else if (error.request) {
        setErrorMsg("Error al conectar con el servidor");
      } else {
        setErrorMsg("Ocurrió un error inesperado. Inténtalo de nuevo.");
      }
    }
  };

  return (
    <>
      {isLoading && <PantallaCarga texto="Validando credenciales..." />}

      <div className="min-h-screen w-screen flex items-center justify-center p-4 md:p-8 bg-slate-200">
        <div className="bg-white w-full h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-slate-100">
          <FormularioLogin
            credenciales={credenciales}
            isLoading={isLoading}
            errorMsg={errorMsg}
            showPassword={showPassword}
            onCambio={manejarCambio}
            onSubmit={handleSubmit}
            onTogglePassword={() => setShowPassword(!showPassword)}
            onForgotPassword={() => setShowRecoveryModal(true)} // <-- Abre el modal
          />

          <div className="hidden lg:flex w-[45%] bg-slate-900 relative overflow-hidden">
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
                  className="absolute inset-0 w-full h-full object-cover object-center scale-105"
                />
                <div className="absolute inset-0 z-10 p-12 xl:p-16 flex flex-col justify-end items-center text-center">
                  <h3 className="text-white text-3xl xl:text-4xl font-dm italic mb-8 leading-tight drop-shadow-xl max-w-lg">
                    {slide.texto}
                  </h3>
                </div>
              </div>
            ))}

            <div className="absolute bottom-10 left-0 right-0 z-20 flex justify-center space-x-3 pointer-events-auto">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-3 rounded-full transition-all duration-500 cursor-pointer shadow-lg ${
                    index === currentSlide ? "w-14 bg-white" : "w-3 bg-white/40"
                  }`}
                  aria-label={`Ir a diapositiva ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Condicional para renderizar el modal de recuperación */}
      {showRecoveryModal && (
        <ModalRecuperarClave onClose={() => setShowRecoveryModal(false)} />
      )}
    </>
  );
};

export default Login;
