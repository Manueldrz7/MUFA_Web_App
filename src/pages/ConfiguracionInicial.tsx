import { useState } from "react";
import { useMufaStore } from "../store/useMufaStore";
import { useNavigate } from "react-router-dom";

export default function ConfiguracionInicial() {
  const { jugadores, agregarJugador, limpiarJugadores, setTorneo } = useMufaStore();
  const [nombre, setNombre] = useState("");
  const [equiposPorJugador, setEquiposPorJugador] = useState(3);
  const navigate = useNavigate();

  const handleAgregar = () => {
    if (nombre.trim().length > 0) {
      agregarJugador(nombre);
      setNombre("");
    }
  };

  const handleIniciar = () => {
    if (jugadores.length === 0) {
      alert("⚠️ Agrega al menos un jugador para continuar.");
      return;
    }

    if (equiposPorJugador < 1) {
      alert("⚠️ Debes asignar al menos 1 equipo por jugador.");
      return;
    }

    setTorneo({
      equiposPorJugador,
      estado: "nuevo",
    });

    navigate("/sorteo");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold text-blue-400 mb-8 text-center">
        ⚽ Configuración del Torneo MUFA
      </h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Nombre del jugador"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="px-4 py-2 rounded-md text-white focus:outline-none"
        />
        <button
          onClick={handleAgregar}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-md transition"
        >
          Agregar jugador
        </button>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <label className="text-lg font-semibold">Equipos por jugador:</label>
        <input
          type="number"
          min={1}
          value={equiposPorJugador}
          onChange={(e) => setEquiposPorJugador(Number(e.target.value))}
          className="w-20 text-center text-white rounded-md py-1"
        />
      </div>

      <ul className="w-full max-w-md bg-gray-800 rounded-lg p-4 space-y-2">
        {jugadores.length === 0 ? (
          <p className="text-gray-400 text-center">Aún no hay jugadores 😅</p>
        ) : (
          jugadores.map((j) => (
            <li
              key={j.id}
              className="flex justify-between items-center bg-gray-900 px-4 py-2 rounded-md"
            >
              <span>{j.nombre}</span>
              <span className="text-yellow-400">{j.monedas} 🪙</span>
            </li>
          ))
        )}
      </ul>

      <div className="mt-8 flex gap-4">
        <button
          onClick={limpiarJugadores}
          className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-md transition"
        >
          Reiniciar jugadores
        </button>
        <button
          onClick={handleIniciar}
          className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-md transition"
        >
          Iniciar torneo
        </button>
      </div>
    </div>
  );
}
