import { useState } from "react";
import { useMufaStore } from "../store/useMufaStore";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useNavigate } from "react-router-dom";

/**
 * Retorna la descripción detallada de un beneficio según su nombre.
 * Las descripciones deben ser idénticas a las definidas en el store global.
 */
function obtenerDescripcionBeneficio(nombre: string): string {
  const descripciones: Record<string, string> = {
    "Repetir tu sorteo de reto": "Permite volver a sortear el reto actual una vez.",
    "Cambiar de bombo una vez": "Puedes cambiar el bombo asignado una sola vez.",
    "Elegir dificultad del siguiente reto": "Decide si el próximo reto será fácil, medio o difícil.",
    "Duplicar las monedas de tu siguiente reto fácil": "Tu siguiente reto fácil otorgará el doble de monedas.",
    "Repetir tu sorteo de equipo": "Te permite volver a sortear el equipo una vez.",
    "Ver los próximos 3 retos posibles antes del sorteo": "Muestra una vista previa de los siguientes retos.",
    "Intercambiar tu equipo con otro jugador (si acepta)": "Permite ofrecer un intercambio de equipos con otro jugador.",
    "Elegir tu rival en la próxima ronda": "Selecciona contra quién jugarás en la siguiente ronda.",
    "Saltar tu siguiente reto": "Evita recibir reto en la próxima ronda.",
    "Duplicar las monedas del siguiente reto cumplido (de cualquier nivel)":
      "Multiplica por 2 las monedas de tu siguiente reto cumplido.",
    "Bloquear un reto difícil para todos durante 1 ronda":
      "Impide que se asignen retos difíciles a todos durante una ronda.",
    "Control total del sorteo personal": "Te permite elegir tu equipo en el sorteo personal.",
    "Modificar el orden del sorteo general": "Define el orden de los jugadores en el siguiente sorteo.",
    "Pase Dorado": "Saltas tu reto y aún así obtienes las monedas.",
    "Robar un reto fácil de otro jugador": "Toma un reto fácil de otro jugador y deja uno aleatorio.",
    "Multiplicador de 2× para 2 rondas seguidas":
      "Durante 2 rondas, todos tus retos cumplidos otorgan el doble de monedas.",
    "Bloquear un jugador del siguiente sorteo":
      "Evita que un jugador participe en el siguiente sorteo de retos.",
    "Reiniciar tu sorteo completo de equipo": "Vuelve a realizar todo tu sorteo de equipos.",
    "Bono de +5 Mufa Coins instantáneo": "Obtienes 5 Mufa Coins adicionales de forma inmediata.",
  };
  return descripciones[nombre] || "Beneficio sin descripción.";
}

/**
 * Define la lista de beneficios disponibles por nivel de dificultad.
 * Cada nivel contiene beneficios de distinta potencia y costo.
 */
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

/**
 * Define el costo de los beneficios por nivel en Mufa Coins.
 */
const precios: Record<number, number> = { 1: 5, 2: 10, 3: 15 };

