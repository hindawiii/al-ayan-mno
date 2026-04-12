import React, { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface SyringeModelProps {
  position: [number, number, number];
  onPositionChange: (pos: [number, number, number]) => void;
  injecting: boolean;
  onInjectComplete: () => void;
}

const SyringeModel = ({ position, onPositionChange, injecting, onInjectComplete }: SyringeModelProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const [isDragging, setIsDragging] = useState(false);
  const injectProgress = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Injection animation: needle sinks in
    if (injecting) {
      injectProgress.current = Math.min(injectProgress.current + delta * 2, 1);
      groupRef.current.position.z = position[2] - injectProgress.current * 0.6;

      // Slight wobble for realism
      groupRef.current.rotation.x = Math.sin(injectProgress.current * Math.PI * 4) * 0.02;

      if (injectProgress.current >= 1) {
        injectProgress.current = 0;
        onInjectComplete();
      }
    } else {
      injectProgress.current = 0;
      // Idle hover animation
      groupRef.current.position.y = position[1] + Math.sin(Date.now() * 0.003) * 0.05;
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={[Math.PI / 2, 0, 0]}
      onPointerDown={(e) => {
        e.stopPropagation();
        setIsDragging(true);
        (e.target as HTMLElement)?.setPointerCapture?.(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!isDragging) return;
        e.stopPropagation();
        // Move syringe in XY plane
        const newPos: [number, number, number] = [
          THREE.MathUtils.clamp(position[0] + e.movementX * 0.01, -3, 3),
          THREE.MathUtils.clamp(position[1] - e.movementY * 0.01, -2, 3),
          position[2],
        ];
        onPositionChange(newPos);
      }}
      onPointerUp={() => setIsDragging(false)}
    >
      {/* Barrel */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 1.2, 16]} />
        <meshStandardMaterial color="#e8eaed" roughness={0.3} metalness={0.4} transparent opacity={0.85} />
      </mesh>

      {/* Liquid inside */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.6, 16]} />
        <meshStandardMaterial color="#22c55e" transparent opacity={0.5} />
      </mesh>

      {/* Plunger top */}
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.15, 16]} />
        <meshStandardMaterial color="#6b7280" roughness={0.5} metalness={0.6} />
      </mesh>

      {/* Plunger rod */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.7} />
      </mesh>

      {/* Needle hub */}
      <mesh position={[0, -0.65, 0]}>
        <cylinderGeometry args={[0.04, 0.06, 0.1, 16]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.8} />
      </mesh>

      {/* Needle */}
      <mesh position={[0, -0.9, 0]}>
        <cylinderGeometry args={[0.008, 0.015, 0.5, 8]} />
        <meshStandardMaterial color="#c0c0c0" metalness={1} roughness={0.1} />
      </mesh>

      {/* Finger grips */}
      <mesh position={[0.1, 0.55, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.04, 0.15, 0.04]} />
        <meshStandardMaterial color="#d1d5db" metalness={0.4} />
      </mesh>
      <mesh position={[-0.1, 0.55, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.04, 0.15, 0.04]} />
        <meshStandardMaterial color="#d1d5db" metalness={0.4} />
      </mesh>
    </group>
  );
};

export default SyringeModel;
