import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import KpiStrip from './components/KpiStrip';
import SkeletonCanvas from './components/SkeletonCanvas';
import FeedbackCard from './components/FeedbackCard';
import ChartsPanel from './components/ChartsPanel';
import { INITIAL_SEQUENCES } from './data/sequences';
import { resetDetector } from './utils/poseClassifier';

export default function App() {
  const [sequences, setSequences] = useState(INITIAL_SEQUENCES);
  const [currentSeqIdx, setCurrentSeqIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [frameIdx, setFrameIdx] = useState(0);
  const [userVideoSrc, setUserVideoSrc] = useState('/video_demo.mp4');
  const [isWebcam, setIsWebcam] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentSeq = sequences[currentSeqIdx] || sequences[0];

  // Bucle de animación temporal para secuencias Penn Action
  useEffect(() => {
    if (!isPlaying || currentSeq.isUserVideo) return;
    const interval = setInterval(() => {
      setFrameIdx(prev => (prev + 1) % 46);
    }, 70);
    return () => clearInterval(interval);
  }, [isPlaying, currentSeq.isUserVideo]);

  // Manejar selección de secuencia Penn Action
  const handleSelectSeq = (index) => {
    setCurrentSeqIdx(index);
    setFrameIdx(0);
    setIsWebcam(false);
    resetDetector();
  };

  // Cargar video demo
  const handleLoadDemoVideo = () => {
    const demoSeq = {
      id: "DEMO-MP4",
      action: "SQUAT / PUSHUP",
      clase: 0,
      confianza: 0.942,
      nombre: "Analizando con MediaPipe...",
      feedback: "⏳ MediaPipe Pose está escaneando las 33 articulaciones en tu video...",
      type: "correct",
      isUserVideo: true,
      repCount: 0,
      phase: 'idle',
      qualityScore: 0
    };
    setSequences(prev => [...prev, demoSeq]);
    setUserVideoSrc('/video_demo.mp4');
    setCurrentSeqIdx(sequences.length);
    setIsWebcam(false);
    resetDetector();
  };

  // Subida de archivo MP4
  const handleUploadVideo = (file) => {
    const videoURL = URL.createObjectURL(file);
    const uploadedSeq = {
      id: "USER-MP4",
      action: file.name.replace(/\.[^/.]+$/, "").toUpperCase() || "MI VIDEO",
      clase: 0,
      confianza: 0.942,
      nombre: "Analizando con MediaPipe...",
      feedback: "⏳ MediaPipe Pose está procesando tu video...",
      type: "correct",
      isUserVideo: true,
      repCount: 0,
      phase: 'idle',
      qualityScore: 0
    };
    setSequences(prev => [...prev, uploadedSeq]);
    setUserVideoSrc(videoURL);
    setCurrentSeqIdx(sequences.length);
    setIsWebcam(false);
    resetDetector();
  };

  // Activar cámara web en vivo
  const handleStartWebcam = () => {
    const webcamSeq = {
      id: "WEBCAM",
      action: "CÁMARA EN VIVO",
      clase: 0,
      confianza: 0,
      nombre: "Iniciando cámara...",
      feedback: "📹 Posiciónate frente a la cámara a 1.5-2 metros de distancia para comenzar el análisis.",
      type: "correct",
      isUserVideo: true,
      repCount: 0,
      phase: 'idle',
      qualityScore: 0
    };
    setSequences(prev => [...prev, webcamSeq]);
    setCurrentSeqIdx(sequences.length);
    setIsWebcam(true);
    resetDetector();
  };

  // Actualizar diagnósticos en tiempo real desde MediaPipe
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
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className={`dashboard ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className={`sidebar-wrapper ${sidebarOpen ? 'open' : ''}`}>
          <Sidebar
            sequences={sequences}
            currentSeqIdx={currentSeqIdx}
            onSelectSeq={handleSelectSeq}
            onLoadDemoVideo={handleLoadDemoVideo}
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

      {/* Overlay para cerrar sidebar en móvil */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}
