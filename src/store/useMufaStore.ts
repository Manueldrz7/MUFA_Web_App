import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Tipos
export interface Jugador {
  nombre: string;
  monedas: number;
  beneficios?: string[];
  id?: string;
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
  dificultad: "fácil" | "medio" | "difícil";
  cumplido: boolean;
  fallido?: boolean;
  monedas: number; // 1 / 2 / 3
}

interface MufaState {
  // Estado
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

  // Acciones - sorteo
  setResultados: (r: Record<string, string[]>) => void;
  setBombos: (b: Record<string, string[]>) => void;
  reiniciarTorneo: () => void;

  // Acciones - partidos
  agregarPartido: (p: Omit<Partido, "id" | "fecha">) => void;

  // Acciones - retos
  agregarReto: (reto: Reto) => void;
  actualizarRetoEstado: (id: string, estado: "cumplido" | "no_cumplido") => void;
}

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

      // ─── Jugadores / torneo ─────────────────────────────────────────────
      agregarJugador: (nombre) =>
        set((state) => ({
          jugadores: [...state.jugadores, { nombre, monedas: 0, beneficios: [] }],
        })),

      setJugadores: (js) => set({ jugadores: js }),

      limpiarJugadores: () => set({ jugadores: [] }),

      setTorneo: (t) => set({ torneo: t }),

      // ─── Sorteo ─────────────────────────────────────────────────────────
      setResultados: (r) => set({ resultados: r }),
      setBombos: (b) => set({ bombos: b }),

      reiniciarTorneo: () =>
        set({
          torneo: null,
          resultados: {},
          jugadores: [],
          bombos: {},
          partidos: [],
          retos: [],
        }),

      // ─── Partidos ───────────────────────────────────────────────────────
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

      // ─── Retos ──────────────────────────────────────────────────────────
      agregarReto: (reto) =>
        set((state) => ({
          retos: [...state.retos, reto],
        })),

      actualizarRetoEstado: (id, estado) => {
        const { retos, jugadores } = get();

        const idx = retos.findIndex((r) => r.id === id);
        if (idx === -1) return;

        const reto = retos[idx];
        const eraCumplido = reto.cumplido;

        // Actualizar estado del reto
        const nuevoReto: Reto =
          estado === "cumplido"
            ? { ...reto, cumplido: true, fallido: false }
            : { ...reto, cumplido: false, fallido: true };

        // Si marcamos como cumplido y antes NO lo estaba, sumar monedas
        let nuevosJugadores = jugadores;
        if (estado === "cumplido" && !eraCumplido) {
          nuevosJugadores = jugadores.map((j) =>
            j.nombre === reto.jugador ? { ...j, monedas: (j.monedas || 0) + reto.monedas } : j
          );
        }

        // Si marcamos "no_cumplido", no mueve monedas

        const nuevosRetos = [...retos];
        nuevosRetos[idx] = nuevoReto;

        set({ retos: nuevosRetos, jugadores: nuevosJugadores });
      },
    }),
    {
      name: "mufa-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
