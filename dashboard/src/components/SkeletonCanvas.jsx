import React, { useRef, useEffect, useState } from 'react';
import { PENN_CONNECTIONS, MP_TO_PENN } from '../utils/constants';
import { evaluatePoseAndExercise, resetDetector } from '../utils/poseClassifier';

export default function SkeletonCanvas({
  seq,
  videoSrc,
  isPlaying,
  onTogglePlay,
  frameIdx,
  onFrameChange,
  onLiveAssessmentUpdate,
  isWebcam
}) {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const webcamRef = useRef(null);
  const mpPoseRef = useRef(null);
  const [mpReady, setMpReady] = useState(false);
  const mpLandmarksRef = useRef(null);
  const historyRef = useRef([]);
  const animFrameRef = useRef(null);
  const [webcamActive, setWebcamActive] = useState(false);
  const [webcamError, setWebcamError] = useState(null);
  const streamRef = useRef(null);

  // Inicializar MediaPipe Pose
  useEffect(() => {
    let active = true;

    const initPose = async () => {
      if (typeof window.Pose === 'undefined') {
        console.warn('[MediaPipe] Librería Pose no encontrada en window.Pose.');
        return;
      }
      try {
        const pose = new window.Pose({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
        });
        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });
        pose.onResults((results) => {
          if (!active) return;
          if (results.poseLandmarks) {
            mpLandmarksRef.current = results.poseLandmarks;
            const res = evaluatePoseAndExercise(results.poseLandmarks, historyRef.current);
            // Mantener historial legacy para compatibilidad
            historyRef.current.push({
              hipY: (results.poseLandmarks[23].y + results.poseLandmarks[24].y) / 2,
              shY: (results.poseLandmarks[11].y + results.poseLandmarks[12].y) / 2,
              bodyDY: Math.abs((results.poseLandmarks[11].y + results.poseLandmarks[12].y) / 2 - (results.poseLandmarks[23].y + results.poseLandmarks[24].y) / 2),
              kneeL: 140
            });
            if (historyRef.current.length > 90) historyRef.current.shift();
            onLiveAssessmentUpdate?.(res);
          }
        });
        mpPoseRef.current = pose;
        setMpReady(true);
      } catch (err) {
        console.error('[MediaPipe] Error inicializando Pose:', err);
      }
    };

    initPose();
    return () => {
      active = false;
    };
  }, []);

  // Manejar cámara web
  useEffect(() => {
    if (!isWebcam || !seq.isUserVideo) {
      // Limpiar webcam si dejamos de usarla
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      setWebcamActive(false);
      return;
    }

    let cancelled = false;

    const startWebcam = async () => {
      try {
        setWebcamError(null);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        streamRef.current = stream;
        if (webcamRef.current) {
          webcamRef.current.srcObject = stream;
          await webcamRef.current.play();
        }
        setWebcamActive(true);
        // Reset el detector al iniciar nueva sesión
        resetDetector();
      } catch (err) {
        console.error('[WEBCAM] Error:', err);
        setWebcamError(
          err.name === 'NotAllowedError'
            ? 'Permiso de cámara denegado. Haz click en el icono 🔒 en la barra del navegador y permite la cámara.'
            : err.name === 'NotFoundError'
            ? 'No se encontró cámara web. Conecta una cámara e intenta de nuevo.'
            : `Error de cámara: ${err.message}`
        );
      }
    };

    startWebcam();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      setWebcamActive(false);
    };
  }, [isWebcam, seq.isUserVideo]);

  // Bucle de renderizado en Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let processingFrame = false;

    const drawLoop = async () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (seq.isUserVideo) {
        // Determinar fuente de video: webcam o archivo
        const videoSource = isWebcam ? webcamRef.current : videoRef.current;

        if (videoSource && videoSource.readyState >= 2) {
          ctx.drawImage(videoSource, 0, 0, canvas.width, canvas.height);

          // Procesar frame con MediaPipe
          if (mpReady && mpPoseRef.current && !processingFrame && !videoSource.paused) {
            processingFrame = true;
            try {
              await mpPoseRef.current.send({ image: videoSource });
            } catch (e) {
              // Ignorar frames en transición
            } finally {
              processingFrame = false;
            }
          }
        } else {
          ctx.fillStyle = '#080b11';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Mostrar error de webcam si existe
          if (webcamError) {
            ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
            ctx.fillRect(20, canvas.height / 2 - 50, canvas.width - 40, 100);
            ctx.fillStyle = '#ef4444';
            ctx.font = 'bold 13px "Inter", sans-serif';
            ctx.textAlign = 'center';
            const lines = webcamError.split('. ');
            lines.forEach((line, i) => {
              ctx.fillText(line, canvas.width / 2, canvas.height / 2 - 15 + i * 22);
            });
            ctx.textAlign = 'start';
          }
        }

        // Overlay semi-transparente
        ctx.fillStyle = 'rgba(8, 11, 17, 0.15)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const statusColor =
          seq.clase === 0 ? '#10b981' : seq.clase === 1 ? '#ef4444' : '#f59e0b';

        // HUD superior
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(10, 10, canvas.width - 20, 62);
        ctx.fillStyle = statusColor;
        ctx.font = 'bold 12px "JetBrains Mono", monospace';
        const sourceLabel = isWebcam ? '📹 CÁMARA WEB EN VIVO' : '🎬 VIDEO MP4';
        ctx.fillText(`● ${sourceLabel} | ${seq.action}`, 18, 30);
        ctx.fillStyle = '#ffffff';
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillText(`DIAGNÓSTICO: ${seq.nombre?.toUpperCase()} | CONFIANZA: ${(seq.confianza * 100).toFixed(1)}%`, 18, 48);

        // Mostrar repeticiones si hay
        if (seq.repCount > 0) {
          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 11px "JetBrains Mono", monospace';
          ctx.fillText(`REPS: ${seq.repCount} | FASE: ${seq.phase?.toUpperCase() || 'IDLE'}`, 18, 62);
        }

        // Score de calidad (esquina superior derecha)
        if (seq.qualityScore !== undefined && seq.qualityScore > 0) {
          const scoreX = canvas.width - 90;
          const scoreY = 42;
          const scoreRadius = 26;
          const scoreAngle = (seq.qualityScore / 100) * Math.PI * 2;

          // Fondo del arco
          ctx.beginPath();
          ctx.arc(scoreX, scoreY, scoreRadius, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255,255,255,0.1)';
          ctx.lineWidth = 5;
          ctx.stroke();

          // Arco de progreso
          ctx.beginPath();
          ctx.arc(scoreX, scoreY, scoreRadius, -Math.PI / 2, -Math.PI / 2 + scoreAngle);
          ctx.strokeStyle = statusColor;
          ctx.lineWidth = 5;
          ctx.lineCap = 'round';
          ctx.stroke();

          // Texto del score
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 14px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`${seq.qualityScore.toFixed(0)}`, scoreX, scoreY + 5);
          ctx.textAlign = 'start';
        }

        // Rejilla de escaneo
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.06)';
        ctx.lineWidth = 1;
        for (let gy = 0; gy < canvas.height; gy += 40) {
          ctx.beginPath();
          ctx.moveTo(0, gy);
          ctx.lineTo(canvas.width, gy);
          ctx.stroke();
        }

        // Dibujar articulaciones detectadas
        const lm = mpLandmarksRef.current;
        if (lm) {
          const joints = MP_TO_PENN.map(idx => ({
            x: lm[idx].x * canvas.width,
            y: lm[idx].y * canvas.height,
            vis: lm[idx].visibility
          }));

          // Líneas del esqueleto con grosor adaptativo
          ctx.lineCap = 'round';
          PENN_CONNECTIONS.forEach(([i, j]) => {
            if (joints[i].vis > 0.35 && joints[j].vis > 0.35) {
              // Sombra de glow
              ctx.strokeStyle = statusColor;
              ctx.lineWidth = 8;
              ctx.globalAlpha = 0.25;
              ctx.beginPath();
              ctx.moveTo(joints[i].x, joints[i].y);
              ctx.lineTo(joints[j].x, joints[j].y);
              ctx.stroke();

              // Línea principal
              ctx.globalAlpha = 1.0;
              ctx.lineWidth = 4;
              ctx.beginPath();
              ctx.moveTo(joints[i].x, joints[i].y);
              ctx.lineTo(joints[j].x, joints[j].y);
              ctx.stroke();
            }
          });
          ctx.globalAlpha = 1.0;

          // Articulaciones con efecto luminoso
          joints.forEach(pt => {
            if (pt.vis > 0.35) {
              // Glow externo
              ctx.beginPath();
              ctx.arc(pt.x, pt.y, 12, 0, Math.PI * 2);
              ctx.fillStyle = statusColor;
              ctx.globalAlpha = 0.15;
              ctx.fill();
              ctx.globalAlpha = 1.0;

              // Punto principal
              ctx.beginPath();
              ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
              ctx.fillStyle = '#ffffff';
              ctx.fill();
              ctx.lineWidth = 2.5;
              ctx.strokeStyle = statusColor;
              ctx.stroke();
            }
          });
        } else if (!webcamError) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
          ctx.fillRect(canvas.width / 2 - 180, canvas.height / 2 - 22, 360, 44);
          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 13px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText('⏳ PROCESANDO CON MEDIAPIPE POSE...', canvas.width / 2, canvas.height / 2 + 5);
          ctx.textAlign = 'start';
        }
      } else {
        // MODO PENN ACTION: Esqueleto cinemático simulado
        ctx.fillStyle = '#080b11';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Rejilla biomecánica de fondo
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let x = 0; x < canvas.width; x += 32) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += 32) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }

        const colorHex =
          seq.clase === 0 ? '#10b981' : seq.clase === 1 ? '#ef4444' : '#f59e0b';

        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(10, 10, 260, 28);
        ctx.fillStyle = colorHex;
        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        ctx.fillText(`● PENN ACTION DATASET #${seq.id} | ${seq.action}`, 18, 28);

        const t = (frameIdx / 45) * Math.PI * 2;
        const flex = Math.sin(t);
        let backErrorOffset = seq.type === 'back' ? Math.max(0, Math.sin(t) * 35) : 0;
        let kneeValgoOffset = seq.type === 'limb' ? Math.max(0, Math.sin(t) * 25) : 0;

        const joints = [
          { x: 320 + backErrorOffset * 0.5, y: 75 + flex * 18 },  // 0: Head
          { x: 285 + backErrorOffset, y: 115 + flex * 20 },       // 1: L Shoulder
          { x: 355 + backErrorOffset, y: 115 + flex * 20 },       // 2: R Shoulder
          { x: 260, y: 165 + flex * 15 },                         // 3: L Elbow
          { x: 380, y: 165 + flex * 15 },                         // 4: R Elbow
          { x: 250, y: 215 + flex * 10 },                         // 5: L Wrist
          { x: 390, y: 215 + flex * 10 },                         // 6: R Wrist
          { x: 295, y: 210 + flex * 55 },                         // 7: L Hip
          { x: 345, y: 210 + flex * 55 },                         // 8: R Hip
          { x: 285 + kneeValgoOffset, y: 290 + flex * 30 },       // 9: L Knee
          { x: 355 - kneeValgoOffset, y: 290 + flex * 30 },       // 10: R Knee
          { x: 280, y: 355 },                                     // 11: L Ankle
          { x: 360, y: 355 }                                      // 12: R Ankle
        ];

        ctx.strokeStyle = colorHex;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        PENN_CONNECTIONS.forEach(([i, j]) => {
          ctx.beginPath();
          ctx.moveTo(joints[i].x, joints[i].y);
          ctx.lineTo(joints[j].x, joints[j].y);
          ctx.stroke();
        });

        joints.forEach(pt => {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = colorHex;
          ctx.stroke();
        });
      }

      animFrameRef.current = requestAnimationFrame(drawLoop);
    };

    drawLoop();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [seq, mpReady, frameIdx, isWebcam, webcamActive, webcamError]);

  return (
    <div className="canvas-container">
      <canvas ref={canvasRef} width={640} height={420} />
      {/* Video oculto para archivo MP4 */}
      {seq.isUserVideo && !isWebcam && (
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          style={{ display: 'none' }}
        />
      )}
      {/* Video oculto para webcam */}
      {seq.isUserVideo && isWebcam && (
        <video
          ref={webcamRef}
          muted
          playsInline
          style={{ display: 'none' }}
        />
      )}
      <div className="canvas-controls">
        <button className="btn" onClick={onTogglePlay}>
          {isPlaying ? '⏸ Pausar' : '▶ Reproducir'}
        </button>
        <div className="slider-wrapper">
          <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>Frame:</span>
          <input
            type="range"
            min="0"
            max="45"
            value={frameIdx}
            onChange={(e) => onFrameChange(Number(e.target.value))}
            disabled={seq.isUserVideo}
          />
          <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
            {seq.isUserVideo ? (isWebcam ? '📹 WEBCAM' : 'LIVE') : `${frameIdx + 1} / 46`}
          </span>
        </div>
      </div>
    </div>
  );
}
