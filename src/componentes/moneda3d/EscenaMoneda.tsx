"use client";

import { Environment, Float, Lightformer, Sparkles } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { CanvasTexture, MathUtils, SRGBColorSpace, type Group, type Mesh } from "three";

import { AJUSTES, type Calidad } from "./calidad";
import { coloresDeLaPaleta, dibujarCara, type ColoresMoneda } from "./textura";

const RADIO = 1.6;
const GROSOR = 0.22;
const GIRO_POR_SEGUNDO = 0.45;
const INCLINACION_MAXIMA = 0.45;

function leerVioleta(): string {
  if (typeof document === "undefined") return "#9b7dff";
  return getComputedStyle(document.documentElement).getPropertyValue("--violeta").trim() || "#9b7dff";
}

function Moneda({ colores }: { colores: ColoresMoneda }) {
  const grupo = useRef<Group>(null);
  const halo = useRef<Mesh>(null);

  const cara = useMemo(() => {
    const lienzo = dibujarCara(colores);
    if (!lienzo) return null;
    const textura = new CanvasTexture(lienzo);
    textura.colorSpace = SRGBColorSpace;
    textura.anisotropy = 8;
    return textura;
  }, [colores]);

  useEffect(() => () => cara?.dispose(), [cara]);

  useFrame((estado, delta) => {
    const g = grupo.current;
    if (!g) return;
    // Gira sola y se inclina suavemente hacia donde está el mouse (o el dedo).
    g.rotation.y += delta * GIRO_POR_SEGUNDO;
    g.rotation.x = MathUtils.damp(g.rotation.x, -estado.pointer.y * INCLINACION_MAXIMA, 3, delta);
    g.rotation.z = MathUtils.damp(g.rotation.z, estado.pointer.x * INCLINACION_MAXIMA * 0.5, 3, delta);
    if (halo.current) halo.current.rotation.z -= delta * 0.6;
  });

  return (
    <group ref={grupo}>
      {/* Cuerpo: el cilindro de lado y las dos caras con la textura. */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[RADIO, RADIO, GROSOR, 128, 1]} />
        <meshStandardMaterial attach="material-0" color={colores.oro} metalness={1} roughness={0.32} />
        <meshStandardMaterial
          attach="material-1"
          map={cara}
          color={cara ? "#ffffff" : colores.oro}
          metalness={0.85}
          roughness={0.28}
        />
        <meshStandardMaterial
          attach="material-2"
          map={cara}
          color={cara ? "#ffffff" : colores.oro}
          metalness={0.85}
          roughness={0.28}
        />
      </mesh>
      {/* Canto naranja Bitcoin. */}
      <mesh>
        <torusGeometry args={[RADIO, 0.07, 24, 180]} />
        <meshStandardMaterial color={colores.bitcoin} metalness={1} roughness={0.2} />
      </mesh>
      {/* Anillo holográfico que gira alrededor. */}
      <mesh ref={halo} scale={1.32}>
        <torusGeometry args={[RADIO, 0.012, 8, 220, Math.PI * 1.6]} />
        <meshBasicMaterial color={leerVioleta()} transparent opacity={0.85} toneMapped={false} />
      </mesh>
    </group>
  );
}

export default function EscenaMoneda({ calidad }: { calidad: Exclude<Calidad, "estatica"> }) {
  const ajustes = AJUSTES[calidad];
  const colores = useMemo(() => coloresDeLaPaleta(), []);
  const violeta = useMemo(() => leerVioleta(), []);

  return (
    <Canvas
      aria-hidden
      dpr={[1, ajustes.dprMaximo]}
      camera={{ position: [0, 0, 6.2], fov: 35 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 4, 5]} intensity={2.4} color={colores.oroClaro} />
      <pointLight position={[-3, -1.5, 2.5]} intensity={18} color={violeta} />
      <pointLight position={[3.2, -2, 2]} intensity={14} color={colores.bitcoin} />
      {ajustes.reflejos && (
        // Reflejos de "estudio" hechos con paneles de luz: no se descarga ningún archivo HDR.
        <Environment resolution={256}>
          <Lightformer intensity={3} color={colores.oroClaro} position={[0, 5, -2]} scale={[10, 2, 1]} />
          <Lightformer
            intensity={2}
            color={violeta}
            position={[-5, 0, 2]}
            rotation-y={Math.PI / 2}
            scale={[2, 8, 1]}
          />
          <Lightformer
            intensity={2}
            color={colores.bitcoin}
            position={[5, -1, 2]}
            rotation-y={-Math.PI / 2}
            scale={[2, 6, 1]}
          />
        </Environment>
      )}
      <Float speed={1.6} rotationIntensity={0.25} floatIntensity={0.9}>
        <Moneda colores={colores} />
      </Float>
      <Sparkles
        count={ajustes.particulas}
        scale={[7, 5, 3]}
        size={2.4}
        speed={0.35}
        color={colores.oroClaro}
        opacity={0.8}
      />
    </Canvas>
  );
}
