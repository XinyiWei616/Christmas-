import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS, TREE_CONFIG, getScatterPosition, getTreePosition } from '../constants';
import { AppState } from '../types';

// --- Custom Shader Material for High Performance Morphing ---
const vertexShader = `
  uniform float uTime;
  uniform float uProgress; // 0 = Scattered, 1 = Tree
  uniform float uPixelRatio;

  attribute vec3 aScatterPos;
  attribute vec3 aTreePos;
  attribute float aRandom;
  attribute float aSize;

  varying vec3 vColor;
  varying float vAlpha;

  // Cubic Bezier Ease
  float ease(float t) {
    return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
  }

  void main() {
    float t = ease(uProgress);
    
    // Mix positions based on progress
    vec3 pos = mix(aScatterPos, aTreePos, t);
    
    // Add "Breathing" and "Floating" effect
    // Chaos when scattered, rhythmic when tree
    float floatSpeed = mix(0.5, 1.5, t);
    float floatAmp = mix(0.5, 0.1, t); // Move less when in tree form
    
    pos.y += sin(uTime * floatSpeed + aRandom * 10.0) * floatAmp;
    pos.x += cos(uTime * 0.3 + aRandom * 5.0) * floatAmp * 0.5;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Size attenuation
    gl_PointSize = aSize * uPixelRatio * (20.0 / -mvPosition.z);
    
    // Twinkle effect
    float sparkle = sin(uTime * 3.0 + aRandom * 20.0);
    vAlpha = 0.6 + 0.4 * sparkle; 
  }
`;

const fragmentShader = `
  uniform vec3 uColorBase;
  uniform vec3 uColorTip;
  
  varying float vAlpha;

  void main() {
    // Circular particle
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    if (dist > 0.5) discard;

    // Soft glow edge
    float glow = 1.0 - (dist * 2.0);
    glow = pow(glow, 1.5);

    // Mix colors slightly
    vec3 finalColor = mix(uColorBase, uColorTip, glow);

    gl_FragColor = vec4(finalColor, vAlpha * glow);
  }
`;

interface TreeParticlesProps {
  appState: AppState;
}

const TreeParticles: React.FC<TreeParticlesProps> = ({ appState }) => {
  const meshRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  // Target progress for animation
  const targetProgress = useRef(0);
  
  // Geometry Data Generation
  const { positions, scatterPos, treePos, randoms, sizes } = useMemo(() => {
    const count = TREE_CONFIG.particleCount;
    const pos = new Float32Array(count * 3);
    const scat = new Float32Array(count * 3);
    const tree = new Float32Array(count * 3);
    const rnd = new Float32Array(count);
    const sz = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Tree Shape
      const yRatio = Math.random(); // 0 to 1
      const tPos = getTreePosition(yRatio, TREE_CONFIG.radius, TREE_CONFIG.height);
      tree[i * 3] = tPos.x;
      tree[i * 3 + 1] = tPos.y;
      tree[i * 3 + 2] = tPos.z;

      // Scatter Shape
      const sPos = getScatterPosition(TREE_CONFIG.scatterRadius);
      scat[i * 3] = sPos.x;
      scat[i * 3 + 1] = sPos.y;
      scat[i * 3 + 2] = sPos.z;

      // Initial buffer (start at scattered)
      pos[i * 3] = sPos.x;
      pos[i * 3 + 1] = sPos.y;
      pos[i * 3 + 2] = sPos.z;

      rnd[i] = Math.random();
      // Size variation: smaller at top of tree usually looks better, but random is fine for style
      sz[i] = Math.random() * 0.5 + 0.5; 
    }

    return { 
      positions: pos, 
      scatterPos: scat, 
      treePos: tree, 
      randoms: rnd, 
      sizes: sz 
    };
  }, []);

  useFrame((state) => {
    if (!materialRef.current) return;

    // Time update
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;

    // Lerp progress based on state
    const target = appState === AppState.TREE_SHAPE ? 1.0 : 0.0;
    // Smooth damp
    targetProgress.current = THREE.MathUtils.lerp(targetProgress.current, target, 0.04);
    
    materialRef.current.uniforms.uProgress.value = targetProgress.current;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aScatterPos"
          count={scatterPos.length / 3}
          array={scatterPos}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aTreePos"
          count={treePos.length / 3}
          array={treePos}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={randoms.length}
          array={randoms}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aSize"
          count={sizes.length}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uProgress: { value: 0 },
          uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
          uColorBase: { value: new THREE.Color(COLORS.emeraldDeep) },
          uColorTip: { value: new THREE.Color(COLORS.emeraldLight) } // Using a lighter green/goldish tip
        }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default TreeParticles;
