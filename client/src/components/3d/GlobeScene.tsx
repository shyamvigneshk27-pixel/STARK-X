import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';

interface CityDot {
  lat: number;
  lng: number;
  name: string;
}

function latLngToVector3(lat: number, lng: number, radius = 1.02): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(Math.sin(phi) * Math.cos(theta)) * radius;
  const y = Math.cos(phi) * radius;
  const z = Math.sin(phi) * Math.sin(theta) * radius;
  return [x, y, z];
}

function Globe() {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003;
    }
  });

  return (
    <group>
      {/* Core globe */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          color="#0f1729"
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[1.05, 64, 64]} />
        <meshBasicMaterial
          color="#7c3aed"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Grid wireframe */}
      <mesh>
        <sphereGeometry args={[1.01, 32, 32]} />
        <meshBasicMaterial
          color="#7c3aed"
          wireframe
          transparent
          opacity={0.06}
        />
      </mesh>
    </group>
  );
}

function CityMarker({ city }: { city: CityDot }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = React.useState(false);
  const position = latLngToVector3(city.lat, city.lng);

  useFrame(() => {
    if (meshRef.current) {
      const targetScale = hovered ? 2 : 1;
      meshRef.current.scale.setScalar(
        THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.1)
      );
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <sphereGeometry args={[0.012, 8, 8]} />
      <meshBasicMaterial color={hovered ? '#f472b6' : '#a78bfa'} />
      {hovered && (
        <Html distanceFactor={6}>
          <div
            style={{
              background: 'rgba(15,15,25,0.95)',
              border: '1px solid rgba(124,58,237,0.5)',
              borderRadius: '8px',
              padding: '4px 10px',
              color: 'white',
              fontSize: '12px',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}
          >
            {city.name}
          </div>
        </Html>
      )}
    </mesh>
  );
}

export default function GlobeScene({ cities = [] }: { cities?: CityDot[] }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 2.5], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[2, 3, 2]} intensity={1.5} color="#a78bfa" />
      <pointLight position={[-2, -1, 1]} intensity={0.5} color="#60a5fa" />

      <Globe />

      {cities.map((city, i) => (
        <CityMarker key={i} city={city} />
      ))}

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        dampingFactor={0.05}
        enableDamping
        autoRotate={false}
      />
    </Canvas>
  );
}
