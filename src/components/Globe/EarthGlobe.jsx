import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import { MapPin } from 'lucide-react';

const GLOBE_RADIUS = 2.0;

// Coordinate converter from Lat/Lon to 3D Cartesian coordinates
export function latLonToVector3(lat, lon, radius = GLOBE_RADIUS) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = (radius * Math.sin(phi) * Math.sin(theta));
  const y = (radius * Math.cos(phi));

  return new THREE.Vector3(x, y, z);
}

// 3D Location Marker on Globe
function LocationMarker({ lat, lon, locationName, anomalySeverity }) {
  const markerPos = useMemo(() => {
    return latLonToVector3(lat, lon, GLOBE_RADIUS * 1.015);
  }, [lat, lon]);

  const ringRef = useRef();

  useFrame(({ clock }) => {
    if (ringRef.current) {
      const t = clock.getElapsedTime();
      const scale = 1 + 0.3 * Math.sin(t * 3);
      ringRef.current.scale.set(scale, scale, scale);
    }
  });

  const getMarkerColor = (sev) => {
    switch (sev) {
      case 'severe':
      case 'extreme': return '#ef4444';
      case 'high': return '#f97316';
      case 'moderate': return '#f59e0b';
      default: return '#00f2fe';
    }
  };

  const markerColor = getMarkerColor(anomalySeverity);

  return (
    <group position={markerPos}>
      {/* Central Glowing Pin */}
      <mesh>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshBasicMaterial color={markerColor} />
      </mesh>

      {/* Pulsing Outer Ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.045, 0.065, 32]} />
        <meshBasicMaterial 
          color={markerColor} 
          side={THREE.DoubleSide} 
          transparent 
          opacity={0.7} 
        />
      </mesh>

      {/* Futuristic HTML Tag */}
      <Html distanceFactor={8} position={[0, 0.08, 0]} center>
        <div className="pointer-events-none select-none flex flex-col items-center">
          <div className="px-2 py-0.5 rounded bg-slate-950/90 border border-cyan-400/60 shadow-[0_0_12px_rgba(0,242,254,0.6)] text-[9px] font-mono text-cyan-300 font-bold whitespace-nowrap">
            {locationName || 'Target Location'}
          </div>
          <div className="w-1.5 h-1.5 bg-cyan-400 rotate-45 -mt-0.5" />
        </div>
      </Html>
    </group>
  );
}

// Earth Sphere with Day Texture & Clouds & Atmosphere
function EarthMesh({ lat, lon, onGlobeClick }) {
  const earthRef = useRef();
  const cloudsRef = useRef();

  // Load textures
  const [dayMap, nightMap, cloudsMap] = useLoader(THREE.TextureLoader, [
    '/textures/earth_day.jpg',
    '/textures/earth_night.jpg',
    '/textures/earth_clouds.png'
  ]);

  // Subtle rotation when user is not manually dragging
  useFrame(({ clock }, delta) => {
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.025;
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    if (!e.point) return;
    
    // Convert 3D hit point back to lat/lon
    const point = e.point.clone().normalize();
    const lat = 90 - (Math.acos(point.y) * 180 / Math.PI);
    let lon = ((Math.atan2(point.z, -point.x) * 180 / Math.PI) - 180);
    while (lon < -180) lon += 360;
    while (lon > 180) lon -= 360;

    if (onGlobeClick) {
      onGlobeClick(lat, lon);
    }
  };

  return (
    <group ref={earthRef}>
      {/* Core Earth Sphere */}
      <mesh onClick={handleClick}>
        <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
        <meshStandardMaterial
          map={dayMap}
          roughness={0.65}
          metalness={0.1}
        />
      </mesh>

      {/* Atmosphere Rim Glow */}
      <mesh scale={[1.025, 1.025, 1.025]}>
        <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
        <meshStandardMaterial
          color="#38bdf8"
          transparent
          opacity={0.12}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Cloud Layer */}
      <mesh ref={cloudsRef} scale={[1.015, 1.015, 1.015]} pointerEvents="none">
        <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
        <meshStandardMaterial
          map={cloudsMap}
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// Camera Flight Controller to smoothly move camera towards target lat/lon
function CameraController({ targetLat, targetLon, controlsRef }) {
  useEffect(() => {
    if (!controlsRef.current) return;
    
    // Desired camera position in front of target point
    const targetVector = latLonToVector3(targetLat, targetLon, 4.5);
    const controls = controlsRef.current;
    
    // Smooth transition
    let progress = 0;
    const startPos = controls.object.position.clone();
    
    const animateCamera = () => {
      progress += 0.04;
      if (progress < 1) {
        controls.object.position.lerpVectors(startPos, targetVector, progress);
        controls.update();
        requestAnimationFrame(animateCamera);
      } else {
        controls.object.position.copy(targetVector);
        controls.update();
      }
    };
    
    animateCamera();
  }, [targetLat, targetLon, controlsRef]);

  return null;
}

export default function EarthGlobe({
  currentLocation,
  anomalySeverity = 'normal',
  onSelectCoords
}) {
  const controlsRef = useRef();

  return (
    <div className="relative w-full h-full min-h-[420px] bg-[#030712] rounded-xl overflow-hidden border border-cyan-500/20 shadow-2xl">
      {/* 3D Scene Canvas */}
      <Canvas
        camera={{ position: [0, 1.2, 4.5], fov: 45 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#040814']} />
        
        {/* Deep Space Background Stars */}
        <Stars radius={100} depth={50} count={3500} factor={4} saturation={0} fade speed={1} />
        
        {/* Lighting Setup */}
        <ambientLight intensity={0.45} />
        <directionalLight position={[6, 3, 5]} intensity={1.8} color="#ffffff" />
        <directionalLight position={[-6, -3, -5]} intensity={0.2} color="#00f2fe" />

        {/* Earth Mesh */}
        <EarthMesh 
          lat={currentLocation.lat} 
          lon={currentLocation.lon} 
          onGlobeClick={(lat, lon) => {
            if (onSelectCoords) onSelectCoords(lat, lon);
          }}
        />

        {/* Location Marker */}
        <LocationMarker
          lat={currentLocation.lat}
          lon={currentLocation.lon}
          locationName={currentLocation.name}
          anomalySeverity={anomalySeverity}
        />

        {/* Smooth Camera Flight */}
        <CameraController
          targetLat={currentLocation.lat}
          targetLon={currentLocation.lon}
          controlsRef={controlsRef}
        />

        {/* Interactive Controls */}
        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          minDistance={2.6}
          maxDistance={7.5}
          rotateSpeed={0.65}
          zoomSpeed={0.8}
          dampingFactor={0.05}
        />
      </Canvas>

      {/* Floating HUD Overlay */}
      <div className="absolute top-3 left-3 pointer-events-none z-10 flex flex-col gap-1.5">
        <div className="px-2.5 py-1 rounded bg-slate-950/80 border border-cyan-500/40 text-[10px] font-mono text-cyan-300 backdrop-blur-md flex items-center gap-1.5 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>3D ORBITAL TELEMETRY</span>
        </div>
        <div className="px-2 py-0.5 rounded bg-black/60 text-[9px] font-mono text-slate-400">
          Target: {currentLocation.lat?.toFixed(2)}°N, {currentLocation.lon?.toFixed(2)}°E
        </div>
      </div>

      {/* Interaction Hint */}
      <div className="absolute bottom-3 right-3 pointer-events-none z-10 text-[10px] font-mono text-slate-400 bg-black/70 px-2 py-1 rounded border border-slate-800">
        Drag to rotate • Scroll to zoom • Click surface to target
      </div>
    </div>
  );
}
