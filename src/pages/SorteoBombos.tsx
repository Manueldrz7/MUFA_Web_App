import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMufaStore } from "../store/useMufaStore";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import ModalPartidos from "../components/ModalPartidos";
import ModalBeneficios from "../components/ModalBeneficios";

export default function SorteoBombos() {
  const {
    jugadores,
    torneo,
    reiniciarTorneo,
    bombos,
    resultados,
    retos,
    setBombos,
    setResultados,
    actualizarRetoEstado,
  } = useMufaStore();

  const [activo, setActivo] = useState(0);
  const [mensaje, setMensaje] = useState("");
  const [esferaVisible, setEsferaVisible] = useState(false);
  const [resultadoActual, setResultadoActual] = useState<{ jugador: string; equipo: string } | null>(null);
  const [sorteoFinalizado, setSorteoFinalizado] = useState(false);

  // Modales
  const [modalPartidos, setModalPartidos] = useState(false);
  const [modalBeneficios, setModalBeneficios] = useState(false);

  const navigate = useNavigate();

  // ✅ Inicializar bombos
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
  }, [torneo]);

  // ✅ Detectar sorteo completado
  useEffect(() => {
    if (!torneo) return;
    const jugadoresCompletos = jugadores.every((j) => {
      const eqJugador = resultados[j.nombre] || [];
      return eqJugador.length >= torneo.equiposPorJugador;
    });
    if (jugadoresCompletos && jugadores.length > 0) {
      setSorteoFinalizado(true);
      setMensaje("🎊 ¡Todos los jugadores tienen sus equipos!");
    }
  }, [resultados, torneo, jugadores]);

  // ✳️ Sortear equipos
  const sortear = () => {
    if (!torneo) return setMensaje("⚠️ No hay torneo configurado.");

    const jugador = jugadores[activo];
    if (!jugador) return;

    const equiposJugador = resultados[jugador.nombre] || [];
    if (equiposJugador.length >= torneo.equiposPorJugador) {
      setActivo((prev) => (prev + 1 < jugadores.length ? prev + 1 : 0));
      setMensaje(`✅ ${jugador.nombre} ya completó sus equipos.`);
      return;
    }

    const letrasDisponibles = Object.keys(bombos).filter((b) => bombos[b].length > 0);
    if (letrasDisponibles.length === 0) {
      setMensaje("🎉 ¡Sorteo completado!");
      setSorteoFinalizado(true);
      return;
    }

    const bomboAleatorio =
      letrasDisponibles[Math.floor(Math.random() * letrasDisponibles.length)];
    const equiposDisponibles = bombos[bomboAleatorio];
    const equipoAleatorio =
      equiposDisponibles[Math.floor(Math.random() * equiposDisponibles.length)];

    setEsferaVisible(true);
    setResultadoActual({ jugador: jugador.nombre, equipo: equipoAleatorio });

    confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });

    setTimeout(() => {
      setResultados({
        ...resultados,
        [jugador.nombre]: [...(resultados[jugador.nombre] || []), equipoAleatorio],
      });

      setBombos({
        ...bombos,
        [bomboAleatorio]: bombos[bomboAleatorio].filter((e) => e !== equipoAleatorio),
      });

      setActivo((prev) => (prev + 1 < jugadores.length ? prev + 1 : 0));
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-blue-950 text-white p-6 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-blue-400 mb-6">🏆 Sorteo MUFA</h1>

      {mensaje && <p className="mb-4 text-yellow-400">{mensaje}</p>}

      {/* Bombos visibles hasta que finalice el sorteo */}
      {!sorteoFinalizado && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-10">
            {Object.keys(bombos).map((bombo) => (
              <div key={bombo} className="bg-gray-800 rounded-xl p-4 flex flex-col items-center shadow-lg">
                <h2 className="text-2xl font-bold mb-3">Bombo {bombo}</h2>
                <div className="grid grid-cols-3 gap-2">
                  {bombos[bombo].map((eq) => (
                    <motion.div key={eq} whileHover={{ scale: 1.1 }} className="bg-blue-600 w-10 h-10 flex items-center justify-center rounded-full text-sm shadow-md">
                      ⚽
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center mb-6">
            <h2 className="text-xl mb-2 text-gray-300">
              Jugador actual:{" "}
              <span className="text-blue-400 font-bold">{jugadores[activo]?.nombre || "-"}</span>
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

      {/* 📋 Pizarra de Equipos */}
      <div className="w-full max-w-3xl bg-gray-800 rounded-lg p-4 mt-6">
        <h3 className="text-2xl mb-4 text-center font-semibold">📋 Equipos Sorteados</h3>
        <table className="w-full text-center border-collapse">
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
                        className="bg-gray-700 text-white rounded-md px-2 py-1 w-24 text-center border border-gray-600 focus:border-blue-400 focus:outline-none"
                      />
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🎯 Grid de Retos (solo si hay) */}
      {retos.length > 0 && (
        <div className="w-full max-w-3xl bg-gray-800 rounded-lg p-4 mt-10">
          <h3 className="text-2xl mb-4 text-center font-semibold">🎯 Retos Actuales</h3>
          <table className="w-full text-center border-collapse">
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
              {retos.map((r) => (
                <tr key={r.id}>
                  <td className="py-2 border-b border-gray-700">{r.jugador}</td>
                  <td className="py-2 border-b border-gray-700">{r.descripcion}</td>
                  <td className="py-2 border-b border-gray-700 capitalize">{r.dificultad}</td>
                  <td className="py-2 border-b border-gray-700">
                    {r.cumplido ? (
                      <span className="text-green-400 font-semibold">Cumplido</span>
                    ) : r.fallido ? (
                      <span className="text-red-400 font-semibold">No cumplido</span>
                    ) : (
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => actualizarRetoEstado(r.id, "cumplido")}
                          className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded"
                        >
                          ✅ Cumplido
                        </button>
                        <button
                          onClick={() => actualizarRetoEstado(r.id, "no_cumplido")}
                          className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
                        >
                          ❌ No cumplido
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="py-2 border-b border-gray-700 text-yellow-400 font-semibold">
                    {r.monedas}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Botones finales */}
      <div className="flex gap-4 mt-10">
        <button onClick={() => navigate("/")} className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg">
          Volver
        </button>
        <button onClick={() => setModalPartidos(true)} className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg">
          ⚽ Partidos
        </button>
        <button onClick={() => navigate("/tienda")} className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg">
          🛍️ Tienda
        </button>
        <button onClick={() => setModalBeneficios(true)} className="bg-yellow-600 hover:bg-yellow-700 px-6 py-2 rounded-lg">
          🎁 Beneficios
        </button>
        <button onClick={reiniciarTorneo} className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg">
          Reiniciar
        </button>
      </div>

      {/* Modal sorteo de partidos y beneficios */}
      <ModalPartidos visible={modalPartidos} onClose={() => setModalPartidos(false)} />
      <ModalBeneficios visible={modalBeneficios} onClose={() => setModalBeneficios(false)} />

      {/* Modal animación esfera */}
      <AnimatePresence>
        {esferaVisible && resultadoActual && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEsferaVisible(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 text-white rounded-2xl p-8 shadow-2xl flex flex-col items-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 10 }}
            >
              <motion.div
                className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-4xl mb-4"
                animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
              >
                ⚽
              </motion.div>
              <h2 className="text-2xl font-bold text-blue-400 mb-2">{resultadoActual.jugador}</h2>
              <p className="text-lg mb-4">
                obtuvo el equipo <span className="text-yellow-400 text-xl">{resultadoActual.equipo}</span> 🎉
              </p>
              <button
                onClick={() => setEsferaVisible(false)}
                className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg"
              >
                Continuar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
