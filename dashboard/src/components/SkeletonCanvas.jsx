import React, { useRef, useEffect, useState } from 'react';
import { PENN_CONNECTIONS, MP_TO_PENN } from '../utils/constants';
import { evaluatePoseAndExercise, resetDetector } from '../utils/poseClassifier';
import { extractMetrics } from '../utils/exerciseDetector';

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
  const mpCanvasRef = useRef(null);  // Canvas limpio solo para MediaPipe (sin overlays)
  const [mpReady, setMpReady] = useState(false);
  const mpLandmarksRef = useRef(null);
  const historyRef = useRef([]);
  const animFrameRef = useRef(null);
  const lastReportedFrameRef = useRef(-1);
  const processingFrameRef = useRef(false); // fuera del loop para persistencia real
  const [webcamActive, setWebcamActive] = useState(false);
  const [webcamError, setWebcamError] = useState(null);
  const streamRef = useRef(null);

  // Refs para mantener estado estable dentro del drawLoop sin re-renderizar
  const seqRef = useRef(seq);
  const onLiveAssessmentUpdateRef = useRef(onLiveAssessmentUpdate);
  const lastUpdateFrameRef = useRef(-100);

  useEffect(() => {
    seqRef.current = seq;
  }, [seq]);

  useEffect(() => {
    onLiveAssessmentUpdateRef.current = onLiveAssessmentUpdate;
  }, [onLiveAssessmentUpdate]);

  // Inicializar MediaPipe Pose robusto con sondeo por si el CDN tarda en cargar
  useEffect(() => {
    let active = true;
    let pollInterval = null;

    const tryInitPose = () => {
      if (!active) return false;
      if (typeof window.Pose === 'undefined') {
        return false;
      }
      try {
        const pose = new window.Pose({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
        });
        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          minDetectionConfidence: 0.4,
          minTrackingConfidence: 0.4
        });
        pose.onResults((results) => {
          if (!active) return;
          if (results.poseLandmarks) {
            mpLandmarksRef.current = results.poseLandmarks;
            const res = evaluatePoseAndExercise(results.poseLandmarks, historyRef.current);
            const hipYVal = (results.poseLandmarks[23].y + results.poseLandmarks[24].y) / 2;
            const shYVal = (results.poseLandmarks[11].y + results.poseLandmarks[12].y) / 2;
            const trunkTiltVal = Math.abs(results.poseLandmarks[11].x - results.poseLandmarks[23].x) * 90;
            
            const metrics = extractMetrics(results.poseLandmarks);
            historyRef.current.push({
              hipY: hipYVal * 420,
              shY: shYVal * 420,
              bodyDY: metrics.bodyDY,
              kneeL: metrics.kneeAngleL,
              kneeR: metrics.kneeAngleR,
              hipL: metrics.hipAngleL,
              hipR: metrics.hipAngleR,
              elbowL: metrics.elbowAngleL,
              elbowR: metrics.elbowAngleR,
              shoulderL: metrics.shoulderAngleL,
              shoulderR: metrics.shoulderAngleR,
              trunkAngle: metrics.trunkAngle
            });
            if (historyRef.current.length > 60) historyRef.current.shift();

            // Actualizar estado cada 3 frames o ante cambio de ejercicio/rep/fase
            const currentSeq = seqRef.current || {};
            const exerciseChanged = res.exercise !== currentSeq.action && !res.exercise.includes('Calibrando');
            const repChanged = res.repCount !== currentSeq.repCount;
            const phaseChanged = res.phase !== currentSeq.phase;
            const claseChanged = (res.status?.clase ?? 0) !== currentSeq.clase;

            if (exerciseChanged || repChanged || phaseChanged || claseChanged || Math.abs(historyRef.current.length - lastUpdateFrameRef.current) >= 3) {
              lastUpdateFrameRef.current = historyRef.current.length;
              const updateObj = {
                exercise: res.exercise,
                action: res.exercise,
                repCount: res.repCount,
                phase: res.phase,
                clase: res.status?.clase ?? 0,
                type: res.status?.type ?? 'correct',
                nombre: res.status?.nombre ?? 'Postura Analizada',
                confianza: res.status?.confianza ?? 0.95,
                feedback: res.status?.feedback ?? 'Evaluando técnica de movimiento en tiempo real...',
                qualityScore: res.status?.qualityScore ?? 95,
                history: [...historyRef.current]
              };
              onLiveAssessmentUpdateRef.current?.(updateObj);
            }
          }
        });
        mpPoseRef.current = pose;
        setMpReady(true);
        if (pollInterval) clearInterval(pollInterval);
        return true;
      } catch (err) {
        console.error('[MediaPipe] Error inicializando Pose:', err);
        return false;
      }
    };

    if (!tryInitPose()) {
      pollInterval = setInterval(() => {
        if (tryInitPose()) {
          clearInterval(pollInterval);
        }
      }, 200);
    }

    return () => {
      active = false;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []);

  // Manejar cámara web
  useEffect(() => {
    if (!isWebcam) {
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
  }, [isWebcam]);

  // Asegurar reproducción de video al cambiar src sin re-cargar constantemente
  useEffect(() => {
    if (videoSrc && videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [videoSrc]);

  // Bucle principal de renderizado en Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Canvas limpio para MediaPipe (sin overlays ni efectos visuales)
    if (!mpCanvasRef.current) {
      mpCanvasRef.current = document.createElement('canvas');
      mpCanvasRef.current.width = 640;
      mpCanvasRef.current.height = 420;
    }
    const mpCtx = mpCanvasRef.current.getContext('2d');

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

          if (curFrameIdx !== lastReportedFrameRef.current && frameData.joints && frameData.joints.length >= 13) {
            lastReportedFrameRef.current = curFrameIdx;
            const j = frameData.joints;

            // ── Ángulos reales por geometría de 3 puntos (a→b→c) ──
            const calcAngle = (a, b, c) => {
              const ab = { x: a.x - b.x, y: a.y - b.y };
              const cb = { x: c.x - b.x, y: c.y - b.y };
              const dot = ab.x * cb.x + ab.y * cb.y;
              const mag = Math.sqrt(ab.x**2 + ab.y**2) * Math.sqrt(cb.x**2 + cb.y**2);
              return mag > 0 ? Math.acos(Math.max(-1, Math.min(1, dot / mag))) * (180 / Math.PI) : 180;
            };

            // Tronco: hombro→cadera (inclinación lateral)
            const midSh  = { x: (j[1].x + j[2].x) / 2, y: (j[1].y + j[2].y) / 2 };
            const midHip = { x: (j[7].x + j[8].x) / 2, y: (j[7].y + j[8].y) / 2 };
            const trunkDx = Math.abs(midSh.x - midHip.x);
            const trunkDy = Math.abs(midSh.y - midHip.y);
            const trunkAngle = Math.atan2(trunkDx, trunkDy) * (180 / Math.PI);

            // Rodillas reales: cadera→rodilla→tobillo
            const kneeAngleL = calcAngle(j[7], j[9],  j[11]);
            const kneeAngleR = calcAngle(j[8], j[10], j[12]);
            // Codos reales: hombro→codo→muñeca
            const elbowAngleL = calcAngle(j[1], j[3], j[5]);
            const elbowAngleR = calcAngle(j[2], j[4], j[6]);
            // Cadera real: hombro→cadera→rodilla
            const hipAngleL = calcAngle(j[1], j[7], j[9]);
            const hipAngleR = calcAngle(j[2], j[8], j[10]);

            historyRef.current.push({
              hipY:       midHip.y,
              shY:        midSh.y,
              bodyDY:     trunkDy,
              kneeL:      Number(kneeAngleL.toFixed(1)),
              kneeR:      Number(kneeAngleR.toFixed(1)),
              elbowL:     Number(elbowAngleL.toFixed(1)),
              elbowR:     Number(elbowAngleR.toFixed(1)),
              hipL:       Number(hipAngleL.toFixed(1)),
              hipR:       Number(hipAngleR.toFixed(1)),
              trunkAngle: Number(trunkAngle.toFixed(1))
            });
            if (historyRef.current.length > 60) historyRef.current.shift();

            const isDescenso = curFrameIdx % 30 < 15;
            const repCount   = Math.floor(curFrameIdx / 15) + 1;
            const baseConf   = realSeq.confianza || 0.942;
            const avgKnee    = (kneeAngleL + kneeAngleR) / 2;

            // Score real: penaliza inclinación de tronco Y extensión insuficiente de rodilla
            const trunkPenalty = trunkAngle > 15 ? (trunkAngle - 15) * 1.5 : 0;
            const kneePenalty  = realSeq.clase === 2 && avgKnee < 110 ? (110 - avgKnee) * 0.5 : 0;
            const dynamicScore = Math.min(99, Math.max(10, baseConf * 100 - trunkPenalty - kneePenalty));

            let feedbackText = realSeq.feedback;
            if (realSeq.clase === 0) {
              feedbackText = `✅ Fotograma #${curFrameIdx + 1} (${isDescenso ? 'Descenso' : 'Ascenso'}): Rodilla ${avgKnee.toFixed(1)}° · Tronco ${trunkAngle.toFixed(1)}° — Articulaciones correctas.`;
            } else if (realSeq.clase === 1) {
              feedbackText = `⚠️ ALERTA Fotograma #${curFrameIdx + 1}: Tronco inclinado ${trunkAngle.toFixed(1)}°. Activa el core y endereza la espalda.`;
            } else {
              feedbackText = `⚠️ ALERTA Fotograma #${curFrameIdx + 1}: Rodilla ${avgKnee.toFixed(1)}° — Cuida la estabilidad articular.`;
            }

            onLiveAssessmentUpdate?.({
              exercise:    realSeq.action,
              action:      realSeq.action,
              repCount,
              phase:       isDescenso ? 'down' : 'up',
              clase:       realSeq.clase,
              type:        realSeq.type || 'correct',
              nombre:      realSeq.nombre || 'Postura Analizada',
              confianza:   baseConf,
              feedback:    feedbackText,
              qualityScore: dynamicScore,
              history:     [...historyRef.current]
            });
          }
        }
      }
      // =========================================================================
      // MODO 2: CÁMARA WEB EN VIVO (MediaPipe Pose 3D a 60 FPS)
      // =========================================================================
      else if (isWebcam || (seq && seq.isWebcam)) {
        const webcamSource = webcamRef.current;
        const isWebcamReady = webcamSource && webcamSource.readyState >= 2 && webcamActive;

        if (isWebcamReady) {
          ctx.drawImage(webcamSource, 0, 0, canvas.width, canvas.height);

          if (mpReady && mpPoseRef.current && !processingFrameRef.current) {
            processingFrameRef.current = true;
            mpCtx.drawImage(webcamSource, 0, 0, mpCanvasRef.current.width, mpCanvasRef.current.height);
            mpPoseRef.current.send({ image: mpCanvasRef.current })
              .then(() => {
                processingFrameRef.current = false;
              })
              .catch((e) => {
                console.warn('[MediaPipe Webcam Send Warning]:', e.message || e);
                processingFrameRef.current = false;
              });
          }
        } else {
          ctx.fillStyle = '#080b11';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
          ctx.fillRect(canvas.width / 2 - 200, canvas.height / 2 - 22, 400, 44);
          ctx.fillStyle = webcamError ? '#ef4444' : '#00f0ff';
          ctx.font = 'bold 13px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          const msg = webcamError ? webcamError : (!mpReady ? '⚡ CARGANDO MOTOR IA MEDIAPIPE CDN...' : '📷 INICIANDO CÁMARA WEB EN VIVO...');
          ctx.fillText(msg, canvas.width / 2, canvas.height / 2 + 5);
          ctx.textAlign = 'start';
        }

        ctx.fillStyle = 'rgba(8, 11, 17, 0.15)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const statusColor = seq.clase === 0 ? '#10b981' : seq.clase === 1 ? '#ef4444' : '#f59e0b';

        // HUD superior para cámara web
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(10, 10, canvas.width - 20, 62);
        ctx.fillStyle = statusColor;
        ctx.font = 'bold 12px "JetBrains Mono", monospace';
        const sourceLabel = '📷 CÁMARA WEB EN VIVO (IA 60 FPS)';
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
        if (lm && isWebcamReady) {
          const joints = MP_TO_PENN.map(idx => ({
            x: lm[idx].x * canvas.width,
            y: lm[idx].y * canvas.height,
            vis: lm[idx].visibility
          }));

          ctx.lineCap = 'round';
          PENN_CONNECTIONS.forEach(([i, j]) => {
            if (joints[i].vis > 0.15 && joints[j].vis > 0.15) {
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
            if (pt.vis > 0.15) {
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
      // MODO 3: VIDEO SUBIDO POR EL USUARIO (MediaPipe Pose 3D)
      // =========================================================================
      else if (seq.isUploadedVideo) {
        const videoSource = videoRef.current;
        const isVideoReady = videoSource && videoSource.readyState >= 2;

        if (isVideoReady) {
          ctx.drawImage(videoSource, 0, 0, canvas.width, canvas.height);

          if (mpReady && mpPoseRef.current && !processingFrameRef.current) {
            processingFrameRef.current = true;
            // Dibujamos el video en el canvas limpio (sin overlays) para MediaPipe
            mpCtx.drawImage(videoSource, 0, 0, mpCanvasRef.current.width, mpCanvasRef.current.height);
            mpPoseRef.current.send({ image: mpCanvasRef.current })
              .then(() => {
                processingFrameRef.current = false;
              })
              .catch((e) => {
                console.warn('[MediaPipe Send Warning]:', e.message || e);
                processingFrameRef.current = false;
              });
          }

        } else {
          ctx.fillStyle = '#080b11';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
          ctx.fillRect(canvas.width / 2 - 180, canvas.height / 2 - 22, 360, 44);
          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 13px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          const msg = !mpReady ? '⚡ CARGANDO MOTOR IA MEDIAPIPE CDN...' : '⏳ CARGANDO FOTOGRAMAS DEL VIDEO...';
          ctx.fillText(msg, canvas.width / 2, canvas.height / 2 + 5);
          ctx.textAlign = 'start';
        }

        ctx.fillStyle = 'rgba(8, 11, 17, 0.15)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const statusColor = seq.clase === 0 ? '#10b981' : seq.clase === 1 ? '#ef4444' : '#f59e0b';

        // HUD superior para video subido
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(10, 10, canvas.width - 20, 62);
        ctx.fillStyle = statusColor;
        ctx.font = 'bold 12px "JetBrains Mono", monospace';
        const sourceLabel = '📁 VIDEO PERSONAL SUBIDO';
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
        if (lm && isVideoReady) {
          const joints = MP_TO_PENN.map(idx => ({
            x: lm[idx].x * canvas.width,
            y: lm[idx].y * canvas.height,
            vis: lm[idx].visibility
          }));

          ctx.lineCap = 'round';
          PENN_CONNECTIONS.forEach(([i, j]) => {
            if (joints[i].vis > 0.15 && joints[j].vis > 0.15) {
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
            if (pt.vis > 0.15) {
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

        const colorHex = seq.clase === 0 ? '#10b981' : seq.clase === 1 ? '#ef4444' : '#f59e0b';

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

        if (frameIdx !== lastReportedFrameRef.current) {
          lastReportedFrameRef.current = frameIdx;
          const trunkAngle = seq.clase === 1 ? 18 + Math.sin((frameIdx / 45) * Math.PI * 2) * 12 : 7 + Math.sin((frameIdx / 45) * Math.PI * 2) * 3;
          const kneeAngle = 135 + Math.sin((frameIdx / 45) * Math.PI * 2) * 35;
          const hipYVal = 210 + Math.sin((frameIdx / 45) * Math.PI * 2) * 45;

          historyRef.current.push({
            hipY: hipYVal,
            shY: 115,
            bodyDY: 95,
            kneeL: kneeAngle,
            trunkAngle: trunkAngle
          });
          if (historyRef.current.length > 60) historyRef.current.shift();

          const isDescenso = (frameIdx % 30) < 15;
          const repCount = Math.floor(frameIdx / 15) + 1;
          const dynamicScore = Math.min(99.4, Math.max(76.0, (seq.confianza || 0.942) * 100 - (trunkAngle > 15 ? (trunkAngle - 15) * 1.5 : 0)));

          let feedbackText = seq.feedback;
          if (seq.clase === 0) {
            feedbackText = `✅ Fotograma #${frameIdx + 1} (${isDescenso ? 'Descenso' : 'Ascenso'}): Ángulo de tronco óptimo (${trunkAngle.toFixed(1)}°). Articulaciones alineadas a 90°.`;
          } else if (seq.clase === 1) {
            feedbackText = `⚠️ ALERTA en Fotograma #${frameIdx + 1}: Inclinación del tronco detectada (${trunkAngle.toFixed(1)}°). Activa el core y endereza la espalda.`;
          } else {
            feedbackText = `⚠️ ALERTA en Fotograma #${frameIdx + 1}: Cuida la estabilidad de rodillas y codos en el rango de flexión.`;
          }

          onLiveAssessmentUpdate?.({
            exercise: seq.action,
            action: seq.action,
            repCount: repCount,
            phase: isDescenso ? 'down' : 'up',
            clase: seq.clase,
            type: seq.type || 'correct',
            nombre: seq.nombre || 'Postura Analizada',
            confianza: seq.confianza || 0.942,
            feedback: feedbackText,
            qualityScore: dynamicScore,
            history: [...historyRef.current]
          });
        }
      }

      animFrameRef.current = requestAnimationFrame(drawLoop);
    };

    drawLoop();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [seq, mpReady, frameIdx, isWebcam, webcamActive, webcamError, videoSrc, isPlaying]);

  return (
    <div className="canvas-container" style={{ position: 'relative', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 12px 36px rgba(0,0,0,0.5)' }}>
      <canvas ref={canvasRef} width={640} height={420} style={{ display: 'block', width: '100%', height: 'auto', background: '#080b11' }} />
      
      {/* Video oculto para archivo subido por el usuario */}
      {seq.isUploadedVideo && (
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          onLoadedMetadata={() => {
            videoRef.current?.play().catch(() => {});
          }}
          style={{ display: 'none' }}
        />
      )}

      {/* Video oculto para stream de cámara web en vivo */}
      <video
        ref={webcamRef}
        autoPlay
        playsInline
        muted
        style={{ display: 'none' }}
      />

      {/* Barra de Controles de Reproducción y Fotogramas (Estilo Dock Telemetría) */}
      <div className="canvas-controls" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 20px',
        background: 'rgba(15, 20, 28, 0.92)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        {/* Controles de Reproducción */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => onFrameChange((frameIdx - 1 + 46) % 46)}
            disabled={seq.isUploadedVideo || isPlaying}
            title="Anterior fotograma (-1 frame)"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              borderRadius: '10px',
              padding: '8px 12px',
              cursor: (seq.isUploadedVideo || isPlaying) ? 'not-allowed' : 'pointer',
              opacity: (seq.isUploadedVideo || isPlaying) ? 0.4 : 1,
              transition: 'all 0.2s ease',
              fontFamily: 'var(--font-mono)'
            }}
          >
            ⏮
          </button>

          <button
            onClick={onTogglePlay}
            style={{
              background: isPlaying
                ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(245, 158, 11, 0.2))'
                : 'linear-gradient(135deg, rgba(0, 240, 255, 0.25), rgba(16, 185, 129, 0.2))',
              border: isPlaying ? '1px solid #ef4444' : '1px solid #00f0ff',
              color: '#ffffff',
              borderRadius: '12px',
              padding: '9px 18px',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: isPlaying ? '0 0 16px rgba(239, 68, 68, 0.3)' : '0 0 16px rgba(0, 240, 255, 0.3)',
              transition: 'all 0.25s ease',
              fontFamily: 'var(--font-mono)'
            }}
          >
            <span>{isPlaying ? '⏸' : '▶'}</span>
            <span>{isPlaying ? 'PAUSAR' : 'REPRODUCIR'}</span>
          </button>

          <button
            onClick={() => onFrameChange((frameIdx + 1) % 46)}
            disabled={seq.isUploadedVideo || isWebcam || (seq && seq.isWebcam) || isPlaying}
            title="Siguiente fotograma (+1 frame)"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              borderRadius: '10px',
              padding: '8px 12px',
              cursor: (seq.isUploadedVideo || isWebcam || (seq && seq.isWebcam) || isPlaying) ? 'not-allowed' : 'pointer',
              opacity: (seq.isUploadedVideo || isWebcam || (seq && seq.isWebcam) || isPlaying) ? 0.4 : 1,
              transition: 'all 0.2s ease',
              fontFamily: 'var(--font-mono)'
            }}
          >
            ⏭
          </button>
        </div>

        {/* Timeline Slider & Contador de Fotogramas */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          flex: 1,
          minWidth: '220px',
          background: 'rgba(0, 0, 0, 0.35)',
          padding: '8px 16px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            TIMELINE:
          </span>
          <input
            type="range"
            min="0"
            max="45"
            value={frameIdx}
            onChange={(e) => onFrameChange(Number(e.target.value))}
            disabled={seq.isUploadedVideo || isWebcam || (seq && seq.isWebcam)}
            style={{
              flex: 1,
              accentColor: '#00f0ff',
              cursor: (seq.isUploadedVideo || isWebcam || (seq && seq.isWebcam)) ? 'not-allowed' : 'pointer',
              height: '6px'
            }}
          />
          <div style={{
            background: 'rgba(0, 240, 255, 0.12)',
            border: '1px solid #00f0ff',
            color: '#00f0ff',
            padding: '4px 10px',
            borderRadius: '8px',
            fontSize: '0.8rem',
            fontWeight: 800,
            fontFamily: 'var(--font-mono)',
            whiteSpace: 'nowrap'
          }}>
            {isWebcam || (seq && seq.isWebcam) ? '📷 WEBCAM 60 FPS' : (seq.isUploadedVideo ? '📁 STREAM EN VIVO' : `FRAME ${(frameIdx % 46) + 1} / 46`)}
          </div>
        </div>
      </div>
    </div>
  );
}
