import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ────────────────────────────────
// Tipos principales
// ────────────────────────────────
export interface Beneficio {
  nombre: string;
  descripcion: string;
  usado: boolean;
}

export interface Jugador {
  nombre: string;
  monedas: number;
  beneficios?: Beneficio[];
  id?: string;

  // ─── Flags temporales activados por beneficios ─────────────────────────
  multiplicadorActivo?: boolean;
  multiplicadorFacil?: boolean;
  multiplicadorDosRondas?: number;
  saltarSiguienteReto?: boolean;
  puedeElegirDificultad?: boolean;
  puedeRepetirReto?: boolean;
  puedeRepetirEquipo?: boolean;
  puedeCambiarBombo?: boolean;
  puedeElegirRival?: boolean;
  paseDoradoActivo?: boolean;
  puedeBloquearJugador?: boolean;
  puedeRobarReto?: boolean;
  bloquearRetosDificiles?: boolean;
  puedeVerRetos?: boolean;
  puedeReiniciarEquipos?: boolean;
  controlTotalSorteo?: boolean;
  puedeModificarOrden?: boolean;
  puedeIntercambiarEquipo?: boolean;
}


export interface Torneo {
  equiposPorJugador: number;
  estado: string;
}

export interface Partido {
  id: string;
  modo: "jugador" | "cpu";
  jugadorActivo: string;
  contrincante?: string;
  resultado?: string;
  fecha: string;
}

export interface Reto {
  id: string;
  jugador: string;
  descripcion: string;
  dificultad: "facil" | "medio" | "dificil";
  cumplido: boolean;
  fallido?: boolean;
  monedas: number;
}

// ────────────────────────────────
// Estado global de MUFA
// ────────────────────────────────
interface MufaState {
  jugadores: Jugador[];
  torneo: Torneo | null;
  resultados: Record<string, string[]>;
  bombos: Record<string, string[]>;
  partidos: Partido[];
  retos: Reto[];

  // Acciones - jugadores/torneo
  agregarJugador: (nombre: string) => void;
  setJugadores: (js: Jugador[]) => void;
  limpiarJugadores: () => void;
  setTorneo: (t: Torneo) => void;
  terminarTorneo: () => void;

  // Acciones - sorteo
  setResultados: (r: Record<string, string[]>) => void;
  setBombos: (b: Record<string, string[]>) => void;

  // Acciones - partidos
  agregarPartido: (p: Omit<Partido, "id" | "fecha">) => void;

  // Acciones - retos
  agregarReto: (reto: Reto) => void;
  actualizarRetoEstado: (id: string, estado: "cumplido" | "no_cumplido") => void;

  usarBeneficio: (jugadorNombre: string, beneficioNombre: string) => void;

}

// ────────────────────────────────
// Descripción base de cada beneficio
// ────────────────────────────────
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

