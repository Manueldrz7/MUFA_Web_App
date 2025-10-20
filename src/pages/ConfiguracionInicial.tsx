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
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4 sm:px-6 py-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-blue-400 mb-8 text-center">
        ⚽ Configuración del Torneo MUFA
      </h1>

      {/*Formulario de jugadores */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 w-full max-w-md">
        <input
          type="text"
          placeholder="Nombre del jugador"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="px-4 py-2 rounded-md bg-gray-800 border border-gray-700 text-white focus:border-blue-400 focus:outline-none flex-1"
        />
        <button
          onClick={handleAgregar}
          className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-md font-semibold transition"
        >
          Agregar jugador
        </button>
      </div>

      {/*Configuración de equipos */}
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
        <label className="text-lg font-semibold">Equipos por jugador:</label>
        <input
          type="number"
          min={1}
          value={equiposPorJugador}
          onChange={(e) => setEquiposPorJugador(Number(e.target.value))}
          className="w-24 text-center bg-gray-800 text-white rounded-md py-1 border border-gray-700 focus:border-blue-400 focus:outline-none"
        />
      </div>

      {/*Lista de jugadores */}
      <div className="w-full max-w-md bg-gray-800 rounded-lg p-4 space-y-2 shadow-lg">
        {jugadores.length === 0 ? (
          <p className="text-gray-400 text-center">Aún no hay jugadores 😅</p>
        ) : (
          <ul className="divide-y divide-gray-700">
            {jugadores.map((j) => (
              <li
                key={j.nombre}
                className="flex justify-between items-center py-2 px-2 sm:px-4 bg-gray-900 rounded-md"
              >
                <span className="text-sm sm:text-base">{j.nombre}</span>
                <span className="text-yellow-400 text-sm sm:text-base">
                  {j.monedas} 🪙
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/*Botones de acción */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full max-w-md">
        <button
          onClick={limpiarJugadores}
          className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-md font-semibold transition text-sm sm:text-base"
        >
          Reiniciar jugadores
        </button>
        <button
          onClick={handleIniciar}
          className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-md font-semibold transition text-sm sm:text-base"
        >
          Iniciar torneo
        </button>
      </div>
    </div>
  );
}
