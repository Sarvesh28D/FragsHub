'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { 
  EffectComposer, 
  Bloom, 
  ChromaticAberration, 
  Glitch, 
  Noise, 
  Scanline,
  DepthOfField
} from '@react-three/postprocessing';
import { 
  OrbitControls, 
  Text, 
  Environment, 
  MeshDistortMaterial, 
  Float,
  Sphere,
  Box,
  shaderMaterial
} from '@react-three/drei';
import * as THREE from 'three';
import { BlendFunction, GlitchMode } from 'postprocessing';

// Custom Cyberpunk Shader Material
const CyberpunkMaterial = shaderMaterial(
  {
    time: 0,
    color: new THREE.Color(0.0, 1.0, 1.0),
    glowColor: new THREE.Color(0.0, 1.0, 0.0),
    frequency: 10.0,
    amplitude: 0.1,
  },
  // Vertex shader
  `
    uniform float time;
    uniform float frequency;
    uniform float amplitude;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      
      vec3 pos = position;
      pos.x += sin(pos.y * frequency + time * 2.0) * amplitude;
      pos.y += cos(pos.x * frequency + time * 1.5) * amplitude;
      pos.z += sin(pos.x * frequency + pos.y * frequency + time) * amplitude * 0.5;
      
      vPosition = pos;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  // Fragment shader
  `
    uniform float time;
    uniform vec3 color;
    uniform vec3 glowColor;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
      vec2 uv = vUv;
      
      // Cyberpunk grid pattern
      vec2 grid = abs(fract(uv * 20.0) - 0.5);
      float line = smoothstep(0.0, 0.1, grid.x) * smoothstep(0.0, 0.1, grid.y);
      
      // Animated scanlines
      float scanline = sin(uv.y * 100.0 + time * 10.0) * 0.1 + 0.9;
      
      // Glitch effect
      float glitch = step(0.98, sin(time * 50.0 + uv.y * 100.0));
      uv.x += glitch * sin(time * 100.0) * 0.01;
      
      // Color mixing
      vec3 finalColor = mix(color, glowColor, line);
      finalColor *= scanline;
      
      // Electric glow
      float glow = pow(1.0 - dot(vNormal, vec3(0, 0, 1)), 2.0);
      finalColor += glowColor * glow * 0.5;
      
      // Data stream effect
      float stream = sin(uv.y * 50.0 - time * 20.0) * 0.1 + 0.9;
      finalColor *= stream;
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
);

extend({ CyberpunkMaterial });

// Matrix Rain Effect
function MatrixRain() {
  const meshRef = useRef();
  const { viewport } = useThree();
  
  const rainGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const count = 2000;
    
    for (let i = 0; i < count; i++) {
      positions.push(
        (Math.random() - 0.5) * viewport.width * 2,
        (Math.random() - 0.5) * viewport.height * 2,
        (Math.random() - 0.5) * 20
      );
      
      const color = new THREE.Color();
      color.setHSL(0.3, 1, Math.random() * 0.5 + 0.5);
      colors.push(color.r, color.g, color.b);
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    return geometry;
  }, [viewport]);
  
  useFrame((state) => {
    if (meshRef.current) {
      const positions = meshRef.current.geometry.attributes.position.array;
      
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] -= 0.1;
        if (positions[i] < -viewport.height) {
          positions[i] = viewport.height;
        }
      }
      
      meshRef.current.geometry.attributes.position.needsUpdate = true;
      meshRef.current.rotation.y += 0.001;
    }
  });
  
  return (
    <points ref={meshRef} geometry={rainGeometry}>
      <pointsMaterial size={0.05} vertexColors transparent opacity={0.8} />
    </points>
  );
}

// Cyber Orbs with Advanced Shaders
function CyberOrbs() {
  const groupRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });
  
  return (
    <group ref={groupRef}>
      {Array.from({ length: 8 }, (_, i) => (
        <Float key={i} speed={2 + i * 0.2} rotationIntensity={1} floatIntensity={2}>
          <Sphere
            position={[
              Math.cos((i / 8) * Math.PI * 2) * 15,
              Math.sin(i * 0.5) * 5,
              Math.sin((i / 8) * Math.PI * 2) * 15
            ]}
            scale={[1 + i * 0.1, 1 + i * 0.1, 1 + i * 0.1]}
          >
            <cyberpunkMaterial
              color={new THREE.Color(0, 1, 1)}
              glowColor={new THREE.Color(0, 1, 0)}
              frequency={10 + i * 2}
              amplitude={0.1}
            />
          </Sphere>
        </Float>
      ))}
    </group>
  );
}

