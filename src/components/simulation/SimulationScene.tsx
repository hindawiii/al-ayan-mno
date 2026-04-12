import React, { useState, useCallback, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html, Environment, ContactShadows } from "@react-three/drei";
import GlutealModel from "./GlutealModel";
import SyringeModel from "./SyringeModel";

interface SimulationSceneProps {
  gender: "male" | "female";
  showAnatomy: boolean;
  onInjectResult: (result: "success" | "fail") => void;
}

// Safe zone bounds (upper outer quadrant of left buttock)
const SAFE_ZONE = { xMin: -2.0, xMax: -0.6, yMin: 0.4, yMax: 1.4 };

const checkInjectionZone = (pos: [number, number, number]): "success" | "fail" => {
  const [x, y] = pos;
  if (x >= SAFE_ZONE.xMin && x <= SAFE_ZONE.xMax && y >= SAFE_ZONE.yMin && y <= SAFE_ZONE.yMax) {
    return "success";
  }
  return "fail";
};

const SceneContent = ({ gender, showAnatomy, onInjectResult }: SimulationSceneProps) => {
  const [syringePos, setSyringePos] = useState<[number, number, number]>([0, 2.5, 1.5]);
  const [injecting, setInjecting] = useState(false);

  const handleDoubleClick = useCallback(() => {
    if (injecting) return;
    setInjecting(true);
  }, [injecting]);

  const handleInjectComplete = useCallback(() => {
    setInjecting(false);
    const result = checkInjectionZone(syringePos);
    onInjectResult(result);
    // Reset syringe after delay
    setTimeout(() => setSyringePos([0, 2.5, 1.5]), 1500);
  }, [syringePos, onInjectResult]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
      <directionalLight position={[-3, 4, -2]} intensity={0.4} color="#b0c4ff" />
      <pointLight position={[0, 0, 4]} intensity={0.5} color="#fff5ee" />

      {/* Environment for realistic reflections */}
      <Environment preset="studio" />

      {/* Ground shadow */}
      <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={8} blur={2} />

      {/* Gluteal model */}
      <group position={[0, -0.3, 0]} onDoubleClick={handleDoubleClick}>
        <GlutealModel gender={gender} showAnatomy={showAnatomy} safeZoneGlow={!injecting} />
      </group>

      {/* 3D Arabic labels */}
      {showAnatomy && (
        <>
          <Html position={[-0.85, 1.8, 0.8]} center style={{ pointerEvents: "none" }}>
            <div className="bg-card/90 backdrop-blur-sm px-3 py-1 rounded-lg border border-primary/30 shadow-lg whitespace-nowrap">
              <span className="text-xs font-bold text-primary" style={{ fontFamily: "Cairo, sans-serif" }}>
                المنطقة الألوية الظهرية
              </span>
            </div>
          </Html>
          <Html position={[0.6, 0.0, 0.8]} center style={{ pointerEvents: "none" }}>
            <div className="bg-destructive/90 backdrop-blur-sm px-3 py-1 rounded-lg border border-destructive shadow-lg whitespace-nowrap">
              <span className="text-xs font-bold text-white" style={{ fontFamily: "Cairo, sans-serif" }}>
                ⚠️ العصب الوركي
              </span>
            </div>
          </Html>
          <Html position={[0, 1.5, -0.5]} center style={{ pointerEvents: "none" }}>
            <div className="bg-card/90 backdrop-blur-sm px-3 py-1 rounded-lg border border-muted-foreground/30 shadow-lg whitespace-nowrap">
              <span className="text-xs font-bold text-muted-foreground" style={{ fontFamily: "Cairo, sans-serif" }}>
                🦴 الحوض
              </span>
            </div>
          </Html>
        </>
      )}

      {/* Safe zone label (always visible) */}
      <Html position={[-1.3, 1.5, 0.8]} center style={{ pointerEvents: "none" }}>
        <div className="bg-primary/20 backdrop-blur-sm px-2 py-0.5 rounded border border-primary/40 whitespace-nowrap">
          <span className="text-[10px] font-bold text-primary" style={{ fontFamily: "Cairo, sans-serif" }}>
            ✅ الربع الخارجي العلوي
          </span>
        </div>
      </Html>

      {/* Syringe */}
      <SyringeModel
        position={syringePos}
        onPositionChange={setSyringePos}
        injecting={injecting}
        onInjectComplete={handleInjectComplete}
      />

      {/* Orbit controls */}
      <OrbitControls
        enablePan={false}
        minDistance={3}
        maxDistance={10}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.5}
        target={[0, 0, 0]}
      />
    </>
  );
};

const SimulationScene = (props: SimulationSceneProps) => {
  return (
    <div className="w-full h-full min-h-[500px] rounded-xl overflow-hidden bg-gradient-to-b from-muted/30 to-muted/60">
      <Canvas
        camera={{ position: [0, 1, 5], fov: 45 }}
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={
          <Html center>
            <div className="text-primary font-bold animate-pulse" style={{ fontFamily: "Cairo" }}>
              جاري تحميل المحاكاة...
            </div>
          </Html>
        }>
          <SceneContent {...props} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default SimulationScene;
