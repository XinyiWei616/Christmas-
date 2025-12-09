import * as THREE from 'three';

// --- Palette ---
export const COLORS = {
  bg: '#000502',
  emeraldDeep: '#002816',
  emeraldLight: '#006B3C',
  gold: '#D4AF37',
  goldLight: '#FEDC56',
  goldDark: '#AA8822',
  glow: '#4fffa1'
};

// --- Configuration ---
export const TREE_CONFIG = {
  height: 12,
  radius: 4.5,
  particleCount: 4000,
  ornamentCount: 150,
  scatterRadius: 25,
};

// --- Math Helpers ---

// Generate a point on a cone surface (Christmas Tree shape)
export const getTreePosition = (yRatio: number, maxRadius: number, height: number): THREE.Vector3 => {
  // yRatio is 0 (bottom) to 1 (top)
  const y = (yRatio - 0.5) * height; // Center vertically
  const radiusAtY = (1 - yRatio) * maxRadius;
  const angle = Math.random() * Math.PI * 2;
  
  // Add some internal volume, not just surface
  const r = radiusAtY * Math.sqrt(Math.random()); 
  
  const x = r * Math.cos(angle);
  const z = r * Math.sin(angle);
  return new THREE.Vector3(x, y, z);
};

// Generate a random point in a sphere (Scattered shape)
export const getScatterPosition = (radius: number): THREE.Vector3 => {
  const v = new THREE.Vector3(
    Math.random() - 0.5,
    Math.random() - 0.5,
    Math.random() - 0.5
  );
  v.normalize().multiplyScalar(radius * (0.5 + Math.random() * 0.5));
  return v;
};

// Cubic ease in-out for smoother custom interpolation
export const easeInOutCubic = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
