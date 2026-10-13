import { act, render, screen } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";

import { clienteDePrueba } from "@/test/utilidades";

import { aplicarEvento, CLAVES, ProveedorTiempoReal, textoAlerta, useEstadoConexion } from "./tiempoReal";

class EventSourceFalso {
  static ultima: EventSourceFalso | null = null;
  static CLOSED = 2;
  readyState = 0;
  url: string;
  opciones: EventSourceInit | undefined;
  onopen: (() => void) | null = null;
  onerror: (() => void) | null = null;
  oyentes = new Map<string, (e: MessageEvent<string>) => void>();
  cerrada = false;
  constructor(url: string, opciones?: EventSourceInit) {
    this.url = url;
    this.opciones = opciones;
    EventSourceFalso.ultima = this;
  }
  addEventListener(tipo: string, oyente: (e: MessageEvent<string>) => void) {
    this.oyentes.set(tipo, oyente);
  }
  removeEventListener(tipo: string) {
    this.oyentes.delete(tipo);
  }
  close() {
    this.cerrada = true;
  }
  emitir(tipo: string, datos: unknown) {
    this.oyentes.get(tipo)?.(new MessageEvent(tipo, { data: JSON.stringify(datos) }));
  }
}

afterEach(() => vi.unstubAllGlobals());

const CARTERA = {
  precioActual: 80000,
  saldoUsdt: 9000,
  btc: 0.0125,
  costoPromedio: 80000,
  valorBtc: 1000,
  valorTotal: 10000,
  gananciaNoRealizada: 0,
  gananciaRealizada: 0,
  gananciaTotal: 0,
  rentabilidad: 0,
  comisionesPagadas: 1,
  saldoInicial: 10000,
};

describe("aplicarEvento", () => {
  it("precio y cartera actualizan la caché", () => {
    const cliente = clienteDePrueba();
    expect(aplicarEvento(cliente, "precio", '{"simbolo":"BTCUSDT","precio":81000.5,"momento":1}')).toBe(true);
    expect(cliente.getQueryData(CLAVES.precio)).toMatchObject({ precio: 81000.5 });
    expect(aplicarEvento(cliente, "cartera", JSON.stringify(CARTERA))).toBe(true);
    expect(cliente.getQueryData(CLAVES.cartera)).toMatchObject({ saldoUsdt: 9000 });
  });

  it("una orden nueva hace recargar órdenes e historial", () => {
    const cliente = clienteDePrueba();
    const invalidar = vi.spyOn(cliente, "invalidateQueries");
    const orden = {
      id: 1,
      tipo: "COMPRA",
      monto: 500,
      todo: false,
      estado: "EJECUTADA",
      creadaEn: 1,
      ejecutadaEn: 2,
      precioEjecucion: 80000,
      cantidadBtc: 0.006,
      comision: 0.5,
      motivo: "manual",
      detalle: "Compró",
    };
    expect(aplicarEvento(cliente, "orden", JSON.stringify(orden))).toBe(true);
    expect(invalidar).toHaveBeenCalledWith({ queryKey: CLAVES.ordenes });
  });

  it("una decisión del bot guarda la señal y recarga el bot y el historial", () => {
    const cliente = clienteDePrueba();
    const invalidar = vi.spyOn(cliente, "invalidateQueries");
    const decision = {
      tiempo: 1,
      senal: "MANTENER",
      precio: 80000,
      confianza: 0.25,
      motivo: "gana MANTENER",
    };
    expect(aplicarEvento(cliente, "senal", JSON.stringify(decision))).toBe(true);
    expect(cliente.getQueryData(CLAVES.senalBot)).toMatchObject({ senal: "MANTENER" });
    expect(invalidar).toHaveBeenCalledWith({ queryKey: CLAVES.bot });
    // La decisión queda como DECISION_BOT en el historial: "Lo que ha hecho el bot" la debe ver.
    expect(invalidar).toHaveBeenCalledWith({ queryKey: CLAVES.historial });
  });

  it("una alerta cumplida recarga la lista y avisa con su texto", () => {
    const cliente = clienteDePrueba();
    const invalidar = vi.spyOn(cliente, "invalidateQueries");
    const avisos: string[] = [];
    const alerta = {
      id: 3,
      tipo: "BAJA_A",
      precio: 75000,
      estado: "DISPARADA",
      creadaEn: 1,
      disparadaEn: 2,
      precioDisparo: 74980.5,
    };
    expect(
      aplicarEvento(cliente, "alerta", JSON.stringify(alerta), (a) => avisos.push(textoAlerta(a).titulo)),
    ).toBe(true);
    expect(invalidar).toHaveBeenCalledWith({ queryKey: CLAVES.alertas });
    expect(avisos).toEqual(["▼ El BTC bajó a 75.000,00"]);
    expect(textoAlerta({ ...alerta, tipo: "SUBE_A", estado: "DISPARADA" }).texto).toBe(
      "Tu alerta se cumplió: ahora está en 74.980,50 USDT.",
    );
  });

  it("ignora eventos inválidos o desconocidos", () => {
    const cliente = clienteDePrueba();
    expect(aplicarEvento(cliente, "precio", "no es json")).toBe(false);
    expect(aplicarEvento(cliente, "precio", '{"precio":"mucho"}')).toBe(false);
    expect(aplicarEvento(cliente, "otro", "{}")).toBe(false);
    expect(cliente.getQueryData(CLAVES.precio)).toBeUndefined();
  });
});

function Estado() {
  return <output>{useEstadoConexion()}</output>;
}

describe("ProveedorTiempoReal", () => {
  it("abre una conexión con credenciales, pasa a en vivo y la cierra al salir", () => {
    vi.stubGlobal("EventSource", EventSourceFalso);
    const cliente = clienteDePrueba();
    const { unmount } = render(
      <QueryClientProvider client={cliente}>
        <ProveedorTiempoReal>
          <Estado />
        </ProveedorTiempoReal>
      </QueryClientProvider>,
    );
    const fuente = EventSourceFalso.ultima!;
    expect(fuente.url).toBe("/api/stream");
    expect(fuente.opciones?.withCredentials).toBe(true);
    expect(screen.getByRole("status")).toHaveTextContent("conectando");
    act(() => fuente.onopen?.());
    expect(screen.getByRole("status")).toHaveTextContent("en-vivo");
    act(() => fuente.emitir("precio", { simbolo: "BTCUSDT", precio: 99, momento: 1 }));
    expect(cliente.getQueryData(CLAVES.precio)).toMatchObject({ precio: 99 });
    unmount();
    expect(fuente.cerrada).toBe(true);
  });
});
