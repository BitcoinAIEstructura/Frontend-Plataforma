/** Qué se cuenta de cada estructura en "Cómo funciona" y cómo se juega con ella. */
import type { EstructuraDemo, OperacionDemo } from "@/lib/api/estructuras";

export interface BotonOperacion {
  operacion: string;
  etiqueta: string;
  conValor: boolean;
}

export interface FichaEstructura {
  id: EstructuraDemo;
  nombre: string;
  /** Una frase: qué es. */
  idea: string;
  /** Dónde se usa de verdad en Nexabit. */
  enNexabit: string;
  complejidades: readonly [operacion: string, costo: string][];
  botones: readonly BotonOperacion[];
  valor: "numero" | "palabra";
  /** Operaciones de ejemplo que muestran lo interesante (una rotación, un rehash…). */
  ejemplo: readonly OperacionDemo[];
}

const numeros = (operacion: string, ...valores: number[]): OperacionDemo[] =>
  valores.map((valor) => ({ operacion, valor }));

export const FICHAS: readonly FichaEstructura[] = [
  {
    id: "cola",
    nombre: "Cola (FIFO)",
    idea: "El primero que entra es el primero que sale, como la fila de un banco.",
    enNexabit: "Tus órdenes pendientes esperan en una cola y se ejecutan en el orden en que las creaste.",
    complejidades: [
      ["encolar", "O(1)"],
      ["desencolar", "O(1)"],
    ],
    botones: [
      { operacion: "encolar", etiqueta: "Encolar", conValor: true },
      { operacion: "desencolar", etiqueta: "Desencolar", conValor: false },
    ],
    valor: "numero",
    ejemplo: [...numeros("encolar", 500, 200, 750), { operacion: "desencolar" }],
  },
  {
    id: "pila",
    nombre: "Pila (LIFO)",
    idea: "El último que entra es el primero que sale, como una pila de platos.",
    enNexabit:
      "El historial (lo más reciente arriba) y el botón Deshacer (Ctrl + Z), que saca la última orden creada.",
    complejidades: [
      ["apilar", "O(1)"],
      ["desapilar", "O(1)"],
    ],
    botones: [
      { operacion: "apilar", etiqueta: "Apilar", conValor: true },
      { operacion: "desapilar", etiqueta: "Desapilar", conValor: false },
    ],
    valor: "numero",
    ejemplo: [...numeros("apilar", 1, 2, 3), { operacion: "desapilar" }],
  },
  {
    id: "monticulo",
    nombre: "Montículo",
    idea: "Un árbol donde cada padre es menor que sus hijos: el menor siempre está arriba, listo para sacarlo.",
    enNexabit:
      "La liga de inversores: con un montículo de 10 se quedan los 10 mejores sin ordenar a todos (O(n log 10)).",
    complejidades: [
      ["insertar", "O(log n)"],
      ["extraer el menor", "O(log n)"],
      ["ver el menor", "O(1)"],
    ],
    botones: [
      { operacion: "insertar", etiqueta: "Insertar", conValor: true },
      { operacion: "extraer", etiqueta: "Extraer el menor", conValor: false },
    ],
    valor: "numero",
    ejemplo: [...numeros("insertar", 40, 25, 60, 10, 35), { operacion: "extraer" }],
  },
  {
    id: "avl",
    nombre: "Árbol AVL",
    idea: "Un árbol de búsqueda que rota sus nodos para no desbalancearse: buscar siempre es rápido.",
    enNexabit:
      "«¿Y si hubiera invertido?»: las velas de 1000 días van en un AVL por fecha y la de cualquier día sale en ~10 pasos.",
    complejidades: [
      ["insertar", "O(log n)"],
      ["buscar", "O(log n)"],
      ["eliminar", "O(log n)"],
    ],
    botones: [
      { operacion: "insertar", etiqueta: "Insertar", conValor: true },
      { operacion: "buscar", etiqueta: "Buscar", conValor: true },
      { operacion: "eliminar", etiqueta: "Eliminar", conValor: true },
    ],
    valor: "numero",
    // Llegan en orden, como las velas: sin rotaciones sería una lista.
    ejemplo: numeros("insertar", 10, 20, 30, 40, 50, 25),
  },
  {
    id: "tabla-hash",
    nombre: "Tabla hash",
    idea: "El hash de la clave dice en qué cubeta está: se llega directo, sin buscar.",
    enNexabit:
      "Encuentra tu simulación (cartera, órdenes y bot) por tu id en O(1), haya los usuarios que haya.",
    complejidades: [
      ["poner", "O(1) promedio"],
      ["buscar", "O(1) promedio"],
      ["crecer (rehash)", "O(n), pocas veces"],
    ],
    botones: [
      { operacion: "poner", etiqueta: "Poner", conValor: true },
      { operacion: "buscar", etiqueta: "Buscar", conValor: true },
      { operacion: "eliminar", etiqueta: "Eliminar", conValor: true },
    ],
    valor: "numero",
    ejemplo: numeros("poner", 7, 3, 11, 15, 2),
  },
  {
    id: "cola-circular",
    nombre: "Cola circular",
    idea: "Una cola de tamaño fijo que da la vuelta: al llenarse, lo nuevo pisa a lo más viejo.",
    enNexabit:
      "Los últimos 120 precios del mercado (unos 10 minutos), sin que la memoria crezca aunque el servidor lleve días encendido.",
    complejidades: [
      ["agregar", "O(1)"],
      ["desencolar", "O(1)"],
    ],
    botones: [
      { operacion: "agregar", etiqueta: "Agregar", conValor: true },
      { operacion: "desencolar", etiqueta: "Desencolar", conValor: false },
    ],
    valor: "numero",
    ejemplo: numeros("agregar", 81, 82, 83, 84, 85, 86, 87, 88, 89, 90),
  },
  {
    id: "trie",
    nombre: "Trie",
    idea: "Un árbol de letras: las palabras que empiezan igual comparten el camino.",
    enNexabit: "La búsqueda de Ctrl + K: encuentra páginas y conceptos mientras escribes.",
    complejidades: [
      ["insertar", "O(m), m letras"],
      ["buscar por prefijo", "O(m + resultados)"],
    ],
    botones: [
      { operacion: "insertar", etiqueta: "Insertar", conValor: true },
      { operacion: "buscar", etiqueta: "Buscar", conValor: true },
      { operacion: "eliminar", etiqueta: "Eliminar", conValor: true },
    ],
    valor: "palabra",
    ejemplo: ["orden", "ordenes", "oro", "bot", "bota"].map((valor) => ({ operacion: "insertar", valor })),
  },
];

export const MAXIMO_OPERACIONES = 30;