/**
 * Componente principal de la Tienda MUFA.
 * Permite a los jugadores comprar beneficios con Mufa Coins,
 * tanto de forma directa (por nivel) como aleatoria.
 */
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

  /**
   * Confirma la compra de un beneficio específico según nivel.
   * Verifica el saldo del jugador y descuenta las Mufa Coins correspondientes.
   * Agrega el beneficio al inventario del jugador como objeto completo.
   */
  const confirmarCompra = () => {
    console.log("Intentando confirmar compra...");

    if (!jugadorSeleccionado) {
      alert("Selecciona un jugador antes de comprar un beneficio.");
      return;
    }

    if (!beneficioSeleccionado || !nivelSeleccionado) {
      alert("Ocurrió un error con la selección del beneficio.");
      return;
    }

    const jugador = jugadores.find((j) => j.nombre === jugadorSeleccionado);
    if (!jugador) {
      alert("Jugador no encontrado.");
      return;
    }

    const costo = precios[nivelSeleccionado];
    console.log("Costo:", costo, "Jugador:", jugador);

    if (jugador.monedas < costo) {
      alert("No tienes suficientes Mufa Coins para este beneficio.");
      setMostrarConfirmacion(false);
      return;
    }

    // Si es el beneficio especial de +5 monedas, aplicar efecto inmediato
    if (beneficioSeleccionado === "Bono de +5 Mufa Coins instantáneo") {
      const nuevosJugadores = jugadores.map((j) =>
        j.nombre === jugador.nombre
          ? { ...j, monedas: j.monedas + 5 }
          : j
      );

      setJugadores(nuevosJugadores);
      setMostrarConfirmacion(false);
      setMostrarResultado(true);
      setBeneficioObtenido(beneficioSeleccionado);
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.7 } });
      setMensaje(`${jugador.nombre} obtuvo +5 Mufa Coins`);
      return;
    }

    // Crea el nuevo beneficio como objeto completo
    const nuevoBeneficio = {
      nombre: beneficioSeleccionado,
      descripcion: obtenerDescripcionBeneficio(beneficioSeleccionado),
      usado: false,
    };

    // Actualiza el jugador correspondiente
    const nuevosJugadores = jugadores.map((j) =>
      j.nombre === jugador.nombre
        ? {
            ...j,
            monedas: j.monedas - costo,
            beneficios: [...(j.beneficios ?? []), nuevoBeneficio],
          }
        : j
    );

    // Aplica cambios y muestra resultado
    setJugadores(nuevosJugadores);
    setMostrarConfirmacion(false);
    setBeneficioObtenido(beneficioSeleccionado);
    setMostrarResultado(true);
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.7 } });
    setMensaje(`${jugador.nombre} compró "${beneficioSeleccionado}"`);
  };

  /**
   * Permite realizar una compra aleatoria con costo fijo de 2 Mufa Coins.
   * El beneficio obtenido depende de una probabilidad ponderada por nivel.
   */
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

    const nuevoBeneficio = {
      nombre: beneficioAleatorio,
      descripcion: obtenerDescripcionBeneficio(beneficioAleatorio),
      usado: false,
    };

    const nuevosJugadores = jugadores.map((j) =>
      j.nombre === jugador.nombre
        ? {
            ...j,
            monedas: j.monedas - 2,
            beneficios: [...(j.beneficios ?? []), nuevoBeneficio],
          }
        : j
    );

    setJugadores(nuevosJugadores);
    setBeneficioObtenido(beneficioAleatorio);
    setMostrarResultado(true);
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.7 } });

    setMensaje(
      `${jugador.nombre} obtuvo "${beneficioAleatorio}" (Nivel ${nivelElegido})`
    );
  };

  /**
   * Abre la ventana modal de confirmación de compra.
   * Recibe el nivel y el beneficio seleccionados.
   */
  const abrirModalCompra = (nivel: number, beneficio: string) => {
  setNivelSeleccionado(nivel);
  setBeneficioSeleccionado(beneficio);
  setTimeout(() => setMostrarConfirmacion(true), 0); 
};

  /**
   * Render principal del componente TiendaMUFA.
   * Incluye la selección de jugador, lista de beneficios por nivel,
   * y los modales de confirmación y resultado de compra.
   */
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-blue-950 text-white px-4 sm:px-6 py-8 flex flex-col items-center">
      <h1 className="text-3xl sm:text-4xl font-bold text-yellow-400 mb-6 text-center">
        Tienda MUFA
      </h1>

      {/* Selector de jugador activo */}
      <div className="mb-6 w-full max-w-md">
        <label className="block text-base sm:text-lg mb-2 text-center">
          Selecciona jugador:
        </label>
        <select
          value={jugadorSeleccionado}
          onChange={(e) => setJugadorSeleccionado(e.target.value)}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-yellow-400 outline-none text-sm sm:text-base"
        >
          <option value="">-- Elegir jugador --</option>
          {jugadores.map((j) => (
            <option key={j.nombre} value={j.nombre}>
              {j.nombre} ({j.monedas} Mufa Coins)
            </option>
          ))}
        </select>
      </div>

      {mensaje && (
        <p className="text-yellow-300 mb-5 font-semibold text-center text-sm sm:text-base px-2">
          {mensaje}
        </p>
      )}

      {/* Botón de compra aleatoria */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={comprarAleatorio}
        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-5 sm:px-6 py-3 rounded-xl font-bold text-base sm:text-lg shadow-lg mb-10 text-center"
      >
        Usar Aleatorio (2 Mufa Coins)
      </motion.button>

      {/* Listado de beneficios disponibles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl px-2">
        {[1, 2, 3].map((nivel) => (
          <motion.div
            key={nivel}
            whileHover={{ scale: 1.03 }}
            className={`rounded-2xl p-5 sm:p-6 shadow-2xl ${
              nivel === 1
                ? "bg-green-900/70"
                : nivel === 2
                ? "bg-blue-900/70"
                : "bg-purple-900/70"
            }`}
          >
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center">
              {nivel === 1
                ? "Nivel 1 – Fácil"
                : nivel === 2
                ? "Nivel 2 – Medio"
                : "Nivel 3 – Difícil"}
            </h2>
            <p className="text-center text-yellow-400 mb-4 font-semibold text-sm sm:text-base">
              {precios[nivel]} Mufa Coins
            </p>
            <ul className="space-y-3">
              {beneficios[nivel].map((b, idx) => (
                <li
                  key={idx}
                  className="flex flex-col sm:flex-row justify-between items-center bg-gray-800 rounded-lg px-3 sm:px-4 py-2 gap-2 sm:gap-0"
                >
                  <span className="text-center sm:text-left text-sm sm:text-base">{b}</span>
                  <button
                    onClick={() => abrirModalCompra(nivel, b)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-1 rounded-lg text-xs sm:text-sm font-semibold w-full sm:w-auto"
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
          className="bg-gray-700 hover:bg-gray-600 px-5 sm:px-6 py-2 rounded-lg text-sm sm:text-base"
        >
          ← Volver al Sorteo
        </button>
      </div>

      {/* Modal de confirmación de compra */}
      <AnimatePresence>
        {mostrarConfirmacion && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-900 rounded-2xl p-6 sm:p-8 text-white shadow-2xl w-full max-w-xs sm:max-w-md text-center mx-4"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <h2 className="text-xl sm:text-2xl font-bold text-yellow-400 mb-4">
                ¿Deseas comprar este beneficio?
              </h2>
              <p className="mb-6 text-sm sm:text-lg">{beneficioSeleccionado}</p>
              <p className="text-gray-400 mb-6 text-sm">
                {beneficioSeleccionado &&
                  obtenerDescripcionBeneficio(beneficioSeleccionado)}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                <button
                  onClick={() => setMostrarConfirmacion(false)}
                  className="bg-gray-700 hover:bg-gray-600 px-4 sm:px-5 py-2 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarCompra}
                  className="bg-green-600 hover:bg-green-700 px-4 sm:px-5 py-2 rounded-lg"
                >
                  Comprar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de resultado de compra */}
      <AnimatePresence>
        {mostrarResultado && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-900 rounded-2xl p-6 sm:p-8 text-white shadow-2xl w-full max-w-xs sm:max-w-md text-center mx-4"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-4">
                Beneficio obtenido
              </h2>
              <p className="text-base sm:text-xl mb-6">{beneficioObtenido}</p>
              <button
                onClick={() => setMostrarResultado(false)}
                className="bg-green-600 hover:bg-green-700 px-5 sm:px-6 py-2 rounded-lg"
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
