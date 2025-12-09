import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import TreeParticles from './components/TreeParticles';
import Ornaments from './components/Ornaments';
import Overlay from './components/Overlay';
import PostEffects from './components/PostEffects';
import { AppState } from './types';
import { COLORS } from './constants';

const Scene: React.FC<{ appState: AppState }> = ({ appState }) => {
  return (
    <>
      <color attach="background" args={[COLORS.bg]} />
      
      <TreeParticles appState={appState} />
      <Ornaments appState={appState} />

      {/* Lighting */}
      <ambientLight intensity={0.2} color="#001100" />
      <spotLight
        position={[10, 20, 10]}
        angle={0.3}
        penumbra={1}
        intensity={2}
        color={COLORS.goldLight}
        castShadow
      />
      <pointLight position={[-10, 5, -10]} intensity={2} color={COLORS.emeraldLight} />
      {/* Central glow light inside the tree */}
      <pointLight position={[0, 0, 0]} intensity={1.5} distance={10} color="#ffaa00" />

      {/* Ground Reflection */}
      <ContactShadows 
        opacity={0.4} 
        scale={40} 
        blur={2} 
        far={10} 
        resolution={256} 
        color="#000000" 
      />

      <Environment preset="city" />
      <PostEffects />
      
      <OrbitControls 
        enablePan={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.8}
        minDistance={8}
        maxDistance={35}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  );
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.SCATTERED);

  return (
    <div className="w-full h-screen bg-black relative">
      <Suspense fallback={null}>
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: [0, 0, 25], fov: 45 }}
          gl={{ antialias: false, stencil: false, depth: true }}
        >
          <Scene appState={appState} />
        </Canvas>
      </Suspense>
      <Overlay appState={appState} setAppState={setAppState} />
    </div>
  );
};

export default App;
