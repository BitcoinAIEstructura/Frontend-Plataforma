"use client";

import { useState, type FormEvent } from "react";

import { Boton } from "@/componentes/ui/Boton";
import { Campo } from "@/componentes/ui/Campo";
import { Segmentado } from "@/componentes/ui/Segmentado";
import { Tarjeta } from "@/componentes/ui/Tarjeta";
import { btc, usdt } from "@/lib/formato";
import { useAccionesOrdenes, useCartera, usePrecio } from "@/lib/hooks/useDatos";

import { disponible, leerMonto, montoRapido, validarMonto, vistaPrevia, type Tipo } from "./calculos";

const TIPOS = [
  { valor: "COMPRA" as const, etiqueta: "▲ Comprar" },
  { valor: "VENTA" as const, etiqueta: "▼ Vender" },
];

const RAPIDOS = [
  { etiqueta: "25 %", fraccion: 0.25 },
  { etiqueta: "50 %", fraccion: 0.5 },
];

/** Comprar o vender: monto en USDT, botones rápidos y lo que pasaría al precio de ahora. */
export function FormularioOrden() {
  const [tipo, setTipo] = useState<Tipo>("COMPRA");
  const [texto, setTexto] = useState("");
  // "Todo" en la venta: vende todo el BTC que haya cuando se ejecute.
  const [todo, setTodo] = useState(false);
  const [intento, setIntento] = useState(false);
  const [creada, setCreada] = useState<number | null>(null);
  const cartera = useCartera();
  const precio = usePrecio();
  const { crear } = useAccionesOrdenes();

  const c = cartera.data;
  const monto = todo && c ? disponible("VENTA", c) : leerMonto(texto);
  const error = !c
    ? null
    : todo
      ? c.btc > 0
        ? null
        : "Aún no tienes BTC para vender."
      : validarMonto(tipo, monto, c);
  const previa = !error && precio.data && monto > 0 ? vistaPrevia(tipo, monto, precio.data.precio) : null;

  const cambiarTipo = (nuevo: Tipo) => {
    setTipo(nuevo);
    setTodo(false);
    setIntento(false);
  };

  const elegirRapido = (fraccion: number) => {
    if (!c) return;
    setTodo(false);
    setTexto(String(montoRapido(tipo, fraccion, c)).replace(".", ","));
  };

  const elegirTodo = () => {
    if (!c) return;
    if (tipo === "VENTA") {
      setTodo(true);
      setTexto("");
    } else {
      setTexto(String(montoRapido("COMPRA", 1, c)).replace(".", ","));
    }
  };

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    setIntento(true);
    setCreada(null);
    if (!c || error) return;
    const orden = todo ? { tipo: "VENTA" as const, todo: true as const } : { tipo, monto };
    crear.mutate(orden, {
      onSuccess: (o) => {
        setCreada(o.id);
        setTexto("");
        setTodo(false);
        setIntento(false);
      },
    });
  };

  const accion = tipo === "COMPRA" ? "Comprar" : "Vender";
  const textoBoton = todo
    ? "Vender todo mi BTC"
    : Number.isFinite(monto) && monto > 0
      ? `${accion} ${usdt(monto)} USDT`
      : accion;

  return (
    <Tarjeta titulo="Nueva orden" destacada>
      <form onSubmit={enviar} noValidate className="flex flex-col gap-4">
        <Segmentado etiqueta="Tipo de orden" opciones={TIPOS} valor={tipo} alCambiar={cambiarTipo} />

        <p className="cifra text-sm text-texto-secundario">
          {c
            ? tipo === "COMPRA"
              ? `Disponible: ${usdt(c.saldoUsdt)} USDT`
              : `Tienes ${btc(c.btc)} BTC (≈ ${usdt(c.valorBtc)} USDT)`
            : "Cargando tu cartera…"}
        </p>

        <Campo
          etiqueta={
            tipo === "COMPRA" ? "USDT a gastar (comisión incluida)" : "Valor en USDT del BTC a vender"
          }
          inputMode="decimal"
          autoComplete="off"
          placeholder={todo ? "Todo tu BTC" : "0,00"}
          value={texto}
          disabled={todo}
          onChange={(e) => {
            setTexto(e.target.value);
            setCreada(null);
          }}
          error={intento ? error : null}
        />

        <div className="flex flex-wrap gap-2" role="group" aria-label="Montos rápidos">
          {RAPIDOS.map((r) => (
            <button
              key={r.etiqueta}
              type="button"
              disabled={!c}
              onClick={() => elegirRapido(r.fraccion)}
              className="rounded-full border border-borde px-3 py-1 text-sm font-medium text-texto-secundario hover:border-oro/50 hover:text-texto"
            >
              {r.etiqueta}
            </button>
          ))}
          <button
            type="button"
            disabled={!c}
            aria-pressed={todo}
            onClick={elegirTodo}
            className={
              "rounded-full border px-3 py-1 text-sm font-medium " +
              (todo
                ? "border-oro bg-oro/10 text-oro"
                : "border-borde text-texto-secundario hover:border-oro/50")
            }
          >
            Todo
          </button>
        </div>

        {previa && (
          <p className="cifra rounded-xl bg-superficie-alta/60 px-4 py-3 text-sm text-texto-secundario">
            {tipo === "COMPRA"
              ? `Recibirías ≈ ${btc(previa.btc)} BTC`
              : `Venderías ≈ ${btc(previa.btc)} BTC y recibirías ≈ ${usdt(previa.usdt)} USDT`}
            {" · "}comisión ≈ {usdt(previa.comision)} USDT, al precio de ahora ({usdt(precio.data?.precio)}).
          </p>
        )}

        <Boton type="submit" cargando={crear.isPending} anchoCompleto>
          {textoBoton}
        </Boton>

        {crear.isError && (
          <p role="alert" className="text-sm font-medium text-error">
            {crear.error.message}
          </p>
        )}
        {creada !== null && (
          <p role="status" className="text-sm text-exito">
            ✓ Orden #{creada} en la cola. Se ejecuta en orden de llegada: usa «Ejecutar siguiente» o deja que
            lo haga el bot.
          </p>
        )}
      </form>
    </Tarjeta>
  );
}
