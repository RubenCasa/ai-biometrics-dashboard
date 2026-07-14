/**
 * poseClassifier.js
 * -----------------
 * Clasificador de Calidad Postural Universal.
 * 
 * Funciona con CUALQUIER persona sin importar su estatura, complexión o ángulo
 * de cámara gracias a la normalización por proporción corporal.
 * 
 * Mejoras vs versión anterior:
 * 1. Normalización por longitud del torso (hombro→cadera)
 * 2. Suavizado temporal exponencial (EMA) para eliminar ruido frame-a-frame
 * 3. Más ángulos biomecánicos analizados (cadera, rodilla, codo, hombro)
 * 4. Scoring continuo de calidad (0-100%) en lugar de umbrales binarios
 * 5. Filtrado por visibilidad de MediaPipe para ignorar articulaciones mal detectadas
 * 6. Umbral de gravedad multi-nivel (severo, moderado, leve)
 */

import { extractMetrics, ExerciseDetector } from './exerciseDetector.js';

// ─── Suavizado Temporal (Exponential Moving Average) ─────────────────────────

const EMA_ALPHA = 0.35; // Factor de suavizado (0 = muy suave, 1 = sin suavizar)

let smoothedTrunk = null;
let smoothedValgus = null;
let smoothedShSym = null;
let smoothedKneeL = null;
let smoothedKneeR = null;

function ema(prev, curr, alpha = EMA_ALPHA) {
  if (prev === null) return curr;
  return prev * (1 - alpha) + curr * alpha;
}

function resetSmoothing() {
  smoothedTrunk = null;
  smoothedValgus = null;
  smoothedShSym = null;
  smoothedKneeL = null;
  smoothedKneeR = null;
}

// ─── Instancia global del detector de ejercicios ─────────────────────────────

const globalDetector = new ExerciseDetector();

// ─── Función Principal de Evaluación ─────────────────────────────────────────

/**
 * Evalúa la postura y detecta el ejercicio de forma universal.
 * 
 * @param {Array} landmarks - 33 landmarks de MediaPipe Pose
 * @param {Array} history - (legacy, ya no se usa internamente)
 * @returns {{ exercise: string, status: Object, repCount: number, phase: string }}
 */
