import { AnimatePresence, motion } from "framer-motion";
import { useMufaStore } from "../store/useMufaStore";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function ModalBeneficios({ visible, onClose }: Props) {
  const { jugadores } = useMufaStore();

  if (!visible) return null;

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
            className="bg-gray-900 rounded-2xl p-5 sm:p-8 text-white shadow-2xl w-full max-w-3xl overflow-hidden"
            initial={{ scale: 0.85 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.85 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-yellow-400 text-center mb-6">
              🎁 Beneficios comprados
            </h2>

            {jugadores.length === 0 ? (
              <p className="text-gray-400 text-center text-sm sm:text-base">
                No hay jugadores registrados.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse min-w-[600px]">
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
                            <ul className="space-y-1">
                              {j.beneficios.map((b, idx) => (
                                <li
                                  key={idx}
                                  className="bg-gray-800 px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm"
                                >
                                  {b}
                                </li>
                              ))}
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
