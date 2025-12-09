import React, { useMemo, useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS, TREE_CONFIG, getScatterPosition, getTreePosition, easeInOutCubic } from '../constants';
import { AppState, OrnamentData } from '../types';

interface OrnamentsProps {
  appState: AppState;
}

const Ornaments: React.FC<OrnamentsProps> = ({ appState }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const progressRef = useRef(0);
  
  // Data Generation
  const data = useMemo(() => {
    const items: OrnamentData[] = [];
    const count = TREE_CONFIG.ornamentCount;
    
    for (let i = 0; i < count; i++) {
      // Tree position: more restricted to surface
      const yRatio = Math.random();
      // Ensure ornaments are mostly on the outer shell
      const height = TREE_CONFIG.height;
      const y = (yRatio - 0.5) * height;
      const r = (1 - yRatio) * TREE_CONFIG.radius * 0.9; // Slightly inside the needles
      const angle = Math.random() * Math.PI * 2;
      
      const treePos = new THREE.Vector3(
        r * Math.cos(angle),
        y,
        r * Math.sin(angle)
      );

      const scatterPos = getScatterPosition(TREE_CONFIG.scatterRadius);

      items.push({
        id: i,
        scatterPos,
        treePos,
        rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0),
        scale: Math.random() * 0.4 + 0.2, // Random size
        type: Math.random() > 0.3 ? 'sphere' : 'box',
        color: Math.random() > 0.5 ? COLORS.gold : COLORS.goldLight,
        speed: Math.random() * 0.5 + 0.2
      });
    }
    return items;
  }, []);

  // Temporary objects to avoid garbage collection
  const tempObj = useMemo(() => new THREE.Object3D(), []);
  const tempVec = useMemo(() => new THREE.Vector3(), []);
  
  useLayoutEffect(() => {
    if (meshRef.current) {
      // Set initial colors
      data.forEach((item, i) => {
        meshRef.current?.setColorAt(i, new THREE.Color(item.color));
      });
      meshRef.current.instanceColor!.needsUpdate = true;
    }
  }, [data]);

  useFrame((state) => {
    if (!meshRef.current) return;

    const target = appState === AppState.TREE_SHAPE ? 1 : 0;
    // Slower transition for heavy objects
    progressRef.current = THREE.MathUtils.lerp(progressRef.current, target, 0.02);
    const t = easeInOutCubic(progressRef.current);

    data.forEach((item, i) => {
      // Interpolate position
      tempVec.lerpVectors(item.scatterPos, item.treePos, t);
      
      // Add floating animation
      // When t is 0 (scattered), float more. When t is 1 (tree), float barely.
      const floatIntensity = (1 - t) * 2.0 + (t * 0.1);
      const time = state.clock.elapsedTime;
      
      tempVec.y += Math.sin(time * item.speed + item.id) * floatIntensity * 0.1;
      tempVec.x += Math.cos(time * item.speed * 0.5 + item.id) * floatIntensity * 0.05;

      tempObj.position.copy(tempVec);
      
      // Rotate
      tempObj.rotation.x = item.rotation.x + time * 0.2 * (1-t);
      tempObj.rotation.y = item.rotation.y + time * 0.3;
      tempObj.rotation.z = item.rotation.z;

      tempObj.scale.setScalar(item.scale * (0.8 + 0.2 * Math.sin(time * 2 + item.id)));

      tempObj.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObj.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, TREE_CONFIG.ornamentCount]}
      castShadow
      receiveShadow
    >
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        color={COLORS.gold}
        roughness={0.1}
        metalness={0.9}
        emissive={COLORS.goldDark}
        emissiveIntensity={0.2}
      />
    </instancedMesh>
  );
};

export default Ornaments;
