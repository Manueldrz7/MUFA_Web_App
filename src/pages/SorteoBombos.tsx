import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMufaStore } from "../store/useMufaStore";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import ModalPartidos from "../components/ModalPartidos";
import ModalBeneficios from "../components/ModalBeneficios";

/**
 * Componente principal del sorteo MUFA.
 * Controla la asignación de equipos, visualización de retos, partidas y beneficios.
 */
export default function SorteoBombos() {
  const {
    jugadores,
    torneo,
    terminarTorneo,
    bombos,
    resultados,
    retos,
    setBombos,
    setResultados,
    actualizarRetoEstado,
  } = useMufaStore();

  const [activo, setActivo] = useState(0);
  const [mensaje, setMensaje] = useState("");
  const [sorteoFinalizado, setSorteoFinalizado] = useState(false);
  const [modalPartidos, setModalPartidos] = useState(false);
  const [modalBeneficios, setModalBeneficios] = useState(false);
  const [confirmarTerminar, setConfirmarTerminar] = useState(false);
  const [modalExito, setModalExito] = useState(false);

  // Nuevo estado para la modal del sorteo
  const [modalSorteo, setModalSorteo] = useState(false);
  const [equipoSorteado, setEquipoSorteado] = useState<string | null>(null);
  const [jugadorSorteo, setJugadorSorteo] = useState<string | null>(null);

  const navigate = useNavigate();

  // ──────────────────────────────────────────────────────────────
  // Inicializa los bombos si aún no existen
  useEffect(() => {
    if (!torneo) return;
    if (Object.keys(bombos).length === 0) {
      const letras = ["A", "B", "C", "D"];
      const nuevosBombos: { [key: string]: string[] } = {};
      letras.forEach((letra) => {
        nuevosBombos[letra] = Array.from({ length: 9 }, (_, i) => `${letra}${i + 1}`);
      });
      setBombos(nuevosBombos);
    }
  }, [torneo, bombos, setBombos]);

  // ──────────────────────────────────────────────────────────────
  // Detecta si todos los jugadores ya tienen equipos asignados
  useEffect(() => {
    if (!torneo) return;
    const jugadoresCompletos = jugadores.every((j) => {
      const eqJugador = resultados[j.nombre] || [];
      return eqJugador.length >= torneo.equiposPorJugador;
    });
    if (jugadoresCompletos && jugadores.length > 0) {
      setSorteoFinalizado(true);
      setMensaje("Todos los jugadores tienen sus equipos.");
    }
  }, [resultados, torneo, jugadores]);

  // ──────────────────────────────────────────────────────────────
  // Sortea un equipo aleatorio de los bombos para el jugador actual
  const sortear = () => {
    if (!torneo) return setMensaje("No hay torneo configurado.");

    const jugador = jugadores[activo];
    if (!jugador) return;

    // Si el jugador tiene activo el beneficio de repetir sorteo
    if (jugador.puedeRepetirEquipo) {
      setMensaje(`${jugador.nombre} puede repetir su sorteo si no le gusta el equipo.`);
      useMufaStore.setState({
        jugadores: jugadores.map((j) =>
          j.nombre === jugador.nombre ? { ...j, puedeRepetirEquipo: false } : j
        ),
      });
    }

    const equiposJugador = resultados[jugador.nombre] || [];
    if (equiposJugador.length >= torneo.equiposPorJugador) {
      setActivo((prev) => (prev + 1 < jugadores.length ? prev + 1 : 0));
      setMensaje(`${jugador.nombre} ya completó sus equipos.`);
      return;
    }

    const letrasDisponibles = Object.keys(bombos).filter((b) => bombos[b].length > 0);
    if (letrasDisponibles.length === 0) {
      setMensaje("Sorteo completado.");
      setSorteoFinalizado(true);
      return;
    }

    const bomboAleatorio = letrasDisponibles[Math.floor(Math.random() * letrasDisponibles.length)];
    const equiposDisponibles = bombos[bomboAleatorio];
    const equipoAleatorio = equiposDisponibles[Math.floor(Math.random() * equiposDisponibles.length)];

    // Efecto visual
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });

    // Mostrar modal con el resultado antes de avanzar
    setEquipoSorteado(equipoAleatorio);
    setJugadorSorteo(jugador.nombre);
    setModalSorteo(true);

    // Guardar el resultado en el estado global
    setResultados({
      ...resultados,
      [jugador.nombre]: [...(resultados[jugador.nombre] || []), equipoAleatorio],
    });

    setBombos({
      ...bombos,
      [bomboAleatorio]: bombos[bomboAleatorio].filter((e) => e !== equipoAleatorio),
    });
  };

  // ──────────────────────────────────────────────────────────────
  // Finaliza el torneo con confirmación y mensaje de éxito
  const handleTerminarTorneo = () => {
    setConfirmarTerminar(false);
    terminarTorneo();
    setModalExito(true);
    setTimeout(() => {
      setModalExito(false);
      navigate("/configuracion");
    }, 2000);
  };

  // ──────────────────────────────────────────────────────────────
  // Render principal
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-blue-950 text-white px-4 sm:px-6 py-6 flex flex-col items-center">
      <h1 className="text-3xl sm:text-4xl font-bold text-blue-400 mb-6 text-center">
        Sorteo MUFA
      </h1>

      {mensaje && <p className="mb-4 text-yellow-400 text-center px-2">{mensaje}</p>}

      {/* ─────────── Bombos visibles mientras el sorteo no finaliza ─────────── */}
      {!sorteoFinalizado && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10 w-full max-w-6xl">
            {Object.keys(bombos).map((bombo) => (
              <div key={bombo} className="bg-gray-800 rounded-xl p-4 flex flex-col items-center shadow-lg">
                <h2 className="text-xl sm:text-2xl font-bold mb-3">Bombo {bombo}</h2>
                <div className="grid grid-cols-3 gap-2">
                  {bombos[bombo].map((eq) => (
                    <motion.div
                      key={eq}
                      whileHover={{ scale: 1.1 }}
                      className="bg-blue-600 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full text-sm shadow-md"
                    >
                      ⚽
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center mb-6 text-center">
            <h2 className="text-lg sm:text-xl mb-2 text-gray-300">
              Jugador actual:{" "}
              <span className="text-blue-400 font-bold">
                {jugadores[activo]?.nombre || "-"}
              </span>
            </h2>
            <button
              onClick={sortear}
              className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg text-lg font-semibold transition"
            >
              Sortear Esfera
            </button>
          </div>
        </>
      )}

      {/* ─────────── Tabla de equipos sorteados ─────────── */}
      <div className="w-full max-w-3xl bg-gray-800 rounded-lg p-4 mt-6 overflow-x-auto">
        <h3 className="text-xl sm:text-2xl mb-4 text-center font-semibold">
          Equipos Sorteados
        </h3>
        <table className="w-full text-center border-collapse min-w-[500px]">
          <thead>
            <tr>
              <th className="border-b border-gray-600 py-2">Jugador</th>
              <th className="border-b border-gray-600 py-2">Equipos</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(resultados).map(([jugador, equipos]) => (
              <tr key={jugador}>
                <td className="py-2 border-b border-gray-700">{jugador}</td>
                <td className="py-2 border-b border-gray-700">
                  <div className="flex flex-wrap gap-2 justify-center">
                    {equipos.map((eq, idx) => (
                      <input
                        key={idx}
                        value={eq}
                        onChange={(e) => {
                          const nuevoValor = e.target.value;
                          setResultados({
                            ...resultados,
                            [jugador]: resultados[jugador].map((item, i) =>
                              i === idx ? nuevoValor : item
                            ),
                          });
                        }}
                        className="bg-gray-700 text-white rounded-md px-2 py-1 w-20 sm:w-24 text-center border border-gray-600 focus:border-blue-400 focus:outline-none"
                      />
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ─────────── Tabla de retos actuales ─────────── */}
      {retos.length > 0 && (
        <div className="w-full max-w-3xl bg-gray-800 rounded-lg p-4 mt-10 overflow-x-auto">
          <h3 className="text-xl sm:text-2xl mb-4 text-center font-semibold">
            Retos Actuales
          </h3>

          <div
            className="max-h-96 overflow-y-auto custom-scrollbar"
            style={{ scrollbarWidth: "thin", scrollbarColor: "#4b5563 #1f2937" }}
          >
            <table className="w-full text-center border-collapse min-w-[600px]">
              <thead>
                <tr>
                  <th className="border-b border-gray-600 py-2">Jugador</th>
                  <th className="border-b border-gray-600 py-2">Reto</th>
                  <th className="border-b border-gray-600 py-2">Dificultad</th>
                  <th className="border-b border-gray-600 py-2">Estado</th>
                  <th className="border-b border-gray-600 py-2">Monedas</th>
                </tr>
              </thead>
              <tbody>
                {retos.map((r) => {
                  const jugador = jugadores.find((j) => j.nombre === r.jugador);

                  return (
                    <tr key={r.id}>
                      {/* 🧩 Columna de jugador con beneficios activos */}
                      <td className="py-2 border-b border-gray-700">
                        <div className="flex flex-col items-center">
                          <span className="font-semibold text-blue-300">{r.jugador}</span>

                          {/* 🎯 Animación de beneficios activos */}
                          <AnimatePresence>
                            {jugador && (
                              <motion.div
                                className="flex flex-wrap justify-center gap-1 mt-1"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                              >
                                {jugador.multiplicadorFacil && (
                                  <motion.span
                                    key="multiplicadorFacil"
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-yellow-400 text-black px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                  >
                                    ⚡ Doble monedas (reto fácil)
                                  </motion.span>
                                )}

                                {jugador.multiplicadorActivo && (
                                  <motion.span
                                    key="multiplicadorActivo"
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-yellow-300 text-black px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                  >
                                    💰 Doble monedas (siguiente reto)
                                  </motion.span>
                                )}

                                {jugador.paseDoradoActivo && (
                                  <motion.span
                                    key="paseDoradoActivo"
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-amber-400 text-black px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                  >
                                    🏆 Pase Dorado
                                  </motion.span>
                                )}

                                {jugador.saltarSiguienteReto && (
                                  <motion.span
                                    key="saltarSiguienteReto"
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-blue-400 text-black px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                  >
                                    ⏭ Saltar siguiente reto
                                  </motion.span>
                                )}

                                {jugador.bloquearRetosDificiles && (
                                  <motion.span
                                    key="bloquearRetosDificiles"
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-red-400 text-black px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                  >
                                    🚫 Bloquear reto difícil
                                  </motion.span>
                                )}

                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </td>

                      {/* Descripción del reto */}
                      <td className="py-2 border-b border-gray-700">{r.descripcion}</td>

                      {/* Dificultad */}
                      <td className="py-2 border-b border-gray-700 capitalize">
                        {r.dificultad}
                      </td>

                      {/* Estado */}
                      <td className="py-2 border-b border-gray-700">
                        {r.cumplido ? (
                          <span className="text-green-400 font-semibold">Cumplido</span>
                        ) : r.fallido ? (
                          <span className="text-red-400 font-semibold">No cumplido</span>
                        ) : (
                          <div className="flex flex-wrap justify-center gap-2">
                            <button
                              onClick={() => actualizarRetoEstado(r.id, "cumplido")}
                              className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm sm:text-base"
                            >
                              Cumplido
                            </button>
                            <button
                              onClick={() => actualizarRetoEstado(r.id, "no_cumplido")}
                              className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm sm:text-base"
                            >
                              No cumplido
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Monedas */}
                      <td className="py-2 border-b border-gray-700 text-yellow-400 font-semibold">
                        {r.monedas}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {/* ─────────── Botones finales ─────────── */}
      <div className="flex flex-wrap justify-center gap-3 mt-10">
        <button onClick={() => navigate("/")} className="bg-gray-700 hover:bg-gray-600 px-5 py-2 rounded-lg">
          Volver
        </button>
        <button onClick={() => setModalPartidos(true)} className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg">
          Partidos
        </button>
        <button onClick={() => navigate("/tienda")} className="bg-purple-600 hover:bg-purple-700 px-5 py-2 rounded-lg">
          Tienda
        </button>
        <button onClick={() => setModalBeneficios(true)} className="bg-yellow-600 hover:bg-yellow-700 px-5 py-2 rounded-lg">
          Beneficios
        </button>
        <button onClick={() => setConfirmarTerminar(true)} className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-lg">
          Terminar Torneo
        </button>
      </div>

      {/* ─────────── Modales ─────────── */}
      <ModalPartidos visible={modalPartidos} onClose={() => setModalPartidos(false)} />
      <ModalBeneficios visible={modalBeneficios} onClose={() => setModalBeneficios(false)} />

      {/* Modal del sorteo */}
      <AnimatePresence>
        {modalSorteo && (
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
              <h2 className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-3">
                ¡Equipo Sorteado!
              </h2>
              <p className="text-lg sm:text-xl mb-2">
                <span className="text-blue-400 font-semibold">{jugadorSorteo}</span> obtuvo:
              </p>
              <p className="text-3xl sm:text-4xl text-green-400 font-extrabold mb-6">
                {equipoSorteado}
              </p>
              <button
                onClick={() => {
                  setModalSorteo(false);
                  setActivo((prev) => (prev + 1 < jugadores.length ? prev + 1 : 0));
                }}
                className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg text-lg font-semibold"
              >
                Continuar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de confirmación */}
      <AnimatePresence>
        {confirmarTerminar && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white text-gray-900 rounded-2xl p-6 w-80 text-center shadow-2xl"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <h3 className="text-xl font-bold mb-4">¿Terminar torneo?</h3>
              <p className="text-gray-600 mb-6 text-sm">
                Los jugadores y beneficios se conservarán.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleTerminarTorneo}
                  className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded-lg text-white font-semibold"
                >
                  Sí
                </button>
                <button
                  onClick={() => setConfirmarTerminar(false)}
                  className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-lg text-white font-semibold"
                >
                  No
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de éxito */}
      <AnimatePresence>
        {modalExito && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white text-gray-900 rounded-2xl p-6 w-80 text-center shadow-2xl"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <h3 className="text-xl font-bold mb-2 text-green-700">
                ¡Torneo finalizado!
              </h3>
              <p className="text-gray-600 text-sm">
                Redirigiendo a configuración...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
