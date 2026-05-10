import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const IntroVideo = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isExiting, setIsExiting] = useState(false);

  // Transition and navigate to the login page
  const handleExit = () => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      navigate('/login');
    }, 600); // smooth fade transition duration
  };

  // Autoplay handler
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.warn("Autoplay was blocked or failed, waiting for click to play/skip:", err);
      });
    }
  }, []);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          onClick={handleExit}
          className="relative w-screen h-screen overflow-hidden bg-black select-none cursor-pointer"
          title="Click anywhere to skip intro"
        >
          {/* Immersive Pure Video */}
          <video
            ref={videoRef}
            src="/intro.mp4"
            autoPlay
            muted
            playsInline
            onEnded={handleExit}
            className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IntroVideo;
