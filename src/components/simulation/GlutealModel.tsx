import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface GlutealModelProps {
  gender: "male" | "female";
  showAnatomy: boolean;
  safeZoneGlow: boolean;
}

const GlutealModel = ({ gender, showAnatomy, safeZoneGlow }: GlutealModelProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  // Animate safe zone glow
  useFrame((state) => {
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.15;
    }
  });

  // Gender-based scaling
  const hipScale = gender === "female" ? [1.15, 1.0, 1.1] as const : [1.0, 1.0, 1.0] as const;

  const skinColor = "#e8b89a";
  const skinOpacity = showAnatomy ? 0.35 : 1.0;

  // Create muscle geometry procedurally
  const muscleShape = useMemo(() => {
    const shape = new THREE.Shape();
    // Gluteus maximus cross-section shape
    shape.moveTo(-1.8, -0.5);
    shape.quadraticCurveTo(-2.0, 0.5, -1.5, 1.2);
    shape.quadraticCurveTo(-0.5, 1.8, 0.5, 1.5);
    shape.quadraticCurveTo(1.5, 1.0, 1.8, 0.2);
    shape.quadraticCurveTo(2.0, -0.8, 1.2, -1.2);
    shape.quadraticCurveTo(0, -1.5, -1.2, -1.2);
    shape.quadraticCurveTo(-1.8, -1.0, -1.8, -0.5);
    return shape;
  }, []);

  return (
    <group ref={groupRef} scale={[hipScale[0], hipScale[1], hipScale[2]]}>
      {/* Lower back / torso connection */}
      <mesh position={[0, 1.8, 0]}>
        <boxGeometry args={[3.2, 1.0, 1.8]} />
        <meshStandardMaterial
          color={skinColor}
          transparent={showAnatomy}
          opacity={skinOpacity}
          roughness={0.7}
          metalness={0.05}
        />
      </mesh>

      {/* Left buttock */}
      <mesh position={[-0.85, 0.3, 0.15]} scale={[1.0, 1.2, 1.0]}>
        <sphereGeometry args={[1.1, 32, 32]} />
        <meshStandardMaterial
          color={skinColor}
          transparent={showAnatomy}
          opacity={skinOpacity}
          roughness={0.65}
          metalness={0.05}
        />
      </mesh>

      {/* Right buttock */}
      <mesh position={[0.85, 0.3, 0.15]} scale={[1.0, 1.2, 1.0]}>
        <sphereGeometry args={[1.1, 32, 32]} />
        <meshStandardMaterial
          color={skinColor}
          transparent={showAnatomy}
          opacity={skinOpacity}
          roughness={0.65}
          metalness={0.05}
        />
      </mesh>

      {/* Gluteal cleft (subtle dark line) */}
      <mesh position={[0, 0.3, 0.35]}>
        <boxGeometry args={[0.05, 2.2, 0.3]} />
        <meshStandardMaterial color="#c4956e" roughness={1} />
      </mesh>

      {/* Upper thighs */}
      <mesh position={[-0.9, -1.2, 0]} rotation={[0.1, 0, 0.05]}>
        <cylinderGeometry args={[0.65, 0.55, 1.5, 16]} />
        <meshStandardMaterial
          color={skinColor}
          transparent={showAnatomy}
          opacity={skinOpacity}
          roughness={0.7}
        />
      </mesh>
      <mesh position={[0.9, -1.2, 0]} rotation={[0.1, 0, -0.05]}>
        <cylinderGeometry args={[0.65, 0.55, 1.5, 16]} />
        <meshStandardMaterial
          color={skinColor}
          transparent={showAnatomy}
          opacity={skinOpacity}
          roughness={0.7}
        />
      </mesh>

      {/* ===== Safe Zone (Upper Outer Quadrant - Left buttock) ===== */}
      {safeZoneGlow && (
        <mesh ref={glowRef} position={[-1.3, 0.8, 0.6]} rotation={[0, 0, 0.2]}>
          <circleGeometry args={[0.55, 32]} />
          <meshStandardMaterial
            color="#22c55e"
            emissive="#22c55e"
            emissiveIntensity={0.4}
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Quadrant lines on left buttock */}
      {/* Horizontal */}
      <mesh position={[-0.85, 0.3, 0.65]}>
        <boxGeometry args={[2.0, 0.02, 0.02]} />
        <meshBasicMaterial color="#166534" transparent opacity={0.4} />
      </mesh>
      {/* Vertical */}
      <mesh position={[-0.85, 0.3, 0.65]}>
        <boxGeometry args={[0.02, 2.0, 0.02]} />
        <meshBasicMaterial color="#166534" transparent opacity={0.4} />
      </mesh>

      {/* ===== Anatomy (visible when toggled) ===== */}
      {showAnatomy && (
        <>
          {/* Pelvis bone */}
          <mesh position={[0, 1.2, -0.3]}>
            <torusGeometry args={[1.5, 0.2, 8, 24, Math.PI]} />
            <meshStandardMaterial color="#f5f0e0" roughness={0.9} metalness={0.1} />
          </mesh>
          {/* Iliac crests */}
          <mesh position={[-1.4, 1.6, -0.2]} rotation={[0, 0, 0.5]}>
            <boxGeometry args={[0.8, 0.15, 0.4]} />
            <meshStandardMaterial color="#ede8d5" roughness={0.9} />
          </mesh>
          <mesh position={[1.4, 1.6, -0.2]} rotation={[0, 0, -0.5]}>
            <boxGeometry args={[0.8, 0.15, 0.4]} />
            <meshStandardMaterial color="#ede8d5" roughness={0.9} />
          </mesh>
          {/* Sacrum */}
          <mesh position={[0, 0.8, -0.4]}>
            <coneGeometry args={[0.4, 1.0, 6]} />
            <meshStandardMaterial color="#e8e0cc" roughness={0.9} />
          </mesh>

          {/* Sciatic nerve (red tube) */}
          <mesh position={[0.5, -0.2, -0.1]}>
            <tubeGeometry
              args={[
                new THREE.CatmullRomCurve3([
                  new THREE.Vector3(0, 1.2, 0),
                  new THREE.Vector3(0.1, 0.5, 0.1),
                  new THREE.Vector3(0, -0.3, 0.05),
                  new THREE.Vector3(-0.1, -1.0, 0),
                ]),
                32, 0.08, 8, false
              ]}
            />
            <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={0.3} />
          </mesh>

          {/* Gluteal muscles (visible through transparent skin) */}
          <mesh position={[-0.85, 0.3, 0]} scale={[0.5, 0.5, 0.3]}>
            <extrudeGeometry args={[muscleShape, { depth: 1.5, bevelEnabled: true, bevelSize: 0.2, bevelThickness: 0.1 }]} />
            <meshStandardMaterial color="#c44" transparent opacity={0.5} roughness={0.8} />
          </mesh>
        </>
      )}
    </group>
  );
};

export default GlutealModel;
