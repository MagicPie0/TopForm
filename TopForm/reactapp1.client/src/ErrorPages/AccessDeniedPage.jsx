import React, { Suspense, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import '../Design/accessDenied.css';

function BodyguardModel() {
  const { scene } = useGLTF('/model/bodyguard.glb');
  return <primitive object={scene} scale={2} position-y={0} rotation-y={Math.PI/4} />;
}

const AccessDeniedPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('fitness-theme');
    return () => {
      document.body.classList.remove('fitness-theme');
    };
  }, []);

  return (
    <div className="fitness-container">
      {/* Animated pulse elements */}
      <div className="pulse-circle pulse-1"></div>
      <div className="pulse-circle pulse-2"></div>
      
      {/* Header with subtle animation */}
      <div className="fitness-header">
        <h2 className="fitness-title animate-text">ACCESS</h2>
        <h1 className="fitness-denied animate-text">RESTRICTED</h1>
        <div className="fitness-divider pulse" />
      </div>

      {/* Content area with side-by-side layout */}
      <div className="fitness-content fade-in">
        <div className="text-content">
          <div className="fitness-text">
            <h3 className="fitness-warning slide-in">MEMBERS ONLY AREA</h3>
            <p className="fitness-message slide-in">
              This section is reserved for authorized personnel only.
              <br />
              Please sign in with your credentials or return to the main page.
            </p>

            <div className="fitness-buttons">
              <button 
                onClick={() => navigate('/login')}
                className="fitness-button fitness-primary hover-grow"
              >
                SIGN IN
              </button>
              
              <button 
                onClick={() => navigate('/')}
                className="fitness-button fitness-secondary hover-grow"
              >
                RETURN HOME
              </button>
            </div>
          </div>
        </div>

        <div className="model-wrapper">
          <div className="fitness-model-container hover-glow">
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
        </div>
      </div>

      {/* Footer with subtle animation */}
      <div className="fitness-footer slide-up">
        © {new Date().getFullYear()} TOPFORM - ALL RIGHTS RESERVED
      </div>
    </div>
  );
};

export default AccessDeniedPage;