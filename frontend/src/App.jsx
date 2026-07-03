import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import DashboardLayout from "./components/DashboardLayout";
import DashboardInicio from "./pages/DashboardInicio";
import Clientes from "./pages/Clientes";
import Trabajos from "./pages/Trabajos";
import Inventario from "./pages/Inventario";
import Finanzas from "./pages/Finanzas";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      {/* Rutas Privadas*/}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Vista por defecto al entrar a /dashboard */}
        <Route index element={<DashboardInicio />} />

        {/* Ruta de los módulos */}
        <Route path="clientes" element={<Clientes />} />
        <Route path="trabajos" element={<Trabajos />} />
        <Route path="inventario" element={<Inventario />} />

        {/* CORRECCIÓN AQUÍ: quitamos la barra "/" antes de finanzas */}
        <Route path="finanzas" element={<Finanzas />} />
      </Route>

      {/* Ruta 404: Si escriben una URL que no existe, los manda al login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
