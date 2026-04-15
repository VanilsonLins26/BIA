import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const FRAGMENT_COUNT = 120;
const SPHERE_RADIUS = 2.2;

function Fragment({ position, scale }: { position: [number, number, number]; scale: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const speed = useMemo(() => 0.3 + Math.random() * 0.5, []);
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    meshRef.current.position.y = position[1] + Math.sin(t * speed + offset) * 0.15;
    meshRef.current.rotation.x = t * speed * 0.5;
    meshRef.current.rotation.z = t * speed * 0.3;
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <tetrahedronGeometry args={[0.08, 0]} />
      <meshStandardMaterial
        color="#C9A4E8"
        emissive="#9b6cc4"
        emissiveIntensity={0.3}
        metalness={0.6}
        roughness={0.3}
        transparent
        opacity={0.85}
      />
    </mesh>
  );
}

function ConnectionLines({ points }: { points: [number, number, number][] }) {
  const lineRef = useRef<THREE.LineSegments>(null);
  
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions: number[] = [];
    const maxDist = 0.9;

    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const dx = points[i][0] - points[j][0];
        const dy = points[i][1] - points[j][1];
        const dz = points[i][2] - points[j][2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < maxDist) {
          positions.push(...points[i], ...points[j]);
        }
      }
    }

    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return geo;
  }, [points]);

  useFrame(({ clock }) => {
    if (lineRef.current) {
      lineRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <lineSegments ref={lineRef} geometry={geometry}>
      <lineBasicMaterial color="#C9A4E8" transparent opacity={0.12} />
    </lineSegments>
  );
}

function SphereGroup() {
  const groupRef = useRef<THREE.Group>(null);

  const fragments = useMemo(() => {
    const pts: { position: [number, number, number]; scale: number }[] = [];
    for (let i = 0; i < FRAGMENT_COUNT; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const r = SPHERE_RADIUS * (0.85 + Math.random() * 0.3);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      pts.push({ position: [x, y, z], scale: 0.6 + Math.random() * 0.8 });
    }
    return pts;
  }, []);

  const points = useMemo(() => fragments.map((f) => f.position), [fragments]);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.08;
      groupRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.03) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {fragments.map((f, i) => (
        <Fragment key={i} position={f.position} scale={f.scale} />
      ))}
      <ConnectionLines points={points} />
    </group>
  );
}

const NeuralSphere = () => {
  return (
    <div className="w-72 h-72 md:w-96 md:h-96">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} color="#F5B7D3" />
        <pointLight position={[-3, -3, 2]} intensity={0.4} color="#C9A4E8" />
        <SphereGroup />
      </Canvas>
    </div>
  );
};

export default NeuralSphere;
