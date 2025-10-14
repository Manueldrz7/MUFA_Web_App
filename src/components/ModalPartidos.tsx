import { useState } from "react";
import { useMufaStore } from "../store/useMufaStore";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { RETOS_FC } from "../data/retosFC";
import { v4 as uuidv4 } from "uuid";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function ModalPartidos({ visible, onClose }: Props) {
  const { jugadores, agregarPartido, agregarReto } = useMufaStore();
  const [modo, setModo] = useState<"jugador" | "cpu" | null>(null);
  const [jugadorActivo, setJugadorActivo] = useState("");
  const [contrincante, setContrincante] = useState("");
  const [resultado, setResultado] = useState<string | null>(null);
  const [animando, setAnimando] = useState(false);

  if (!visible) return null;

  const iniciarMiniSorteo = () => {
    if (!jugadorActivo) return alert("Selecciona primero al jugador activo");

    const restantes = jugadores.filter((j) => j.nombre !== jugadorActivo);
    if (restantes.length < 2) return alert("Se necesitan 3 jugadores mínimos");

    setAnimando(true);

    const opciones = [
      `${restantes[0].nombre} controla CPU`,
      `${restantes[1].nombre} controla CPU`,
      `🔥 Dupla MUFA (${restantes[0].nombre} + ${restantes[1].nombre})`,
    ];
    const resultadoAleatorio =
      opciones[Math.floor(Math.random() * opciones.length)];

    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#FFD700", "#1E90FF", "#00FF7F", "#FF69B4"],
    });

    setTimeout(() => {
      setResultado(resultadoAleatorio);
      agregarPartido({
        modo: "cpu",
        jugadorActivo,
        resultado: resultadoAleatorio,
      });
      setAnimando(false);
    }, 2000);
  };

  const cerrarConRetos = () => {
    if (modo === "cpu" && jugadorActivo) {
      const dificultadAleatoria = ["fácil", "medio", "difícil"][
        Math.floor(Math.random() * 3)
      ] as "fácil" | "medio" | "difícil";
      const descripcion =
        RETOS_FC[dificultadAleatoria][
          Math.floor(Math.random() * RETOS_FC[dificultadAleatoria].length)
        ];
      agregarReto({
        id: uuidv4(),
        jugador: jugadorActivo,
        descripcion,
        dificultad: dificultadAleatoria,
        cumplido: false,
        fallido: false,
        monedas:
          dificultadAleatoria === "fácil"
            ? 1
            : dificultadAleatoria === "medio"
            ? 2
            : 3,
      });
    }

    if (modo === "jugador" && jugadorActivo && contrincante) {
      const dif1 = ["fácil", "medio", "difícil"][
        Math.floor(Math.random() * 3)
      ] as "fácil" | "medio" | "difícil";
      const dif2 = ["fácil", "medio", "difícil"][
        Math.floor(Math.random() * 3)
      ] as "fácil" | "medio" | "difícil";
      const reto1 =
        RETOS_FC[dif1][Math.floor(Math.random() * RETOS_FC[dif1].length)];
      const reto2 =
        RETOS_FC[dif2][Math.floor(Math.random() * RETOS_FC[dif2].length)];

      agregarReto({
        id: uuidv4(),
        jugador: jugadorActivo,
        descripcion: reto1,
        dificultad: dif1,
        cumplido: false,
        fallido: false,
        monedas: dif1 === "fácil" ? 1 : dif1 === "medio" ? 2 : 3,
      });

      agregarReto({
        id: uuidv4(),
        jugador: contrincante,
        descripcion: reto2,
        dificultad: dif2,
        cumplido: false,
        fallido: false,
        monedas: dif2 === "fácil" ? 1 : dif2 === "medio" ? 2 : 3,
      });
    }

    setModo(null);
    setJugadorActivo("");
    setContrincante("");
    setResultado(null);
    onClose();
  };

  const guardarPartidoJugador = () => {
    if (!jugadorActivo || !contrincante)
      return alert("Selecciona ambos jugadores");

    agregarPartido({
      modo: "jugador",
      jugadorActivo,
      contrincante,
    });

    cerrarConRetos();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose} // clic fuera cierra
        >
          <motion.div
            onClick={(e) => e.stopPropagation()} // clic dentro NO cierra
            className="bg-gray-900 rounded-2xl p-8 w-full max-w-md text-white shadow-2xl"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
          >
            <h2 className="text-2xl font-bold mb-4 text-center text-blue-400">
              ⚽ Nuevo Partido MUFA
            </h2>

            <div className="flex justify-center gap-3 mb-5">
              <button
                onClick={() => setModo("jugador")}
                className={`px-5 py-2 rounded-lg font-semibold ${
                  modo === "jugador" ? "bg-green-600" : "bg-gray-700"
                }`}
              >
                👥 Jugador vs Jugador
              </button>
              <button
                onClick={() => setModo("cpu")}
                className={`px-5 py-2 rounded-lg font-semibold ${
                  modo === "cpu" ? "bg-blue-600" : "bg-gray-700"
                }`}
              >
                🤖 Jugador vs CPU
              </button>
            </div>

            {modo && (
              <div className="space-y-3 mb-5">
                <select
                  value={jugadorActivo}
                  onChange={(e) => setJugadorActivo(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 rounded-md border border-gray-600 focus:border-blue-400 outline-none"
                >
                  <option value="">-- Jugador activo --</option>
                  {jugadores.map((j) => (
                    <option key={j.nombre} value={j.nombre}>
                      {j.nombre}
                    </option>
                  ))}
                </select>

                {modo === "jugador" && (
                  <select
                    value={contrincante}
                    onChange={(e) => setContrincante(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 rounded-md border border-gray-600 focus:border-blue-400 outline-none"
                  >
                    <option value="">-- Contrincante --</option>
                    {jugadores
                      .filter((j) => j.nombre !== jugadorActivo)
                      .map((j) => (
                        <option key={j.nombre} value={j.nombre}>
                          {j.nombre}
                        </option>
                      ))}
                  </select>
                )}
              </div>
            )}

            {modo === "cpu" && (
              <div className="text-center mb-5">
                <button
                  disabled={animando}
                  onClick={iniciarMiniSorteo}
                  className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-semibold"
                >
                  🎲 Mini Sorteo CPU
                </button>
              </div>
            )}

            {resultado && (
              <p className="text-center text-yellow-400 text-lg font-semibold">
                🎉 {resultado}
              </p>
            )}

            <div className="flex justify-between mt-6">
              <button
                onClick={cerrarConRetos}
                className="bg-gray-700 hover:bg-gray-600 px-5 py-2 rounded-lg"
              >
                Cerrar
              </button>

              {modo === "jugador" && (
                <button
                  onClick={guardarPartidoJugador}
                  className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded-lg"
                >
                  Guardar Partido
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
