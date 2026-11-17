"use client";

import { ContactShadows, Environment, Float, Lightformer, Sparkles } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { CanvasTexture, MathUtils, RepeatWrapping, SRGBColorSpace, type Group } from "three";

import { useTema, type Tema } from "@/componentes/ui/InterruptorTema";

import { AJUSTES, type Calidad } from "./calidad";
import { coloresDeLaPaleta, dibujarCanto, dibujarCara, type ColoresMoneda } from "./textura";

const RADIO = 1.6;
const GROSOR = 0.2;
const GIRO_POR_SEGUNDO = 0.32;
const INCLINACION_MAXIMA = 0.4;

/** Luz de estudio de cada tema: cálida y con contraluz en el oscuro, de día en el claro. */
const LUCES: Record<Tema, { ambiente: number; principal: number; contraluz: number; sombra: number }> = {
  oscuro: { ambiente: 0.35, principal: 3.4, contraluz: 26, sombra: 0.55 },
  claro: { ambiente: 1.0, principal: 2.6, contraluz: 10, sombra: 0.32 },
};

function textura(lienzo: HTMLCanvasElement | null, girar: boolean): CanvasTexture | null {
  if (!lienzo) return null;
  const t = new CanvasTexture(lienzo);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 8;
  if (girar) {
    // Las tapas del cilindro giran la textura 90°; esto deja el ₿ derecho.
    t.center.set(0.5, 0.5);
    t.rotation = Math.PI / 2;
  } else {
    t.wrapS = RepeatWrapping;
  }
  return t;
}

/**
 * `reflejos`: sin paneles de luz que reflejar (versión liviana) el metal puro se ve negro,
 * así que se baja lo metálico y se sube la luz propia para que siempre se vea dorada.
 */
function Moneda({ colores, reflejos }: { colores: ColoresMoneda; reflejos: boolean }) {
  const metal = reflejos ? 1 : 0.45;
  const grupo = useRef<Group>(null);
  const cara = useMemo(() => textura(dibujarCara(colores), true), [colores]);
  const canto = useMemo(() => textura(dibujarCanto(colores), false), [colores]);
  useEffect(
    () => () => {
      cara?.dispose();
      canto?.dispose();
    },
    [cara, canto],
  );

  useFrame((estado, delta) => {
    const g = grupo.current;
    if (!g) return;
    // Gira despacio y se inclina suavemente hacia donde está el mouse (o el dedo).
    g.rotation.y += delta * GIRO_POR_SEGUNDO;
    g.rotation.x = MathUtils.damp(g.rotation.x, -estado.pointer.y * INCLINACION_MAXIMA, 3, delta);
    g.rotation.z = MathUtils.damp(g.rotation.z, estado.pointer.x * INCLINACION_MAXIMA * 0.5, 3, delta);
  });

  const caraMaterial = {
    map: cara,
    color: cara ? "#ffffff" : colores.medio,
    metalness: reflejos ? 0.75 : 0.35,
    roughness: 0.28,
    emissive: colores.sombra,
    emissiveIntensity: reflejos ? 0.08 : 0.3,
  };

  return (
    <group ref={grupo}>
      {/* Cuerpo: canto estriado y las dos caras acuñadas. */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[RADIO, RADIO, GROSOR, 160, 1]} />
        <meshStandardMaterial
          attach="material-0"
          map={canto}
          color={canto ? "#ffffff" : colores.medio}
          metalness={metal}
          roughness={0.35}
        />
        <meshStandardMaterial attach="material-1" {...caraMaterial} />
        <meshStandardMaterial attach="material-2" {...caraMaterial} />
      </mesh>
      {/* Bisel del borde: un filo redondeado que atrapa la luz. */}
      <mesh>
        <torusGeometry args={[RADIO, GROSOR / 2, 24, 200]} />
        <meshStandardMaterial color={colores.medio} metalness={metal} roughness={0.22} />
      </mesh>
    </group>
  );
}

export default function EscenaMoneda({ calidad }: { calidad: Exclude<Calidad, "estatica"> }) {
  const ajustes = AJUSTES[calidad];
  const tema = useTema();
  const luces = LUCES[tema];
  // Los colores se vuelven a leer al cambiar de tema: three.js no entiende variables CSS.
  const colores = useMemo(() => {
    void tema;
    return coloresDeLaPaleta();
  }, [tema]);

  return (
    <Canvas
      aria-hidden
      dpr={[1, ajustes.dprMaximo]}
      // A 7,6 de distancia con 35° se ven ±2,4 de alto: cabe la moneda aunque flote, y la sombra.
      camera={{ position: [0, 0, 7.6], fov: 35 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={luces.ambiente} />
      <directionalLight position={[3, 4, 5]} intensity={luces.principal} color="#fff4dc" />
      {/* Contraluz: dibuja el filo de la moneda contra el fondo. */}
      <pointLight position={[-3.5, 2, -2]} intensity={luces.contraluz} color="#ffffff" />
      <pointLight position={[3.2, -2, 2.5]} intensity={luces.contraluz * 0.4} color={colores.canto} />
      {ajustes.reflejos && (
        // Reflejos de estudio hechos con paneles de luz: no se descarga ningún archivo HDR.
        <Environment resolution={256}>
          <Lightformer intensity={5} color="#fff1d0" position={[0, 5, -2]} scale={[10, 1.5, 1]} />
          <Lightformer intensity={1.6} color="#ffffff" position={[0, 0, 6]} scale={[6, 6, 1]} />
          <Lightformer
            intensity={3}
            color="#ffffff"
            position={[-5, 0, 2]}
            rotation-y={Math.PI / 2}
            scale={[1.2, 8, 1]}
          />
          <Lightformer
            intensity={2.5}
            color={colores.claro}
            position={[5, -1, 2]}
            rotation-y={-Math.PI / 2}
            scale={[1.2, 6, 1]}
          />
        </Environment>
      )}
      <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.6}>
        <Moneda key={tema} colores={colores} reflejos={ajustes.reflejos} />
      </Float>
      {ajustes.reflejos && (
        <ContactShadows position={[0, -2.15, 0]} opacity={luces.sombra} scale={7} blur={2.6} far={3} />
      )}
      <Sparkles
        count={ajustes.particulas}
        scale={[6, 4, 2]}
        size={1.4}
        speed={0.2}
        color={colores.claro}
        opacity={tema === "oscuro" ? 0.5 : 0.35}
      />
    </Canvas>
  );
}
