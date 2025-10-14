import { useState } from "react";
import { useMufaStore } from "../store/useMufaStore";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useNavigate } from "react-router-dom";

// ✅ Beneficios por nivel (tipado correcto)
const beneficios: Record<number, string[]> = {
  1: [
    "Repetir tu sorteo de reto",
    "Cambiar de bombo una vez",
    "Elegir dificultad del siguiente reto",
    "Duplicar las monedas de tu siguiente reto fácil",
    "Repetir tu sorteo de equipo",
  ],
  2: [
    "Intercambiar tu equipo con otro jugador (si acepta)",
    "Elegir tu rival en la próxima ronda",
    "Saltar tu siguiente reto",
    "Duplicar las monedas del siguiente reto cumplido (de cualquier nivel)",
    "Bloquear un reto difícil para todos durante 1 ronda",
  ],
  3: [
    "Control total del sorteo personal",
    "Modificar el orden del sorteo general",
    "Pase Dorado",
    "Robar un reto fácil de otro jugador",
    "Multiplicador de 2× para 2 rondas seguidas",
    "Bloquear un jugador del siguiente sorteo",
    "Reiniciar tu sorteo completo de equipo",
    "Bono de +5 Mufa Coins instantáneo",
  ],
};

// ✅ Precios tipados correctamente
const precios: Record<number, number> = { 1: 5, 2: 10, 3: 15 };

