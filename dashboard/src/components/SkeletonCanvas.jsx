import React, { useRef, useEffect, useState } from 'react';
import { PENN_CONNECTIONS, MP_TO_PENN } from '../utils/constants';
import { evaluatePoseAndExercise, resetDetector } from '../utils/poseClassifier';

// Caché de imágenes para fotogramas reales cargados en memoria
const imageCache = {};
function getCachedImage(src) {
  if (!src) return null;
  if (!imageCache[src]) {
    const img = new Image();
    img.src = src;
    imageCache[src] = img;
  }
  return imageCache[src];
}

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

  // Inicializar MediaPipe Pose (solo si se necesita para webcam o video subido)
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
        resetDetector();
      } catch (err) {
        console.error('[WEBCAM] Error:', err);
        setWebcamError(
          err.name === 'NotAllowedError'
            ? 'Permiso de cámara denegado. Haz clic en el candado 🔒 en la barra de tu navegador y permite el acceso a la cámara.'
            : err.name === 'NotFoundError'
            ? 'No se encontró cámara web conectada al dispositivo.'
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

  // Asegurar reproducción de video al cambiar src
  useEffect(() => {
    if (seq.isUploadedVideo && videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [videoSrc, seq.isUploadedVideo]);

  // Bucle principal de renderizado en Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let processingFrame = false;

    const drawLoop = async () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Verificar si hay datos reales del dataset en window.REAL_SEQUENCES (para Dataset y Videos de Ejemplo)
      const realSeq = (typeof window !== 'undefined' && window.REAL_SEQUENCES)
        ? window.REAL_SEQUENCES.find(r => r.id === seq.vidId || r.id === seq.id)
        : null;

      // =========================================================================
      // MODO 1: FOTOGRAMAS REALES DE PENN ACTION (Instantáneo, sin códecs ni fallos)
      // =========================================================================
      if (realSeq && realSeq.frames && realSeq.frames.length > 0 && !seq.isUploadedVideo && !isWebcam) {
        const curFrameIdx = frameIdx % realSeq.frames.length;
        const frameData = realSeq.frames[curFrameIdx];

        // Dibujar fotograma real de video
        const imgObj = getCachedImage(frameData.img);
        if (imgObj && imgObj.complete) {
          ctx.drawImage(imgObj, 0, 0, canvas.width, canvas.height);
        } else if (imgObj) {
          imgObj.onload = () => {
            ctx.drawImage(imgObj, 0, 0, canvas.width, canvas.height);
          };
        } else {
          ctx.fillStyle = '#080b11';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Overlay semi-transparente
        ctx.fillStyle = 'rgba(8, 11, 17, 0.15)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const statusColor = realSeq.clase === 0 ? '#10b981' : realSeq.clase === 1 ? '#ef4444' : '#f59e0b';

        // HUD Superior
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(10, 10, canvas.width - 20, 62);
        ctx.fillStyle = statusColor;
        ctx.font = 'bold 12px "JetBrains Mono", monospace';
        const sourceLabel = seq.isExampleDemo ? '🎬 VIDEO MP4 EN VIVO' : '● PENN ACTION DATASET';
        ctx.fillText(`${sourceLabel} | ${realSeq.action}`, 18, 30);
        ctx.fillStyle = '#ffffff';
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillText(`DIAGNÓSTICO: ${realSeq.nombre?.toUpperCase()} | CONFIANZA: ${(realSeq.confianza * 100).toFixed(1)}%`, 18, 48);

        // Reps simuladas en vivo para demos
        const simulatedReps = seq.isExampleDemo ? Math.floor(curFrameIdx / 15) + 1 : 0;
        if (simulatedReps > 0) {
          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 11px "JetBrains Mono", monospace';
          ctx.fillText(`REPS: ${simulatedReps} | FASE: ${curFrameIdx % 30 < 15 ? 'DESCENSO' : 'ASCENSO'}`, 18, 62);
        }

        // Score circular
        const scoreVal = (realSeq.confianza || 0.94) * 100;
        const scoreX = canvas.width - 90;
        const scoreY = 42;
        const scoreRadius = 26;
        const scoreAngle = (scoreVal / 100) * Math.PI * 2;

        ctx.beginPath();
        ctx.arc(scoreX, scoreY, scoreRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(scoreX, scoreY, scoreRadius, -Math.PI / 2, -Math.PI / 2 + scoreAngle);
        ctx.strokeStyle = statusColor;
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${scoreVal.toFixed(0)}`, scoreX, scoreY + 5);
        ctx.textAlign = 'start';

        // Rejilla de escaneo
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.06)';
        ctx.lineWidth = 1;
        for (let gy = 0; gy < canvas.height; gy += 40) {
          ctx.beginPath();
          ctx.moveTo(0, gy);
          ctx.lineTo(canvas.width, gy);
          ctx.stroke();
        }

        // Dibujar articulaciones reales del dataset
        if (frameData.joints) {
          ctx.lineCap = 'round';
          PENN_CONNECTIONS.forEach(([i, j]) => {
            if (frameData.joints[i] && frameData.joints[j]) {
              ctx.strokeStyle = statusColor;
              ctx.lineWidth = 8;
              ctx.globalAlpha = 0.25;
              ctx.beginPath();
              ctx.moveTo(frameData.joints[i].x, frameData.joints[i].y);
              ctx.lineTo(frameData.joints[j].x, frameData.joints[j].y);
              ctx.stroke();

              ctx.globalAlpha = 1.0;
              ctx.lineWidth = 4;
              ctx.beginPath();
              ctx.moveTo(frameData.joints[i].x, frameData.joints[i].y);
              ctx.lineTo(frameData.joints[j].x, frameData.joints[j].y);
              ctx.stroke();
            }
          });

          frameData.joints.forEach(pt => {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 12, 0, Math.PI * 2);
            ctx.fillStyle = statusColor;
            ctx.globalAlpha = 0.15;
            ctx.fill();
            ctx.globalAlpha = 1.0;

            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = statusColor;
            ctx.stroke();
          });
        }
      }
      // =========================================================================
      // MODO 2: CÁMARA WEB EN VIVO O VIDEO SUBIDO POR EL USUARIO (MediaPipe Pose)
      // =========================================================================
      else if (seq.isUploadedVideo || isWebcam) {
        const videoSource = isWebcam ? webcamRef.current : videoRef.current;

        if (videoSource && videoSource.readyState >= 2) {
          ctx.drawImage(videoSource, 0, 0, canvas.width, canvas.height);

          if (mpReady && mpPoseRef.current && !processingFrame && !videoSource.paused) {
            processingFrame = true;
            try {
              await mpPoseRef.current.send({ image: videoSource });
            } catch (e) {
              // Ignorar frames intermedios durante carga
            } finally {
              processingFrame = false;
            }
          }
        } else {
          ctx.fillStyle = '#080b11';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

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
          } else {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
            ctx.fillRect(canvas.width / 2 - 180, canvas.height / 2 - 22, 360, 44);
            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 13px "JetBrains Mono", monospace';
            ctx.textAlign = 'center';
            const msg = !mpReady ? '⚡ CARGANDO MOTOR IA MEDIAPIPE CDN...' : '⏳ CARGANDO FOTOGRAMAS DEL VIDEO...';
            ctx.fillText(msg, canvas.width / 2, canvas.height / 2 + 5);
            ctx.textAlign = 'start';
          }
        }

        ctx.fillStyle = 'rgba(8, 11, 17, 0.15)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const statusColor = seq.clase === 0 ? '#10b981' : seq.clase === 1 ? '#ef4444' : '#f59e0b';

        // HUD superior para webcam / subida
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(10, 10, canvas.width - 20, 62);
        ctx.fillStyle = statusColor;
        ctx.font = 'bold 12px "JetBrains Mono", monospace';
        const sourceLabel = isWebcam ? '📹 CÁMARA WEB EN VIVO' : '📁 VIDEO PERSONAL SUBIDO';
        ctx.fillText(`● ${sourceLabel} | ${seq.action}`, 18, 30);
        ctx.fillStyle = '#ffffff';
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillText(`DIAGNÓSTICO: ${seq.nombre?.toUpperCase()} | CONFIANZA: ${(seq.confianza * 100).toFixed(1)}%`, 18, 48);

        if (seq.repCount > 0) {
          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 11px "JetBrains Mono", monospace';
          ctx.fillText(`REPS: ${seq.repCount} | FASE: ${seq.phase?.toUpperCase() || 'IDLE'}`, 18, 62);
        }

        if (seq.qualityScore !== undefined && seq.qualityScore > 0) {
          const scoreX = canvas.width - 90;
          const scoreY = 42;
          const scoreRadius = 26;
          const scoreAngle = (seq.qualityScore / 100) * Math.PI * 2;

          ctx.beginPath();
          ctx.arc(scoreX, scoreY, scoreRadius, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255,255,255,0.1)';
          ctx.lineWidth = 5;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(scoreX, scoreY, scoreRadius, -Math.PI / 2, -Math.PI / 2 + scoreAngle);
          ctx.strokeStyle = statusColor;
          ctx.lineWidth = 5;
          ctx.lineCap = 'round';
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 14px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`${seq.qualityScore.toFixed(0)}`, scoreX, scoreY + 5);
          ctx.textAlign = 'start';
        }

        const lm = mpLandmarksRef.current;
        if (lm && (videoSource?.readyState >= 2)) {
          const joints = MP_TO_PENN.map(idx => ({
            x: lm[idx].x * canvas.width,
            y: lm[idx].y * canvas.height,
            vis: lm[idx].visibility
          }));

          ctx.lineCap = 'round';
          PENN_CONNECTIONS.forEach(([i, j]) => {
            if (joints[i].vis > 0.35 && joints[j].vis > 0.35) {
              ctx.strokeStyle = statusColor;
              ctx.lineWidth = 8;
              ctx.globalAlpha = 0.25;
              ctx.beginPath();
              ctx.moveTo(joints[i].x, joints[i].y);
              ctx.lineTo(joints[j].x, joints[j].y);
              ctx.stroke();

              ctx.globalAlpha = 1.0;
              ctx.lineWidth = 4;
              ctx.beginPath();
              ctx.moveTo(joints[i].x, joints[i].y);
              ctx.lineTo(joints[j].x, joints[j].y);
              ctx.stroke();
            }
          });

          joints.forEach(pt => {
            if (pt.vis > 0.35) {
              ctx.beginPath();
              ctx.arc(pt.x, pt.y, 12, 0, Math.PI * 2);
              ctx.fillStyle = statusColor;
              ctx.globalAlpha = 0.15;
              ctx.fill();
              ctx.globalAlpha = 1.0;

              ctx.beginPath();
              ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
              ctx.fillStyle = '#ffffff';
              ctx.fill();
              ctx.lineWidth = 2.5;
              ctx.strokeStyle = statusColor;
              ctx.stroke();
            }
          });
        }
      }
      // =========================================================================
      // MODO 3: ESQUELETO CINEMÁTICO SIMULADO (Respaldo técnico)
      // =========================================================================
      else {
        ctx.fillStyle = '#080b11';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

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

        const colorHex = seq.clase === 0 ? '#10b981' : seq.clase === 1 ? '#ef4444' : '#f59e0b';

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
          { x: 320 + backErrorOffset * 0.5, y: 75 + flex * 18 },
          { x: 285 + backErrorOffset, y: 115 + flex * 20 },
          { x: 355 + backErrorOffset, y: 115 + flex * 20 },
          { x: 260, y: 165 + flex * 15 },
          { x: 380, y: 165 + flex * 15 },
          { x: 250, y: 215 + flex * 10 },
          { x: 390, y: 215 + flex * 10 },
          { x: 295, y: 210 + flex * 55 },
          { x: 345, y: 210 + flex * 55 },
          { x: 285 + kneeValgoOffset, y: 290 + flex * 30 },
          { x: 355 - kneeValgoOffset, y: 290 + flex * 30 },
          { x: 280, y: 355 },
          { x: 360, y: 355 }
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
  }, [seq, mpReady, frameIdx, isWebcam, webcamActive, webcamError, videoSrc]);

  return (
    <div className="canvas-container">
      <canvas ref={canvasRef} width={640} height={420} />
      {/* Video oculto para archivo o subida */}
      {seq.isUploadedVideo && !isWebcam && (
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          crossOrigin="anonymous"
          onLoadedMetadata={() => {
            videoRef.current?.play().catch(() => {});
          }}
          style={{ display: 'none' }}
        />
      )}
      {/* Video oculto para webcam */}
      {isWebcam && (
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
            disabled={isWebcam || seq.isUploadedVideo}
          />
          <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
            {isWebcam ? '📹 WEBCAM' : seq.isUploadedVideo ? '📁 LIVE' : `${(frameIdx % 46) + 1} / 46`}
          </span>
        </div>
      </div>
    </div>
  );
}
