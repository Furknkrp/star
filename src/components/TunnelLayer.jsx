import React, { useRef, useMemo, Suspense, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture, Stars, useProgress } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

// --- ÖN YÜKLEME (PRELOAD) ---
useTexture.preload('/photos/moon_phases_heart.png');
useTexture.preload('/photos/final_photo.jpg');
useTexture.preload('/photos/moon.jpg');

// --- TAKIMYILDIZI VERİLERİ ---
const constellationData = {
  gemini: {
    stars: [{ x: 0.28, y: 0.10 }, { x: 0.32, y: 0.18 }, { x: 0.38, y: 0.32 }, { x: 0.45, y: 0.45 }, { x: 0.48, y: 0.28 }, { x: 0.15, y: 0.15 }, { x: 0.20, y: 0.23 }, { x: 0.10, y: 0.30 }, { x: 0.25, y: 0.38 }, { x: 0.28, y: 0.52 }],
    lines: [[0, 1], [1, 2], [2, 3], [1, 4], [5, 6], [6, 7], [6, 8], [8, 9], [1, 6]]
  },
  pisces: {
    stars: [{ x: 0.60, y: 0.85 }, { x: 0.65, y: 0.75 }, { x: 0.70, y: 0.65 }, { x: 0.72, y: 0.58 }, { x: 0.70, y: 0.53 }, { x: 0.66, y: 0.50 }, { x: 0.62, y: 0.55 }, { x: 0.64, y: 0.61 }, { x: 0.75, y: 0.80 }, { x: 0.82, y: 0.83 }, { x: 0.88, y: 0.81 }, { x: 0.94, y: 0.78 }, { x: 0.90, y: 0.74 }],
    lines: [[0, 1], [0, 8], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 2], [8, 9], [9, 10], [10, 11], [11, 12]]
  }
};

// --- 1. YÜKLEME EKRANI TASARIMI VE ANİMASYONLARI ---
const loaderStyles = `
  @keyframes fall {
    0% { transform: translateY(-10vh) rotate(0deg); opacity: 0; }
    20% { opacity: 1; }
    100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
  }
  .heart { position: fixed; top: -50px; fill: #ff4d6d; pointer-events: none; animation: fall linear infinite; z-index: 1001; }
  .vine-container { position: relative; width: 300px; height: 40px; display: flex; align-items: center; justify-content: center; }
  .flower { filter: drop-shadow(0 0 5px currentColor); }
`;

