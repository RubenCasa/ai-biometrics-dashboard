import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import ModeSelectorDock from './components/ModeSelectorDock';
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
  
  // Estado para la barra de mando entre los 4 modos del centro deportivo INK
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
    setActiveMenu('live'); // Saltar directo al estudio para ver el gráfico y evaluación
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
    setActiveMenu('live'); // Cambiar al estudio en vivo
    resetDetector();
  };

  // Subida de cualquier video personal para predicción universal
  const handleUploadVideo = (file) => {
    const videoURL = URL.createObjectURL(file);
    const uploadedSeq = {
      id: "MI-VIDEO",
      vidId: null,
      action: file.name.replace(/\.[^/.]+$/, "").toUpperCase() || "VIDEO SUBIDO",
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
    setSequences(prev => {
      const existingIdx = prev.findIndex(s => s.id === "MI-VIDEO");
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = uploadedSeq;
        return copy;
      }
      return [...prev, uploadedSeq];
    });
    setSequences(prev => {
      const idx = prev.findIndex(s => s.id === "MI-VIDEO");
      if (idx >= 0) setCurrentSeqIdx(idx);
      return prev;
    });
    setUserVideoSrc(videoURL);
    setFrameIdx(0);
    setIsWebcam(false);
    setActiveMenu('live');
    resetDetector();
  };

  // Retorno de predicciones del motor neural (Sincronizado de SkeletonCanvas)
  const handleLiveAssessmentUpdate = (update) => {
    setSequences(prev => {
      const copy = [...prev];
      if (copy[currentSeqIdx]) {
        copy[currentSeqIdx] = {
          ...copy[currentSeqIdx],
          ...update
        };
      }
      return copy;
    });
  };

  return (
    <div className="app-root">
      {/* 1. Header Telemetría INK Games (SIN barra de navegación arriba) */}
      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        activeMenu={activeMenu}
      />

      {/* 2. Dock Central de Mando e Integración API Motivacional */}
      <ModeSelectorDock
        activeMenu={activeMenu}
        onSelectMenu={setActiveMenu}
      />

      {/* RENDERIZADO CONDICIONAL DE LOS DIFERENTES MODOS */}
      {activeMenu === 'live' && (
        <div className={`dashboard ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <div className={`sidebar-wrapper ${sidebarOpen ? 'open' : ''}`}>
            <Sidebar
              sequences={sequences}
              currentSeqIdx={currentSeqIdx}
              onSelectSeq={handleSelectSeq}
              onSelectExampleVideo={handleSelectExampleVideo}
              onUploadVideo={handleUploadVideo}
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
                isWebcam={false}
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
