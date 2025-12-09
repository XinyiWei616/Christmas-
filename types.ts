import * as THREE from 'three';

// Augment JSX.IntrinsicElements to include React Three Fiber elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      points: any;
      bufferGeometry: any;
      bufferAttribute: any;
      shaderMaterial: any;
      instancedMesh: any;
      sphereGeometry: any;
      meshStandardMaterial: any;
      ambientLight: any;
      spotLight: any;
      pointLight: any;
      color: any;
    }
  }
}

export enum AppState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE',
}

export interface ParticleProps {
  count: number;
  color: string;
  radius: number;
}

export interface OrnamentData {
  id: number;
  scatterPos: THREE.Vector3;
  treePos: THREE.Vector3;
  rotation: THREE.Euler;
  scale: number;
  type: 'box' | 'sphere' | 'star';
  color: string;
  speed: number; // For floating animation
}