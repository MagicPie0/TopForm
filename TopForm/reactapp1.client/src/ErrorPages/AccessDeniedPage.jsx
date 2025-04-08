import React, { Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import '../Design/accessDenied.css'; // CSS fájl importálása
function BodyguardModel() {
  const { scene } = useGLTF('/model/bodyguard.glb');
  return <primitive object={scene} scale={0.5} position-y={-1} />;
}

const AccessDeniedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="access-denied-container">
      {/* Fejléc */}
      <div className="header">
        <h2 className="title">Hozzáférés</h2>
        <h1 className="subtitle">Megtagadva</h1>
        <div className="divider" />
      </div>

      {/* Tartalom */}
      <div className="content">
        {/* 3D Modell */}
        <div className="model-container">
          <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 10, 5]} intensity={0.8} />
            <Suspense fallback={null}>
              <BodyguardModel />
            </Suspense>
            <OrbitControls 
              enableZoom={false}
              enablePan={false} 
              autoRotate
              autoRotateSpeed={1.5}
            />
          </Canvas>
        </div>

        {/* Szöveg és gombok */}
        <div className="text-container">
          <h3 className="text-title">Nincs hozzáférésed ehhez az oldalhoz</h3>
          <p className="text-description">
            Ez a tartalom védett terület. A megtekintéséhez be kell jelentkezned egy érvényes felhasználói fiókkal.
            Ha véletlenül kerültél ide, visszatérhetsz a főoldalra.
          </p>

          <div className="button-group">
            <button 
              onClick={() => navigate('/login')}
              className="primary-button"
            >
              Bejelentkezés
            </button>
            
            <button 
              onClick={() => navigate('/')}
              className="secondary-button"
            >
              Főoldal
            </button>
          </div>
        </div>
      </div>

      {/* Lábléc */}
      <div className="footer">
        © {new Date().getFullYear()} Minden jog fenntartva
      </div>
    </div>
  );
};

export default AccessDeniedPage;
