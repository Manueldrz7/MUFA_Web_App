import { AnimatePresence, motion } from "framer-motion";
import { useMufaStore } from "../store/useMufaStore";
import { useState } from "react";

interface Props {
  visible: boolean;
  onClose: () => void;
}

/**
 * Modal que muestra los beneficios comprados por cada jugador.
 * Permite usarlos (si no están marcados como usados) y confirma antes de aplicarlos.
 */
export default function ModalBeneficios({ visible, onClose }: Props) {
  const { jugadores, usarBeneficio, setJugadores } = useMufaStore();

  const [beneficioSeleccionado, setBeneficioSeleccionado] = useState<{
    jugador: string;
    nombre: string;
  } | null>(null);

  const [mensaje, setMensaje] = useState<string>("");

  if (!visible) return null;

  /** Ejecuta la acción de usar un beneficio */
  const confirmarUsoBeneficio = () => {
    if (!beneficioSeleccionado) return;

    const { jugador, nombre } = beneficioSeleccionado;

    // 1️⃣ Aplicar efecto del beneficio en el store (activa flags o monedas)
    usarBeneficio(jugador, nombre);

    // 2️⃣ Marcar el beneficio como usado visualmente
    const nuevosJugadores = jugadores.map((j) => {
      if (j.nombre !== jugador) return j;
      return {
        ...j,
        beneficios: (j.beneficios || []).map((b) =>
          b.nombre === nombre ? { ...b, usado: true } : b
        ),
      };
    });

    setJugadores(nuevosJugadores);

    // 3️⃣ Feedback visual
    setBeneficioSeleccionado(null);
    setMensaje(`Beneficio "${nombre}" aplicado correctamente 🎯`);

    setTimeout(() => setMensaje(""), 2500);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-gray-900 rounded-2xl p-5 sm:p-8 text-white shadow-2xl w-full max-w-3xl overflow-hidden relative"
            initial={{ scale: 0.85 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.85 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-yellow-400 text-center mb-6">
              🎁 Beneficios comprados
            </h2>

            {/* Mensaje de confirmación */}
            {mensaje && (
              <p className="text-green-400 text-center mb-4 text-sm sm:text-base">
                {mensaje}
              </p>
            )}

            {jugadores.length === 0 ? (
              <p className="text-gray-400 text-center text-sm sm:text-base">
                No hay jugadores registrados.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse min-w-[650px]">
                  <thead>
                    <tr>
                      {jugadores.map((j) => (
                        <th
                          key={j.nombre}
                          className="border-b border-gray-600 py-2 px-3 sm:px-4 text-sm sm:text-base"
                        >
                          {j.nombre}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {jugadores.map((j) => (
                        <td
                          key={j.nombre}
                          className="py-3 border-b border-gray-700 align-top"
                        >
                          {j.beneficios && j.beneficios.length > 0 ? (
                            <ul className="space-y-2">
                              {j.beneficios
                                .filter((b) => !b.usado)
                                .map((b, idx) => (
                                  <li
                                    key={idx}
                                    className="bg-gray-800 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm flex flex-col items-center"
                                  >
                                    <span className="font-semibold text-yellow-300 mb-1 text-center">
                                      {b.nombre}
                                    </span>
                                    <span className="text-gray-400 text-[11px] sm:text-xs mb-2 text-center">
                                      {b.descripcion}
                                    </span>
                                    <button
                                      onClick={() =>
                                        setBeneficioSeleccionado({
                                          jugador: j.nombre,
                                          nombre: b.nombre,
                                        })
                                      }
                                      className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs font-medium transition"
                                    >
                                      Usar
                                    </button>
                                  </li>
                                ))}
                              {j.beneficios.filter((b) => !b.usado).length === 0 && (
                                <li className="text-gray-500 text-xs sm:text-sm">
                                  Sin beneficios activos
                                </li>
                              )}
                            </ul>
                          ) : (
                            <span className="text-gray-500 text-xs sm:text-sm">
                              Sin beneficios
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            <div className="text-center mt-6">
              <button
                onClick={onClose}
                className="bg-red-600 hover:bg-red-700 px-5 sm:px-6 py-2 rounded-lg font-semibold text-sm sm:text-base"
              >
                Cerrar
              </button>
            </div>

            {/* Modal de confirmación */}
            {beneficioSeleccionado && (
              <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60]">
                <div className="bg-white text-gray-900 rounded-xl p-6 w-full max-w-md shadow-2xl text-center">
                  <h3 className="text-lg sm:text-xl font-bold mb-3">
                    ¿Deseas usar este beneficio?
                  </h3>
                  <p className="text-sm sm:text-base mb-5">
                    {beneficioSeleccionado.nombre}
                  </p>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => setBeneficioSeleccionado(null)}
                      className="bg-gray-700 text-white hover:bg-gray-600 px-4 py-2 rounded-lg"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={confirmarUsoBeneficio}
                      className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-lg"
                    >
                      Confirmar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
