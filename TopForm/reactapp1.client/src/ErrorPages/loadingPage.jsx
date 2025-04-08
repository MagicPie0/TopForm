import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';

const LoadingPage = () => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsComplete(true);
          return 100;
        }
        return prev + Math.random() * 10;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <LoadingContainer>
      <AnimatePresence>
        {!isComplete ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="loading-content"
          >
            <LoaderContainer>
              <Spinner
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <SpinnerTrack />
                <SpinnerFill />
              </Spinner>
            </LoaderContainer>

            <ProgressContainer>
              <motion.div
                className="progress-bar"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: progress / 100 }}
                transition={{ duration: 0.3 }}
              />
              <ProgressText>{Math.min(progress, 100)}%</ProgressText>
            </ProgressContainer>

            <LoadingMessage>
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{
                  duration: 2,
                  repeat: Infinity
                }}
              >
                Preparing your experience...
              </motion.span>
            </LoadingMessage>

            <ParticleContainer>
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={i}
                  className="particle"
                  initial={{
                    x: Math.random() * 100 - 50,
                    y: Math.random() * 100 - 50,
                    opacity: 0
                  }}
                  animate={{
                    x: Math.random() * 200 - 100,
                    y: Math.random() * 200 - 100,
                    opacity: [0, 0.7, 0],
                    scale: [0.5, 1.5, 0.5]
                  }}
                  transition={{
                    duration: Math.random() * 3 + 2,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </ParticleContainer>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="completion-content"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20
              }}
            >
              <Checkmark viewBox="0 0 52 52">
                <motion.path
                  fill="none"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeMiterlimit="10"
                  d="M14.1 27.2l7.1 7.2 16.7-16.8"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.2
                  }}
                />
              </Checkmark>
            </motion.div>
            <CompletionMessage>
              Ready to go!
            </CompletionMessage>
          </motion.div>
        )}
      </AnimatePresence>
    </LoadingContainer>
  );
};

// Styled Components
const LoadingContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: white;
  z-index: 9999;
  overflow: hidden;

  .loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 90%;
    max-width: 400px;
  }

  .completion-content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
`;

const LoaderContainer = styled.div`
  margin-bottom: 40px;
  width: 80px;
  height: 80px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
  }
`;

const Spinner = styled(motion.div)`
  width: 100%;
  height: 100%;
  position: relative;
`;

const SpinnerTrack = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
`;

const SpinnerFill = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  border: 4px solid transparent;
  border-radius: 50%;
  border-top-color: #00dbde;
  border-right-color: #fc00ff;
  animation: spinColors 2s linear infinite;

  @keyframes spinColors {
    0% {
      border-top-color: #00dbde;
      border-right-color: #fc00ff;
    }
    25% {
      border-right-color: #00dbde;
      border-bottom-color: #fc00ff;
    }
    50% {
      border-bottom-color: #00dbde;
      border-left-color: #fc00ff;
    }
    75% {
      border-left-color: #00dbde;
      border-top-color: #fc00ff;
    }
    100% {
      border-top-color: #00dbde;
      border-right-color: #fc00ff;
    }
  }
`;

const ProgressContainer = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  margin-bottom: 30px;

  .progress-bar {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background: linear-gradient(90deg, #00dbde 0%, #fc00ff 100%);
    transform-origin: left;
    border-radius: 10px;
  }
`;

const ProgressText = styled.div`
  position: absolute;
  top: 15px;
  right: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
`;

const LoadingMessage = styled.div`
  margin-top: 20px;
  font-size: 18px;
  font-weight: 300;
  text-align: center;
  color: rgba(255, 255, 255, 0.9);

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const ParticleContainer = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;

  .particle {
    position: absolute;
    width: 6px;
    height: 6px;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 50%;
    filter: blur(1px);
  }
`;

const Checkmark = styled.svg`
  width: 80px;
  height: 80px;
  stroke: #00ff88;
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
  margin-bottom: 20px;
`;

const CompletionMessage = styled.div`
  font-size: 24px;
  font-weight: 500;
  color: white;
  text-align: center;
  animation: pulse 2s infinite;

  @keyframes pulse {
    0% { opacity: 0.8; transform: scale(0.98); }
    50% { opacity: 1; transform: scale(1.02); }
    100% { opacity: 0.8; transform: scale(0.98); }
  }
`;

export default LoadingPage;