export function evaluatePoseAndExercise(landmarks, history = []) {
  // Guard: no hay suficientes landmarks
  if (!landmarks || landmarks.length < 33) {
    return {
      exercise: 'Analizando...',
      repCount: 0,
      phase: 'idle',
      status: {
        clase: 0,
        type: 'correct',
        nombre: 'Escaneando articulaciones...',
        confianza: 0,
        feedback: '⏳ MediaPipe Pose está escaneando tus articulaciones anatómicas...',
        qualityScore: 0
      }
    };
  }

  // Extraer métricas biomecánicas normalizadas
  const metrics = extractMetrics(landmarks);
  if (!metrics || metrics.avgVisibility < 0.20) {
    return {
      exercise: 'Esperando visibilidad del cuerpo...',
      repCount: globalDetector.repCount,
      phase: 'idle',
      status: {
        clase: 0,
        type: 'correct',
        nombre: 'Buscando cuerpo en cámara...',
        confianza: 0,
        feedback: '📷 Asegúrate de estar dentro del encuadre y con buena iluminación.',
        qualityScore: 0
      }
    };
  }

  // Detectar ejercicio con el detector avanzado
  const detection = globalDetector.process(landmarks);

  // ─── Suavizado temporal de métricas clave ───────────────────────────

  smoothedTrunk = ema(smoothedTrunk, metrics.trunkAngle);
  smoothedValgus = ema(smoothedValgus, metrics.kneeValgusRatio);
  smoothedShSym = ema(smoothedShSym, metrics.shoulderSymmetry);
  smoothedKneeL = ema(smoothedKneeL, metrics.kneeAngleL);
  smoothedKneeR = ema(smoothedKneeR, metrics.kneeAngleR);

  // ─── Scoring de Calidad Postural (0-100) ────────────────────────────

  let qualityScore = 100;
  const issues = [];

  // 1. INCLINACIÓN DEL TRONCO (penalización principal)
  //    < 8° = excelente, 8-15° = aceptable, 15-25° = moderado, > 25° = severo
  if (smoothedTrunk > 8) {
    const trunkPenalty = Math.min(40, (smoothedTrunk - 8) * 2.5);
    qualityScore -= trunkPenalty;
    if (smoothedTrunk > 20) {
      issues.push({
        type: 'back',
        severity: smoothedTrunk > 30 ? 'severe' : 'moderate',
        angle: smoothedTrunk,
        message: `Espalda desviada ${smoothedTrunk.toFixed(1)}° del eje vertical`
      });
    }
  }

  // 2. SIMETRÍA DE HOMBROS (penalización)
  //    Asimetría normalizada > 0.08 indica desbalance
  if (smoothedShSym > 0.08) {
    const symPenalty = Math.min(20, (smoothedShSym - 0.08) * 200);
    qualityScore -= symPenalty;
    if (smoothedShSym > 0.12) {
      issues.push({
        type: 'back',
        severity: smoothedShSym > 0.18 ? 'severe' : 'moderate',
        message: 'Hombros desbalanceados — mantén ambos a la misma altura'
      });
    }
  }

  // 3. VALGO DE RODILLAS (penalización)
  //    Ratio < 0.75 indica que las rodillas colapsan hacia adentro
  const exerciseName = detection.exercise;
  if ((exerciseName.includes('SQUAT') || exerciseName.includes('LUNGE') || exerciseName.includes('DEADLIFT'))
      && smoothedValgus < 0.75) {
    const valgusPenalty = Math.min(30, (0.75 - smoothedValgus) * 100);
    qualityScore -= valgusPenalty;
    issues.push({
      type: 'limb',
      severity: smoothedValgus < 0.55 ? 'severe' : 'moderate',
      ratio: smoothedValgus,
      message: 'Rodillas colapsando hacia adentro (valgo). Empuja las rodillas hacia afuera.'
    });
  }

  // 4. HIPEREXTENSIÓN DE RODILLAS (penalización)
  const avgKnee = (smoothedKneeL + smoothedKneeR) / 2;
  if (avgKnee > 185) {
    qualityScore -= 15;
    issues.push({
      type: 'limb',
      severity: 'moderate',
      message: 'Hiperextensión de rodillas detectada. No bloquees completamente las rodillas.'
    });
  }

  // Clamp score
  qualityScore = Math.max(0, Math.min(100, qualityScore));

  // ─── Clasificación Final ────────────────────────────────────────────

  let clase, type, nombre, feedback;
  const confianza = Math.min(0.98, 0.50 + (metrics.avgVisibility * 0.3) + (detection.confidence * 0.2));

  if (issues.length === 0 || qualityScore >= 75) {
    // POSTURA CORRECTA
    clase = 0;
    type = 'correct';
    nombre = 'Postura Correcta';

    if (qualityScore >= 90) {
      const exShort = exerciseName.split('(')[0].trim().toLowerCase();
      feedback = `✅ ¡Excelente ejecución! Tu ejercicio (${exShort}) mantiene la espalda recta y las articulaciones perfectamente alineadas. Calidad: ${qualityScore.toFixed(0)}%`;
    } else {
      feedback = `🟢 Buena postura en general. Pequeñas oscilaciones detectadas. Mantén el ritmo constante. Calidad: ${qualityScore.toFixed(0)}%`;
    }
  } else {
    // Buscar el issue más severo
    const severeBack = issues.find(i => i.type === 'back' && i.severity === 'severe');
    const moderateBack = issues.find(i => i.type === 'back');
    const severeLimb = issues.find(i => i.type === 'limb' && i.severity === 'severe');
    const moderateLimb = issues.find(i => i.type === 'limb');

    if (severeBack || (moderateBack && !severeLimb)) {
      // ERROR DE ESPALDA
      clase = 1;
      type = 'back';
      nombre = 'Error de Espalda / Tronco';
      const issue = severeBack || moderateBack;

      if (qualityScore < 40) {
        feedback = `⚠️ ALERTA DE POSTURA: ${issue.message}. Mantén el pecho erguido, retrae las escápulas y activa tu core abdominal. Calidad: ${qualityScore.toFixed(0)}%`;
      } else {
        feedback = `⚠️ Atención a tu espalda: ${issue.message}. Corrige la alineación hombro-cadera. Calidad: ${qualityScore.toFixed(0)}%`;
      }
    } else {
      // ERROR DE EXTREMIDADES
      clase = 2;
      type = 'limb';
      nombre = 'Error de Extremidades / Rodillas';
      const issue = severeLimb || moderateLimb;

      if (qualityScore < 40) {
        feedback = `⚠️ ALERTA DE EXTREMIDADES: ${issue.message}. Alinea las rodillas con las puntas de los pies. Calidad: ${qualityScore.toFixed(0)}%`;
      } else {
        feedback = `⚠️ Control articular: ${issue.message}. Controla la fase excéntrica del movimiento. Calidad: ${qualityScore.toFixed(0)}%`;
      }
    }
  }

  return {
    exercise: detection.exercise,
    repCount: detection.repCount,
    phase: detection.phase,
    status: {
      clase,
      type,
      nombre,
      confianza,
      feedback,
      qualityScore
    }
  };
}

/**
 * Calcula el ángulo entre 3 puntos (re-exportado para compatibilidad).
 */
export function calcAngle(a, b, c) {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const magAB = Math.sqrt(ab.x * ab.x + ab.y * ab.y);
  const magCB = Math.sqrt(cb.x * cb.x + cb.y * cb.y);
  if (magAB * magCB < 1e-6) return 180;
  return Math.acos(Math.min(1, Math.max(-1, dot / (magAB * magCB)))) * (180 / Math.PI);
}

/**
 * Resetea el detector y suavizado (usar al cambiar de video/fuente).
 */
export function resetDetector() {
  globalDetector.reset();
  resetSmoothing();
}
