import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ConfiguracionInicial from "./pages/ConfiguracionInicial";
import SorteoBombos from "./pages/SorteoBombos";
import TiendaMUFA from "./pages/TiendaMUFA";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-gray-950 to-blue-950 text-white">
        <Routes>
          {/* 🏁 Pantalla principal de configuración del torneo */}
          <Route path="/" element={<ConfiguracionInicial />} />

          {/* ⚽ Sorteo de bombos y gestión del torneo */}
          <Route path="/sorteo" element={<SorteoBombos />} />

          {/* 🏪 Tienda MUFA con beneficios y ruleta */}
          <Route path="/tienda" element={<TiendaMUFA />} />

          {/* 🔁 Redirección por defecto */}
          <Route path="*" element={<ConfiguracionInicial />} />
        </Routes>
      </div>
    </Router>
  );
}