// ────────────────────────────────
// Store de Zustand (persistente)
// ────────────────────────────────
export const useMufaStore = create<MufaState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      jugadores: [],
      torneo: null,
      resultados: {},
      bombos: {},
      partidos: [],
      retos: [],

      // ────────────────────────────────
      // Jugadores / Torneo
      // ────────────────────────────────
      agregarJugador: (nombre) =>
        set((state) => ({
          jugadores: [...state.jugadores, { nombre, monedas: 0, beneficios: [] }],
        })),

      setJugadores: (js) =>
      set((state) => ({
        jugadores: js.map((jugador) => ({
          ...jugador,
          beneficios: (jugador.beneficios ?? []).map((b: string | Beneficio) => {
            if (typeof b === "string") {
              return {
                nombre: b,
                descripcion: obtenerDescripcionBeneficio(b),
                usado: false,
              };
            }
            return b;
          }),
        })),
        // Evita que Zustand ignore el cambio si el array es igual por referencia
        torneo: state.torneo ? { ...state.torneo } : null,
      })),


      limpiarJugadores: () => set({ jugadores: [] }),

      setTorneo: (t) => set({ torneo: t }),

      /**
       * Termina el torneo actual, conservando los jugadores y sus beneficios.
       * Limpia resultados, bombos, partidos y retos.
       */
      terminarTorneo: () =>
        set((state) => ({
          torneo: null,
          resultados: {},
          bombos: {},
          partidos: [],
          retos: [],
            jugadores: state.jugadores.map((j) => ({
            ...j,
            beneficios: (j.beneficios ?? []).map((b) => ({ ...b, usado: false })),
          })),

        })),

      /**
       * Marca un beneficio como usado para un jugador específico.
       * @param jugadorNombre Nombre del jugador que lo usa.
       * @param beneficioNombre Nombre del beneficio a usar.
       */
      /**
       * Aplica el efecto de un beneficio y lo marca como usado.
       */
      /**
       * Aplica el efecto correspondiente a un beneficio y lo marca como usado.
       * Soporta tanto efectos inmediatos (por ejemplo, sumar monedas)
       * como efectos persistentes (por ejemplo, activar flags para siguientes rondas).
       */
      usarBeneficio: (jugadorNombre, beneficioNombre) =>
        set((state) => {
          // Clonar jugadores actuales
          const jugadoresActualizados = state.jugadores.map((jugador) => {
            if (jugador.nombre !== jugadorNombre) return jugador;

            let jugadorModificado = { ...jugador };

            // ─── Tabla de efectos ───────────────────────────────────────
            const efectosBeneficios: Record<
              string,
              (j: typeof jugadorModificado) => typeof jugadorModificado
            > = {
              "Bono de +5 Mufa Coins instantáneo": (j) => ({
                ...j,
                monedas: j.monedas + 5,
              }),

              "Duplicar las monedas del siguiente reto cumplido (de cualquier nivel)": (j) => ({
                ...j,
                multiplicadorActivo: true,
              }),

              "Duplicar las monedas de tu siguiente reto fácil": (j) => ({
                ...j,
                multiplicadorFacil: true,
              }),

              "Saltar tu siguiente reto": (j) => ({
                ...j,
                saltarSiguienteReto: true,
              }),

              "Elegir dificultad del siguiente reto": (j) => ({
                ...j,
                puedeElegirDificultad: true,
              }),

              "Repetir tu sorteo de reto": (j) => ({
                ...j,
                puedeRepetirReto: true,
              }),

              "Repetir tu sorteo de equipo": (j) => ({
                ...j,
                puedeRepetirEquipo: true,
              }),

              "Cambiar de bombo una vez": (j) => ({
                ...j,
                puedeCambiarBombo: true,
              }),

              "Elegir tu rival en la próxima ronda": (j) => ({
                ...j,
                puedeElegirRival: true,
              }),

              "Pase Dorado": (j) => ({
                ...j,
                paseDoradoActivo: true,
              }),

              "Bloquear un jugador del siguiente sorteo": (j) => ({
                ...j,
                puedeBloquearJugador: true,
              }),

              "Robar un reto fácil de otro jugador": (j) => ({
                ...j,
                puedeRobarReto: true,
              }),

              "Multiplicador de 2× para 2 rondas seguidas": (j) => ({
                ...j,
                multiplicadorDosRondas: 2, // contador de rondas
              }),

              "Bloquear un reto difícil para todos durante 1 ronda": (j) => ({
                ...j,
                bloquearRetosDificiles: true,
              }),

              "Ver los próximos 3 retos posibles antes del sorteo": (j) => ({
                ...j,
                puedeVerRetos: true,
              }),

              "Reiniciar tu sorteo completo de equipo": (j) => ({
                ...j,
                puedeReiniciarEquipos: true,
              }),

              "Control total del sorteo personal": (j) => ({
                ...j,
                controlTotalSorteo: true,
              }),

              "Modificar el orden del sorteo general": (j) => ({
                ...j,
                puedeModificarOrden: true,
              }),

              "Intercambiar tu equipo con otro jugador (si acepta)": (j) => ({
                ...j,
                puedeIntercambiarEquipo: true,
              }),
            };
            // ────────────────────────────────────────────────────────────

            // Ejecutar efecto (si existe)
            const aplicarEfecto = efectosBeneficios[beneficioNombre];
            if (aplicarEfecto) {
              jugadorModificado = aplicarEfecto(jugadorModificado);
            }

            // Marcar beneficio como usado
            if (jugadorModificado.beneficios) {
              jugadorModificado.beneficios = jugadorModificado.beneficios.map((b) =>
                b.nombre === beneficioNombre ? { ...b, usado: true } : b
              );
            }


            return jugadorModificado;
          });

          set({ jugadores: jugadoresActualizados });
          return { ...state };

        }),




      // ────────────────────────────────
      // Sorteo
      // ────────────────────────────────
      setResultados: (r) => set({ resultados: r }),
      setBombos: (b) => set({ bombos: b }),

      // ────────────────────────────────
      // Partidos
      // ────────────────────────────────
      agregarPartido: (p) =>
        set((state) => ({
          partidos: [
            ...state.partidos,
            {
              ...p,
              id: Math.random().toString(36).slice(2, 9),
              fecha: new Date().toISOString(),
            },
          ],
        })),

      // ────────────────────────────────
      // Retos
      // ────────────────────────────────
      /**
       * Agrega un nuevo reto al jugador y aplica beneficios activos si los tiene.
       */
      agregarReto: (reto) =>
        set((state) => {
          const { jugadores } = state;
          const jugador = jugadores.find((j) => j.nombre === reto.jugador);
          if (!jugador) return { retos: state.retos };

          let dificultadFinal = reto.dificultad;
          let monedasFinal = reto.monedas;

          // ─── Efectos de beneficios ────────────────────────────────────────────

          // Si tiene activo el "Pase Dorado", no se asigna reto y gana monedas
          if (jugador.paseDoradoActivo) {
            const nuevosJugadores = jugadores.map((j) =>
              j.nombre === jugador.nombre
                ? { ...j, monedas: j.monedas + reto.monedas, paseDoradoActivo: false }
                : j
            );
            return { jugadores: nuevosJugadores };
          }

          // Si tiene "Saltar siguiente reto"
          if (jugador.saltarSiguienteReto) {
            const nuevosJugadores = jugadores.map((j) =>
              j.nombre === jugador.nombre ? { ...j, saltarSiguienteReto: false } : j
            );
            return { jugadores: nuevosJugadores };
          }

          // Si puede elegir dificultad
          if (jugador.puedeElegirDificultad) {
            dificultadFinal = "medio"; // podrías abrir un modal de elección más adelante
          }

          // Si tiene multiplicador activo (general o solo fácil)
          if (jugador.multiplicadorActivo) {
            monedasFinal *= 2;
          } else if (jugador.multiplicadorFacil && reto.dificultad === "facil") {
            monedasFinal *= 2;
          }

          // Si tiene multiplicador de 2 rondas
          if (jugador.multiplicadorDosRondas && jugador.multiplicadorDosRondas > 0) {
            monedasFinal *= 2;
          }

          // ─── Fin de efectos ──────────────────────────────────────────────────

          const nuevosRetos = [
            ...state.retos,
            { ...reto, dificultad: dificultadFinal, monedas: monedasFinal },
          ];

          // Reducir duración del beneficio de 2 rondas si aplica
          const nuevosJugadores = jugadores.map((j) =>
            j.nombre === jugador.nombre
              ? {
                  ...j,
                  multiplicadorDosRondas:
                    j.multiplicadorDosRondas && j.multiplicadorDosRondas > 0
                      ? j.multiplicadorDosRondas - 1
                      : j.multiplicadorDosRondas,
                }
              : j
          );

          return { retos: nuevosRetos, jugadores: nuevosJugadores };
        }),


      actualizarRetoEstado: (id, estado) => {
        const { retos, jugadores } = get();
        const idx = retos.findIndex((r) => r.id === id);
        if (idx === -1) return;

        const reto = retos[idx];
        const eraCumplido = reto.cumplido;

        const nuevoReto: Reto =
          estado === "cumplido"
            ? { ...reto, cumplido: true, fallido: false }
            : { ...reto, cumplido: false, fallido: true };

        let nuevosJugadores = jugadores;
        if (estado === "cumplido" && !eraCumplido) {
          nuevosJugadores = jugadores.map((j) =>
            j.nombre === reto.jugador
              ? { ...j, monedas: (j.monedas || 0) + reto.monedas }
              : j
          );
        }

        const nuevosRetos = [...retos];
        nuevosRetos[idx] = nuevoReto;
        set({ retos: nuevosRetos, jugadores: nuevosJugadores });
      },
    }),
    {
      name: "mufa-storage",
      storage: createJSONStorage(() => localStorage),

      // Migra beneficios antiguos (string → objeto)
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (state.jugadores) {
          state.jugadores = state.jugadores.map((jugador) => ({
            ...jugador,
            beneficios: jugador.beneficios
              ? jugador.beneficios.map((b: string | Beneficio) => {
                  if (typeof b === "string") {
                    return {
                      nombre: b,
                      descripcion: obtenerDescripcionBeneficio(b),
                      usado: false,
                    };
                  }
                  return b;
                })
              : [],
          }));
        }
      },
    }
  )
);