export default function TiendaMUFA() {
  const { jugadores, setJugadores } = useMufaStore();
  const [jugadorSeleccionado, setJugadorSeleccionado] = useState("");
  const [beneficioSeleccionado, setBeneficioSeleccionado] = useState<string | null>(null);
  const [nivelSeleccionado, setNivelSeleccionado] = useState<number | null>(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [beneficioObtenido, setBeneficioObtenido] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  // ✅ Confirmar y aplicar compra
  const confirmarCompra = () => {
    if (!jugadorSeleccionado || !beneficioSeleccionado || !nivelSeleccionado) return;

    const jugador = jugadores.find((j) => j.nombre === jugadorSeleccionado);
    if (!jugador) return;

    const costo = precios[nivelSeleccionado];
    if (jugador.monedas < costo) {
      alert("No tienes suficientes Mufa Coins para este beneficio.");
      setMostrarConfirmacion(false);
      return;
    }

    const nuevosJugadores = jugadores.map((j) =>
      j.nombre === jugador.nombre
        ? {
            ...j,
            monedas: j.monedas - costo,
            beneficios: [...(j.beneficios || []), beneficioSeleccionado],
          }
        : j
    );

    setJugadores(nuevosJugadores);
    setMostrarConfirmacion(false);
    setBeneficioObtenido(beneficioSeleccionado);
    setMostrarResultado(true);

    confetti({ particleCount: 120, spread: 80, origin: { y: 0.7 } });
    setMensaje(`🎁 ${jugador.nombre} compró "${beneficioSeleccionado}"`);
  };

  // 🎯 Abrir modal de confirmación
  const abrirModalCompra = (nivel: number, beneficio: string) => {
    setNivelSeleccionado(nivel);
    setBeneficioSeleccionado(beneficio);
    setMostrarConfirmacion(true);
  };

  // 🎰 Ruleta Aleatoria (una sola para todo)
  const comprarAleatorio = () => {
    if (!jugadorSeleccionado) return alert("Selecciona un jugador primero.");
    const jugador = jugadores.find((j) => j.nombre === jugadorSeleccionado);
    if (!jugador) return;
    if (jugador.monedas < 2)
      return alert("Necesitas al menos 2 Mufa Coins para usar el aleatorio.");

    const random = Math.random();
    let nivelElegido = 1;
    if (random < 0.6) nivelElegido = 1;
    else if (random < 0.9) nivelElegido = 2;
    else nivelElegido = 3;

    const lista = beneficios[nivelElegido];
    const beneficioAleatorio = lista[Math.floor(Math.random() * lista.length)];

    const nuevosJugadores = jugadores.map((j) =>
      j.nombre === jugador.nombre
        ? {
            ...j,
            monedas: j.monedas - 2,
            beneficios: [...(j.beneficios || []), beneficioAleatorio],
          }
        : j
    );

    setJugadores(nuevosJugadores);
    setBeneficioObtenido(beneficioAleatorio);
    setMostrarResultado(true);
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.7 } });

    setMensaje(
      `🎰 ${jugador.nombre} obtuvo "${beneficioAleatorio}" (Nivel ${nivelElegido})`
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-blue-950 text-white p-8 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-yellow-400 mb-6">🏪 Tienda MUFA</h1>

      <div className="mb-6 w-full max-w-md">
        <label className="block text-lg mb-2 text-center">
          Selecciona jugador:
        </label>
        <select
          value={jugadorSeleccionado}
          onChange={(e) => setJugadorSeleccionado(e.target.value)}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-yellow-400 outline-none"
        >
          <option value="">-- Elegir jugador --</option>
          {jugadores.map((j) => (
            <option key={j.nombre} value={j.nombre}>
              {j.nombre} ({j.monedas} 🪙)
            </option>
          ))}
        </select>
      </div>

      {mensaje && (
        <p className="text-yellow-300 mb-5 font-semibold text-center">{mensaje}</p>
      )}

      {/* 🎲 Ruleta única */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={comprarAleatorio}
        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-xl font-bold text-lg shadow-lg mb-10"
      >
        🎰 Usar Aleatorio (2 Mufa Coins)
      </motion.button>

      {/* 🛍️ Lista de beneficios */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
        {[1, 2, 3].map((nivel) => (
          <motion.div
            key={nivel}
            whileHover={{ scale: 1.03 }}
            className={`rounded-2xl p-6 shadow-2xl ${
              nivel === 1
                ? "bg-green-900/70"
                : nivel === 2
                ? "bg-blue-900/70"
                : "bg-purple-900/70"
            }`}
          >
            <h2 className="text-2xl font-bold mb-4 text-center">
              {nivel === 1
                ? "Nivel 1 – Fácil"
                : nivel === 2
                ? "Nivel 2 – Medio"
                : "Nivel 3 – Difícil"}
            </h2>
            <p className="text-center text-yellow-400 mb-4 font-semibold">
              {precios[nivel]} Mufa Coins
            </p>
            <ul className="space-y-3">
              {beneficios[nivel].map((b: string, idx: number) => (
                <li
                  key={idx}
                  className="flex justify-between items-center bg-gray-800 rounded-lg px-4 py-2"
                >
                  <span>{b}</span>
                  <button
                    onClick={() => abrirModalCompra(nivel, b)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-1 rounded-lg text-sm font-semibold"
                  >
                    Comprar
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      <div className="mt-10">
        <button
          onClick={() => navigate("/sorteo")}
          className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg"
        >
          ← Volver al Sorteo
        </button>
      </div>

      {/* 🪙 Modal Confirmación de Compra */}
      <AnimatePresence>
        {mostrarConfirmacion && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-900 rounded-2xl p-8 text-white shadow-2xl w-full max-w-md text-center"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">
                ¿Deseas comprar este beneficio?
              </h2>
              <p className="mb-6 text-lg">{beneficioSeleccionado}</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setMostrarConfirmacion(false)}
                  className="bg-gray-700 hover:bg-gray-600 px-5 py-2 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarCompra}
                  className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded-lg"
                >
                  Comprar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🎉 Modal Resultado */}
      <AnimatePresence>
        {mostrarResultado && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-900 rounded-2xl p-8 text-white shadow-2xl w-full max-w-md text-center"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <h2 className="text-3xl font-bold text-yellow-400 mb-4">
                🎁 Beneficio obtenido
              </h2>
              <p className="text-xl mb-6">{beneficioObtenido}</p>
              <button
                onClick={() => setMostrarResultado(false)}
                className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg"
              >
                Aceptar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
