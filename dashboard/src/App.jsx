import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import KpiStrip from './components/KpiStrip';
import SkeletonCanvas from './components/SkeletonCanvas';
import FeedbackCard from './components/FeedbackCard';
import ChartsPanel from './components/ChartsPanel';
import DemosGallery from './components/DemosGallery';
import DatasetView from './components/DatasetView';
import GuideView from './components/GuideView';
import { INITIAL_SEQUENCES, EXAMPLE_VIDEOS } from './data/sequences';
import { resetDetector } from './utils/poseClassifier';

export default function App() {
  const [sequences, setSequences] = useState(INITIAL_SEQUENCES);
  const [currentSeqIdx, setCurrentSeqIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [frameIdx, setFrameIdx] = useState(0);
  const [userVideoSrc, setUserVideoSrc] = useState('/demo_squat.mp4');
  const [isWebcam, setIsWebcam] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Estado para la barra de navegación entre los 4 menús (Estudio, Demos, Dataset, Guía)
  const [activeMenu, setActiveMenu] = useState('live');

  const currentSeq = sequences[currentSeqIdx] || sequences[0];

  // Bucle de animación temporal para fotogramas del dataset y demos
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setFrameIdx(prev => (prev + 1) % 46);
    }, 70);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Manejar selección de secuencia base Penn Action
  const handleSelectSeq = (index) => {
    setCurrentSeqIdx(index);
    setFrameIdx(0);
    setIsWebcam(false);
    setActiveMenu('live'); // Saltar directo al estudio para ver el gráfico
    resetDetector();
  };

  // Cargar video de ejemplo desde galería o panel (vinculado a fotogramas reales y MediaPipe)
  const handleSelectExampleVideo = (example) => {
    const demoSeq = {
      id: example.id,
      vidId: example.vidId,
      action: example.defaultAction || "EJERCICIO DEMO",
      clase: 0,
      confianza: 0.942,
      nombre: "Analizando biomecánica en vivo...",
      feedback: `⏳ Fotogramas cargados. Evaluando ángulos en ${example.title}...`,
      type: example.type || "correct",
      isUserVideo: true,
      isExampleDemo: true,
      repCount: 0,
      phase: 'idle',
      qualityScore: 94.2
    };
    setSequences(prev => [...prev, demoSeq]);
    setUserVideoSrc('/' + example.file);
    setCurrentSeqIdx(sequences.length);
    setFrameIdx(0);
    setIsWebcam(false);
    setActiveMenu('live'); // Cambiar al estudio en vivo para disfrutar el análisis
    resetDetector();
  };

  // Subida de cualquier video personal para predicción universal
  const handleUploadVideo = (file) => {
    const videoURL = URL.createObjectURL(file);
    const uploadedSeq = {
      id: "MI-VIDEO",
      vidId: null,
      action: file.name.replace(/\.[^/.]+$/, "").toUpperCase() || "BENCHMARK IA",
      clase: 0,
      confianza: 0.942,
      nombre: "Analizando con MediaPipe...",
      feedback: "⏳ MediaPipe Pose IA está procesando tu video y evaluando la técnica en tiempo real...",
      type: "correct",
      isUserVideo: true,
      isUploadedVideo: true,
      repCount: 0,
      phase: 'idle',
      qualityScore: 0
    };
    setSequences(prev => [...prev, uploadedSeq]);
    setUserVideoSrc(videoURL);
    setCurrentSeqIdx(sequences.length);
    setFrameIdx(0);
    setIsWebcam(false);
    setActiveMenu('live'); // Cambiar a estudio en vivo
    resetDetector();
  };

  // Activar cámara web en vivo
  const handleStartWebcam = () => {
    const webcamSeq = {
      id: "WEBCAM",
      vidId: null,
      action: "CÁMARA EN VIVO",
      clase: 0,
      confianza: 0,
      nombre: "Iniciando cámara web...",
      feedback: "📹 Posiciónate frente a la cámara a 1.5-2 metros de distancia para comenzar tu entrenamiento con IA.",
      type: "correct",
      isUserVideo: true,
      repCount: 0,
      phase: 'idle',
      qualityScore: 0
    };
    setSequences(prev => [...prev, webcamSeq]);
    setCurrentSeqIdx(sequences.length);
    setIsWebcam(true);
    setActiveMenu('live');
    resetDetector();
  };

  // Actualizar diagnósticos en tiempo real
  const handleLiveAssessmentUpdate = (assessment) => {
    setSequences(prev => {
      const copy = [...prev];
      const seq = copy[currentSeqIdx];
      if (seq && seq.isUserVideo) {
        seq.action = assessment.exercise;
        seq.clase = assessment.status.clase;
        seq.nombre = assessment.status.nombre;
        seq.confianza = assessment.status.confianza;
        seq.feedback = assessment.status.feedback;
        seq.type = assessment.status.type;
        seq.repCount = assessment.repCount || 0;
        seq.phase = assessment.phase || 'idle';
        seq.qualityScore = assessment.status.qualityScore || 0;
      }
      return copy;
    });
  };

  return (
    <div className="app-root">
      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        activeMenu={activeMenu}
        onSelectMenu={setActiveMenu}
      />

      {/* Tira Motivacional del MODO BEAST */}
      <div className="motivational-banner">
        <div className="motivational-text">
          <span style={{ fontSize: '1.2rem' }}>⚡</span>
          <span><b>MODO ATLETA IA ACTIVADO:</b> El motor biomecánico evalúa tus articulaciones a 60 FPS. ¡Mantén la postura y supera tu récord!</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.76rem', color: '#00ff88', fontWeight: 800 }}>✔ CERO LESIONES</span>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <span style={{ fontSize: '0.76rem', color: '#00d2ff', fontWeight: 800 }}>✔ 100% PRECISIÓN</span>
        </div>
      </div>

      {/* RENDERIZADO CONDICIONAL DE LOS DIFERENTES MENÚS */}
      {activeMenu === 'live' && (
        <div className={`dashboard ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <div className={`sidebar-wrapper ${sidebarOpen ? 'open' : ''}`}>
            <Sidebar
              sequences={sequences}
              currentSeqIdx={currentSeqIdx}
              onSelectSeq={handleSelectSeq}
              onSelectExampleVideo={handleSelectExampleVideo}
              onUploadVideo={handleUploadVideo}
              onStartWebcam={handleStartWebcam}
            />
          </div>
          <div className="main-content">
            <KpiStrip seq={currentSeq} isLive={currentSeq.isUserVideo} />

            <div className="viewer-grid">
              <SkeletonCanvas
                seq={currentSeq}
                videoSrc={userVideoSrc}
                isPlaying={isPlaying}
                onTogglePlay={() => setIsPlaying(!isPlaying)}
                frameIdx={frameIdx}
                onFrameChange={setFrameIdx}
                onLiveAssessmentUpdate={handleLiveAssessmentUpdate}
                isWebcam={isWebcam}
              />
              <FeedbackCard seq={currentSeq} />
            </div>

            <ChartsPanel seq={currentSeq} />
          </div>
        </div>
      )}

      {activeMenu === 'demos' && (
        <DemosGallery onSelectDemo={handleSelectExampleVideo} />
      )}

      {activeMenu === 'dataset' && (
        <DatasetView onSelectDatasetItem={handleSelectSeq} />
      )}

      {activeMenu === 'guide' && (
        <GuideView onGoToLive={() => setActiveMenu('live')} />
      )}

      {/* Overlay para cerrar sidebar en móvil */}
      {sidebarOpen && activeMenu === 'live' && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}
