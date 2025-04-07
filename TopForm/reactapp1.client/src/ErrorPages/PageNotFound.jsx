import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import styled from "styled-components";
import { Suspense, useEffect } from "react";

// Előbetöltés (cache-el is!)
useGLTF.preload("/model/Error_modell.glb");

const PageNotFound = () => {
  return (
    <Container>
      <Content>
        <ErrorCode>404</ErrorCode>
        <ErrorMessage>Oops! Az oldal nem található</ErrorMessage>
        <Description>Úgy tűnik, az oldal amit keresel nem létezik.</Description>
        <HomeButton href="/mainPage">Vissza a főoldalra</HomeButton>
      </Content>

      <ModelContainer>
        <Suspense fallback={<FallbackText>Töltés...</FallbackText>}>
          <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 5], fov: 50 }}>
            {/* Optimalizált világítás */}
            <hemisphereLight intensity={1.2} groundColor="#444" />
            <pointLight position={[0, -3, 0]} intensity={0.6} color="#ff6600" />

            {/* 3D modell */}
            <ErrorModel />

            {/* Kontroller */}
            <OrbitControls enableZoom={false} autoRotate />
          </Canvas>
        </Suspense>
      </ModelContainer>
    </Container>
  );
};

// 🧠 3D modell – RAM-barát dispose kezelés
function ErrorModel() {
  const { scene } = useGLTF("/model/Error_modell.glb");

  useEffect(() => {
    return () => {
      scene.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    };
  }, [scene]);

  return <primitive object={scene} scale={1.5} position={[0, 0.5, 0]} />;
}

// 🎨 Stílusok
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background: #f8f9fa;

  @media (min-width: 768px) {
    flex-direction: row;
    gap: 4rem;
  }
`;

const Content = styled.div`
  text-align: center;
  max-width: 500px;
  margin-bottom: 2rem;

  @media (min-width: 768px) {
    text-align: left;
    margin-bottom: 0;
  }
`;

const ModelContainer = styled.div`
  width: 100%;
  height: 350px;

  @media (min-width: 768px) {
    width: 400px;
    height: 400px;
  }
`;

const FallbackText = styled.div`
  text-align: center;
  color: #6c757d;
  padding-top: 3rem;
`;

const ErrorCode = styled.h1`
  font-size: 6rem;
  margin: 0;
  color: #ff3e3e;
  line-height: 1;

  @media (min-width: 768px) {
    font-size: 8rem;
  }
`;

const ErrorMessage = styled.h2`
  font-size: 2rem;
  margin: 1rem 0;
  color: #343a40;

  @media (min-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Description = styled.p`
  font-size: 1.1rem;
  color: #6c757d;
  margin-bottom: 2rem;
`;

const HomeButton = styled.a`
  display: inline-block;
  padding: 0.8rem 2rem;
  background: #ff3e3e;
  color: white;
  text-decoration: none;
  border-radius: 50px;
  font-weight: bold;
  transition: all 0.3s ease;

  &:hover {
    background: #e03535;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 62, 62, 0.2);
  }
`;

export default PageNotFound;