const Flower = ({ x, y, color, scale }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`} className="flower" style={{ color }}>
    <circle cx="0" cy="0" r="3" fill="white" />
    {[0, 72, 144, 216, 288].map(deg => (
      <ellipse key={deg} transform={`rotate(${deg})`} cx="6" cy="0" rx="5" ry="3" fill="currentColor" opacity="0.9" />
    ))}
  </g>
);

const Leaf = ({ x, y, rotation }) => (
  <path d="M0,0 Q5,-5 10,0 Q5,5 0,0" fill="#4a6316" transform={`translate(${x},${y}) rotate(${rotation})`} />
);

const OverlayLoader = () => {
  const { progress } = useProgress();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (progress === 100) {
      const timer = setTimeout(() => setVisible(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  const hearts = useMemo(() => Array.from({ length: 15 }).map((_, i) => ({
    id: i, left: Math.random() * 100 + 'vw', duration: Math.random() * 3 + 3 + 's',
    delay: Math.random() * 5 + 's', size: Math.random() * 15 + 10 + 'px'
  })), []);

  if (!visible) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', 
      height: '100dvh', /* 100vh yerine 100dvh kullandık */
      background: '#050505', display: 'flex', flexDirection: 'column', 
      alignItems: 'center', justifyContent: 'center', zIndex: 1000, 
      color: 'white', fontFamily: 'sans-serif', overflow: 'hidden' }}>
      <style>{loaderStyles}</style>
      {hearts.map(h => (
        <svg key={h.id} className="heart" style={{ left: h.left, animationDuration: h.duration, animationDelay: h.delay, width: h.size }} viewBox="0 0 32 32">
          <path d="M16 28.5s-12-7.2-12-14.5c0-4 3.2-7.2 7.2-7.2 2.3 0 4.4 1.1 5.8 2.8 1.4-1.7 3.5-2.8 5.8-2.8 4 0 7.2 3.2 7.2 7.2 0 7.3-12 14.5-12 14.5z" />
        </svg>
      ))}
      <div className="vine-container">
        <svg style={{ position: 'absolute', width: '120%', height: '100%', pointerEvents: 'none' }} viewBox="0 0 300 40">
          <path d="M0,25 Q50,10 100,25 T200,25 T300,25" fill="none" stroke="#6b8e23" strokeWidth="3" strokeLinecap="round" />
          <Flower x={20} y={15} color="#ffb7ff" scale={0.8} />
          <Flower x={80} y={28} color="#90e0ef" scale={0.6} />
          <Flower x={160} y={12} color="#ffd166" scale={0.7} />
          <Flower x={240} y={22} color="#ff85a1" scale={0.9} />
          <Leaf x={50} y={15} rotation={45} />
          <Leaf x={120} y={25} rotation={-30} />
          <Leaf x={210} y={18} rotation={10} />
        </svg>
        <div style={{ width: '250px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', position: 'relative', overflow: 'hidden', border: '1px solid rgba(107, 142, 35, 0.3)' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #6b8e23, #b5e48c)', boxShadow: '0 0 10px #b5e48c', transition: 'width 0.3s ease-out' }} />
        </div>
      </div>
      <p style={{ marginTop: '20px', fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase' }}>
        {progress < 100 ? `Evreni'M HAZIRLANIYOR: %${Math.round(progress)}` : 'BAŞLIYORUZ! Sevgili Sevgili`M'}
      </p>
    </div>
  );
};

// --- 2. 3D TÜNEL BİLEŞENLERİ ---

const ShootingStars = () => {
  const count = 43; // OPTİMİZASYON: 150'den 40'a düşürüldü
  const mesh = useRef();
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        x: (Math.random() - 0.5) * 50, y: (Math.random() - 0.5) * 50, z: (Math.random() - 0.5) * 100, speed: Math.random() * 0.6 + 0.3
      });
    }
    return temp;
  }, []);

  useFrame((state, delta) => {
    if (!mesh.current) return;
    particles.forEach((p, i) => {
      p.z += p.speed * (delta * 60);
      if (p.z > 15) p.z = -85;
      const dummy = new THREE.Object3D();
      dummy.position.set(p.x, p.y, p.z);
      dummy.scale.set(0.06, 0.06, 2.5);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      <boxGeometry args={[0.2, 0.2, 1]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
    </instancedMesh>
  );
};

const PhotoCard = ({ url, position }) => {
  const texture = useTexture(url);
  useEffect(() => {
    if (texture) {
      texture.minFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
    }
  }, [texture]);

  return (
    <group position={position}>
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[2.5, 1.7]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.1} />
      </mesh>
      <mesh>
        <planeGeometry args={[2.2, 1.4]} />
        <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

const MoonPassage = ({ position }) => {
  const texture = useTexture('/photos/moon.jpg');
  return (
    <mesh position={position}>
      <planeGeometry args={[4.66, 4.66]} />
      <meshBasicMaterial map={texture} transparent opacity={1} side={THREE.DoubleSide} />
    </mesh>
  );
};

const Constellation = ({ data, position, scale = 5, opacityRef }) => {
  const lineGeometry = useMemo(() => {
    const points = [];
    const colors = [];
    data.lines.forEach(([startIdx, endIdx]) => {
      const start = data.stars[startIdx];
      const end = data.stars[endIdx];
      const vStart = new THREE.Vector3((start.x - 0.5) * scale, (start.y - 0.5) * -scale, 0);
      const vEnd = new THREE.Vector3((end.x - 0.5) * scale, (end.y - 0.5) * -scale, 0);
      const vMid = new THREE.Vector3().addVectors(vStart, vEnd).multiplyScalar(0.5);
      points.push(vStart, vMid, vMid, vEnd);
      colors.push(0, 0, 0, 0.15, 0.15, 0.15, 0.15, 0.15, 0.15, 0, 0, 0);
    });
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    return geo;
  }, [data, scale]);

  const starsRef = useRef();
  const linesRef = useRef();

  useFrame((state) => {
    if (opacityRef.current && starsRef.current) {
      const currentOpacity = opacityRef.current.opacity;
      linesRef.current.material.opacity = currentOpacity * 0.2;
      starsRef.current.children.forEach((group, i) => {
        group.children[0].material.opacity = currentOpacity;
        const pulse = (Math.sin(state.clock.elapsedTime * 6 + i) + 1) * 0.5;
        group.children[1].material.opacity = currentOpacity * (0.05 + pulse * 0.2);
        group.children[1].scale.setScalar(0.5 + pulse * 0.5);
      });
    }
  });

  return (
    <group position={position}>
      <group ref={starsRef}>
        {data.stars.map((star, i) => (
          <group key={i} position={[(star.x - 0.5) * scale, (star.y - 0.5) * -scale, 0]}>
            <mesh><sphereGeometry args={[0.015, 8, 8]} /><meshBasicMaterial color="#ffffff" transparent /></mesh>
            <mesh><sphereGeometry args={[0.05, 12, 12]} /><meshBasicMaterial color="#ffffff" transparent blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
          </group>
        ))}
      </group>
      <lineSegments ref={linesRef} geometry={lineGeometry}>
        <lineBasicMaterial vertexColors transparent blending={THREE.AdditiveBlending} />
      </lineSegments>
    </group>
  );
};

const FinalScene = ({ show, stopPoint }) => {
  const heartTexture = useTexture('/photos/moon_phases_heart.png');
  const finalPhotoTexture = useTexture('/photos/final_photo.jpg');
  const heartMat = useRef();
  const finalMat = useRef();

  useFrame((state, delta) => {
    if (show && heartMat.current && finalMat.current) {
      const newOpacity = THREE.MathUtils.lerp(heartMat.current.opacity, 1, 0.1);
      heartMat.current.opacity = newOpacity;
      finalMat.current.opacity = newOpacity;
    }
  });

  return (
    <group position={[0, 0, stopPoint - 4]}>
      <Constellation data={constellationData.gemini} position={[-4, 1, -2]} scale={6.7} opacityRef={heartMat} />
      <Constellation data={constellationData.pisces} position={[5.3, -1, -2]} scale={7} opacityRef={heartMat} />
      <mesh position={[-1.15, 0, 0]}>
        <planeGeometry args={[2, 3]} />
        <meshBasicMaterial ref={heartMat} map={heartTexture} transparent opacity={0} depthTest={false} />
      </mesh>
      <mesh position={[2.07, 0, 0]}>
        <planeGeometry args={[2.5, 2.8]} />
        <meshBasicMaterial ref={finalMat} map={finalPhotoTexture} transparent opacity={0} depthTest={false} />
      </mesh>
    </group>
  );
};

const TunnelGroup = ({ onReachEnd }) => {
  const { camera } = useThree();
  const [showFinal, setShowFinal] = useState(false);
  const hasTriggeredEnd = useRef(false);

  const totalPhotos = 43; // OPTİMİZASYON: 266'dan 30'a düşürüldü. Telefonlar rahatlayacak.
  const radius = 3.5;
  const photosPerRing = 6;
  const ringHeightSpacing = 2.5;
  const totalRings = Math.ceil(totalPhotos / photosPerRing);
  const tunnelLength = totalRings * ringHeightSpacing;

  const photos = useMemo(() => {
    const temp = [];
    for (let i = 0; i < totalPhotos; i++) {
      const ringIndex = Math.floor(i / photosPerRing);
      const angle = (i % photosPerRing / photosPerRing) * Math.PI * 2;
      temp.push({
        pos: [Math.cos(angle) * radius, Math.sin(angle) * radius, -(ringIndex * ringHeightSpacing)],
        url: `/photos/${i + 1}.jpg` // Klasöründe 1.jpg'den 30.jpg'ye kadar dosyalar olmalı
      });
    }
    return temp;
  }, []);

  const moonPos = -(tunnelLength + 25);
  const stopPoint = moonPos - 10;

  useFrame((state, delta) => {
    if (camera.position.z > stopPoint) {
      camera.position.z -= 0.8 * delta;
      camera.position.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.3;

      if (camera.position.z <= moonPos && !showFinal) {
        setShowFinal(true);
      }
    } else {
      camera.position.z = stopPoint;
      if (!hasTriggeredEnd.current) {
        hasTriggeredEnd.current = true;
        onReachEnd();
      }
    }
  });

  return (
    <>
      {photos.map((p, i) => <PhotoCard key={i} position={p.pos} url={p.url} />)}
      <MoonPassage position={[0, 0, moonPos]} />
      <FinalScene show={showFinal} stopPoint={stopPoint} />
      <ShootingStars />
      <Stars radius={100} count={600} factor={4} fade speed={1} /> {/* OPTİMİZASYON: Yıldızlar 400'e indi */}
    </>
  );
};

// --- 3. ANA KATMAN ---
const TunnelLayer = () => { // onFinish prop'unu kaldırdık çünkü tek sayfa
  const [showHeart, setShowHeart] = useState(false);
  const [finalMessage, setFinalMessage] = useState(false); // Yeni final durumu
  const audioRef = useRef(null);

  const startMusic = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(error => {
        console.log("Müzik çalma başarısız: Tarayıcı etkileşim bekliyor.");
      });
    }
  };

  return (
    <div
      style={{ width: '100vw', height: '100vh', background: '#050505', position: 'relative' }}
      onClick={startMusic}
    >
      <audio ref={audioRef} src="/space.mp3" autoPlay loop />
      <OverlayLoader />

      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <Suspense fallback={null}>
          <TunnelGroup onReachEnd={() => setShowHeart(true)} />
        </Suspense>
      </Canvas>

      <AnimatePresence>
        {showHeart && (
          <motion.div
            style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}
          >
            {finalMessage ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  color: '#fff', fontSize: '2rem', fontFamily: 'serif',
                  textShadow: '0 0 20px #ff4d4d', textAlign: 'center', background: 'rgba(0,0,0,0.5)', padding: '20px', borderRadius: '15px'
                }}
              >
                Çooooookkkk Seviyoruummm Senii 🤍
              </motion.div>
            ) : (
              <motion.button
                key="magical-heart"
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: 1, scale: [1, 1.2, 1],
                  filter: ['drop-shadow(0 0 10px #ff7c94ff)', 'drop-shadow(0 0 30px #ff4d6d)', 'drop-shadow(0 0 10px #ff4d6d)']
                }}
                transition={{
                  opacity: { duration: 1.5 }, scale: { repeat: Infinity, duration: 1.2, ease: "easeInOut" }, filter: { repeat: Infinity, duration: 2, ease: "linear" }
                }}
                onClick={() => setFinalMessage(true)} // Tıklandığında mesaj çıksın
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '120px', position: 'relative' }}
              >
                <span style={{ WebkitTextStroke: '3px #ff002fff', color: 'transparent', textShadow: '0 0 0px rgba(121, 0, 22, 0.8)', display: 'block' }}>♡</span>
                <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} style={{ position: 'absolute', top: '10%', left: '20%', fontSize: '20px' }}></motion.div>
                <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.3 }} style={{ position: 'absolute', bottom: '20%', right: '10%', fontSize: '20px' }}></motion.div>
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TunnelLayer;