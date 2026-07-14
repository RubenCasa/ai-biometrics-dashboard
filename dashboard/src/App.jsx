import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import KpiStrip from './components/KpiStrip';
import SkeletonCanvas from './components/SkeletonCanvas';
import FeedbackCard from './components/FeedbackCard';
import ChartsPanel from './components/ChartsPanel';
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

  const currentSeq = sequences[currentSeqIdx] || sequences[0];

  // Bucle de animación temporal para secuencias Penn Action simuladas
  useEffect(() => {
    if (!isPlaying || currentSeq.isUserVideo) return;
    const interval = setInterval(() => {
      setFrameIdx(prev => (prev + 1) % 46);
    }, 70);
    return () => clearInterval(interval);
  }, [isPlaying, currentSeq.isUserVideo]);

  // Manejar selección de secuencia base Penn Action
  const handleSelectSeq = (index) => {
    setCurrentSeqIdx(index);
    setFrameIdx(0);
    setIsWebcam(false);
    resetDetector();
  };

  // Cargar video de ejemplo en vivo (Predicción MediaPipe IA)
  const handleSelectExampleVideo = (example) => {
    const demoSeq = {
      id: example.id,
      action: example.defaultAction || "EJERCICIO EN VIVO",
      clase: 0,
      confianza: 0.942,
      nombre: "Analizando en vivo...",
      feedback: `⏳ MediaPipe Pose está escaneando las 33 articulaciones en ${example.title}...`,
      type: example.type || "correct",
      isUserVideo: true,
      repCount: 0,
      phase: 'idle',
      qualityScore: 0
    };
    setSequences(prev => [...prev, demoSeq]);
    setUserVideoSrc('/' + example.file);
    setCurrentSeqIdx(sequences.length);
    setIsWebcam(false);
    resetDetector();
  };

  // Subida de cualquier video personal (MP4, MOV, WEBM) para predicción en vivo
  const handleUploadVideo = (file) => {
    const videoURL = URL.createObjectURL(file);
    const uploadedSeq = {
      id: "MI-VIDEO",
      action: file.name.replace(/\.[^/.]+$/, "").toUpperCase() || "BENCHMARK IA EN VIVO",
      clase: 0,
      confianza: 0.942,
      nombre: "Analizando con MediaPipe...",
      feedback: "⏳ MediaPipe Pose está procesando y evaluando la biomecánica de tu video en tiempo real...",
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
      feedback: "📹 Posiciónate frente a la cámara a 1.5-2 metros de distancia para comenzar el análisis biomecánico.",
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

  // Actualizar diagnósticos y conteo en tiempo real desde MediaPipe Pose
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

      {/* Overlay para cerrar sidebar en móvil */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}