// Animated Cyber Text
function CyberText({ children, position, ...props }) {
  const textRef = useRef();
  
  useFrame((state) => {
    if (textRef.current) {
      textRef.current.material.uniforms.time.value = state.clock.elapsedTime;
    }
  });
  
  return (
    <Text
      ref={textRef}
      position={position}
      fontSize={2}
      font="/fonts/orbitron-black.woff"
      anchorX="center"
      anchorY="middle"
      {...props}
    >
      {children}
      <cyberpunkMaterial
        color={new THREE.Color(0, 1, 1)}
        glowColor={new THREE.Color(1, 0, 1)}
        frequency={5}
        amplitude={0.05}
      />
    </Text>
  );
}

// Holographic Grid Floor
function HolographicGrid() {
  const gridRef = useRef();
  
  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.material.uniforms.time.value = state.clock.elapsedTime;
    }
  });
  
  return (
    <Box ref={gridRef} args={[100, 0.1, 100]} position={[0, -10, 0]}>
      <cyberpunkMaterial
        color={new THREE.Color(0, 0.5, 1)}
        glowColor={new THREE.Color(0, 1, 0)}
        frequency={2}
        amplitude={0.02}
      />
    </Box>
  );
}

// Main WebGL Gaming Scene
export default function WebGLGamingScene() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  return (
    <div className="w-full h-screen bg-black relative overflow-hidden">
      <Canvas
        camera={{ position: [0, 5, 20], fov: 75 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true
        }}
        dpr={[1, 2]}
      >
        {/* Lighting */}
        <ambientLight intensity={0.2} color="#00ffff" />
        <pointLight position={[10, 10, 10]} intensity={1} color="#ff0080" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00ff80" />
        <spotLight
          position={[0, 50, 0]}
          angle={0.15}
          penumbra={1}
          intensity={1}
          color="#ffffff"
          castShadow
        />
        
        {/* Environment */}
        <Environment preset="city" />
        
        {/* Custom Components */}
        <MatrixRain />
        <CyberOrbs />
        <HolographicGrid />
        
        {/* 3D Text */}
        <CyberText position={[0, 8, 0]}>FRAGSHUB</CyberText>
        <CyberText position={[0, 5, 0]} fontSize={1}>
          ULTIMATE GAMING EXPERIENCE
        </CyberText>
        
        {/* Controls */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2}
          minDistance={10}
          maxDistance={50}
        />
        
        {/* Post-processing Effects */}
        <EffectComposer>
          <Bloom
            intensity={1.5}
            kernelSize={3}
            luminanceThreshold={0.1}
            luminanceSmoothing={0.9}
            blendFunction={BlendFunction.SCREEN}
          />
          <ChromaticAberration
            offset={[0.002, 0.002]}
            blendFunction={BlendFunction.NORMAL}
          />
          <Glitch
            delay={[1.5, 3.5]}
            duration={[0.6, 1.0]}
            strength={[0.3, 1.0]}
            mode={GlitchMode.SPORADIC}
            active
            ratio={0.85}
          />
          <Noise opacity={0.1} />
          <Scanline
            density={1.25}
            opacity={0.1}
            blendFunction={BlendFunction.OVERLAY}
          />
          <DepthOfField focusDistance={0.02} focalLength={0.02} bokehScale={5} />
        </EffectComposer>
      </Canvas>
      
      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-4 left-4 text-cyan-400 font-mono text-sm">
          <div className="bg-black/50 p-2 rounded border border-cyan-400">
            <div className="animate-pulse">◉ SYSTEM ONLINE</div>
            <div>FPS: 60+ | GPU: ACCELERATED</div>
            <div>NEURAL LINK: ESTABLISHED</div>
          </div>
        </div>
        
        <div className="absolute top-4 right-4 text-green-400 font-mono text-sm">
          <div className="bg-black/50 p-2 rounded border border-green-400">
            <div>MATRIX RAIN: ACTIVE</div>
            <div>CYBER ORBS: 8 ENTITIES</div>
            <div>HOLOGRAM: STABLE</div>
          </div>
        </div>
        
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-purple-400 font-mono text-center">
          <div className="bg-black/50 p-4 rounded border border-purple-400">
            <div className="text-lg font-bold animate-pulse">WEBGL 2.0 POWERED</div>
            <div>CUSTOM SHADERS | REAL-TIME EFFECTS | GPU ACCELERATION</div>
          </div>
        </div>
      </div>
    </div>
  );
}
