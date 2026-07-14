/**
 * exerciseDetector.js
 * -------------------
 * Módulo avanzado de detección de ejercicios con conteo de repeticiones,
 * seguimiento de fase y suavizado temporal.
 * 
 * Funciona con CUALQUIER persona gracias a la normalización por
 * proporción corporal (distancia hombro-cadera como unidad base).
 */

// ─── Utilidades Geométricas ─────────────────────────────────────────────────

/**
 * Calcula el ángulo entre 3 puntos (en grados).
 * El ángulo se mide en el punto b (vértice).
 */
export function calcAngle(a, b, c) {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const magAB = Math.sqrt(ab.x * ab.x + ab.y * ab.y);
  const magCB = Math.sqrt(cb.x * cb.x + cb.y * cb.y);
  if (magAB * magCB < 1e-6) return 180;
  const cosine = Math.min(1, Math.max(-1, dot / (magAB * magCB)));
  return Math.acos(cosine) * (180 / Math.PI);
}

/**
 * Distancia euclidiana entre dos puntos normalizados.
 */
export function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/**
 * Punto medio entre dos landmarks.
 */
export function midpoint(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

// ─── Índices de MediaPipe Pose (33 landmarks) ────────────────────────────────

const MP = {
  NOSE: 0,
  L_SHOULDER: 11, R_SHOULDER: 12,
  L_ELBOW: 13, R_ELBOW: 14,
  L_WRIST: 15, R_WRIST: 16,
  L_HIP: 23, R_HIP: 24,
  L_KNEE: 25, R_KNEE: 26,
  L_ANKLE: 27, R_ANKLE: 28,
  L_HEEL: 29, R_HEEL: 30,
  L_FOOT: 31, R_FOOT: 32,
};

// ─── Extracción de Métricas Biomecánicas ─────────────────────────────────────

/**
 * Extrae todas las métricas biomecánicas relevantes de un frame de landmarks.
 * Todas las distancias se normalizan por la longitud del torso (hombro→cadera)
 * para que funcione con cualquier persona sin importar su estatura.
 */
export function extractMetrics(landmarks) {
  if (!landmarks || landmarks.length < 33) return null;

  const lSh = landmarks[MP.L_SHOULDER];
  const rSh = landmarks[MP.R_SHOULDER];
  const lHip = landmarks[MP.L_HIP];
  const rHip = landmarks[MP.R_HIP];
  const lKnee = landmarks[MP.L_KNEE];
  const rKnee = landmarks[MP.R_KNEE];
  const lAnkle = landmarks[MP.L_ANKLE];
  const rAnkle = landmarks[MP.R_ANKLE];
  const lElbow = landmarks[MP.L_ELBOW];
  const rElbow = landmarks[MP.R_ELBOW];
  const lWrist = landmarks[MP.L_WRIST];
  const rWrist = landmarks[MP.R_WRIST];
  const nose = landmarks[MP.NOSE];

  // Puntos medios
  const midShoulder = midpoint(lSh, rSh);
  const midHip = midpoint(lHip, rHip);
  const midKnee = midpoint(lKnee, rKnee);

  // Longitud del torso como unidad de normalización
  const torsoLen = dist(midShoulder, midHip) || 0.001;

  // ÁNGULOS ARTICULARES
  const kneeAngleL = calcAngle(lHip, lKnee, lAnkle);
  const kneeAngleR = calcAngle(rHip, rKnee, rAnkle);
  const hipAngleL = calcAngle(lSh, lHip, lKnee);
  const hipAngleR = calcAngle(rSh, rHip, rKnee);
  const elbowAngleL = calcAngle(lSh, lElbow, lWrist);
  const elbowAngleR = calcAngle(rSh, rElbow, rWrist);
  const shoulderAngleL = calcAngle(lElbow, lSh, lHip);
  const shoulderAngleR = calcAngle(rElbow, rSh, rHip);

  // INCLINACIÓN DEL TRONCO (desviación del eje vertical)
  const trunkDx = midShoulder.x - midHip.x;
  const trunkDy = midShoulder.y - midHip.y;
  const trunkAngle = Math.abs(Math.atan2(trunkDx, trunkDy) * (180 / Math.PI));

  // SIMETRÍA DE HOMBROS (desviación vertical)
  const shoulderSymmetry = Math.abs(lSh.y - rSh.y) / torsoLen;

  // VALGO DE RODILLAS (ratio rodilla/tobillo spread)
  const kneeSpread = Math.abs(lKnee.x - rKnee.x);
  const ankleSpread = Math.abs(lAnkle.x - rAnkle.x) || 0.001;
  const kneeValgusRatio = kneeSpread / ankleSpread;

  // PROFUNDIDAD DE CADERA (normalizada)
  const hipDepthNorm = midHip.y / torsoLen;

  // POSICIÓN RELATIVA (body orientation)
  const bodyDY = Math.abs(midShoulder.y - midHip.y) / torsoLen;

  // Confianza mínima de los landmarks clave
  const keyLandmarks = [lSh, rSh, lHip, rHip, lKnee, rKnee, lAnkle, rAnkle];
  const avgVisibility = keyLandmarks.reduce((s, l) => s + (l.visibility || 0), 0) / keyLandmarks.length;

  return {
    // Ángulos
    kneeAngleL, kneeAngleR,
    hipAngleL, hipAngleR,
    elbowAngleL, elbowAngleR,
    shoulderAngleL, shoulderAngleR,
    trunkAngle,

    // Métricas normalizadas
    shoulderSymmetry,
    kneeValgusRatio,
    hipDepthNorm,
    bodyDY,
    torsoLen,

    // Posiciones clave
    midShoulderY: midShoulder.y,
    midHipY: midHip.y,
    midHipX: midHip.x,
    midKneeY: midKnee.y,
    noseY: nose.y,

    // Calidad de detección
    avgVisibility,
  };
}


// ─── Clase Principal: Detector de Ejercicios ─────────────────────────────────

/**
 * ExerciseDetector - Detecta ejercicios, cuenta repeticiones y analiza
 * la fase del movimiento usando un buffer temporal de métricas.
 */
export class ExerciseDetector {
  constructor() {
    this.buffer = [];            // Buffer circular de métricas
    this.bufferSize = 90;        // ~3 segundos a 30fps
    this.repCount = 0;
    this.currentPhase = 'idle';  // 'up' | 'down' | 'idle'
    this.lastPhaseChange = 0;
    this.exerciseHistory = [];   // últimos 30 ejercicios detectados para suavizado
    this.minRepInterval = 12;    // mínimo 12 frames entre reps (~0.4s)
    this.framesSinceStart = 0;
  }

  /**
   * Procesa un frame de landmarks y retorna la detección actual.
   */
  process(landmarks) {
    const metrics = extractMetrics(landmarks);
    if (!metrics || metrics.avgVisibility < 0.4) {
      return {
        exercise: 'Esperando detección...',
        phase: 'idle',
        repCount: this.repCount,
        metrics: null,
        confidence: 0
      };
    }

    this.framesSinceStart++;

    // Agregar al buffer circular
    this.buffer.push(metrics);
    if (this.buffer.length > this.bufferSize) this.buffer.shift();

    // Necesitamos al menos 15 frames para clasificar
    if (this.buffer.length < 15) {
      return {
        exercise: 'Calibrando...',
        phase: 'idle',
        repCount: this.repCount,
        metrics,
        confidence: 0
      };
    }

    // Detectar ejercicio
    const detected = this._detectExercise(metrics);
    
    // Suavizar detección (voto mayoritario de últimos 30 frames)
    this.exerciseHistory.push(detected.name);
    if (this.exerciseHistory.length > 30) this.exerciseHistory.shift();
    const smoothedExercise = this._majorityVote(this.exerciseHistory);

    // Detectar fase y contar reps
    this._updatePhaseAndReps(metrics, smoothedExercise);

    return {
      exercise: smoothedExercise,
      phase: this.currentPhase,
      repCount: this.repCount,
      metrics,
      confidence: detected.confidence
    };
  }

  /**
   * Detecta qué ejercicio se está realizando basado en métricas biomecánicas.
   */
  _detectExercise(m) {
    const recent = this.buffer.slice(-20);

    // Rango de movimiento vertical de cadera (últimos 20 frames)
    const hipYs = recent.map(r => r.midHipY);
    const hipRange = Math.max(...hipYs) - Math.min(...hipYs);

    // Promedio de ángulos
    const avgKnee = recent.reduce((s, r) => s + (r.kneeAngleL + r.kneeAngleR) / 2, 0) / recent.length;
    const avgHip = recent.reduce((s, r) => s + (r.hipAngleL + r.hipAngleR) / 2, 0) / recent.length;
    const avgElbow = recent.reduce((s, r) => s + (r.elbowAngleL + r.elbowAngleR) / 2, 0) / recent.length;
    const avgBodyDY = recent.reduce((s, r) => s + r.bodyDY, 0) / recent.length;
    const avgTrunk = recent.reduce((s, r) => s + r.trunkAngle, 0) / recent.length;

    // Variación de ángulo de rodilla (indica movimiento cíclico)
    const kneeVariation = Math.max(...recent.map(r => (r.kneeAngleL + r.kneeAngleR) / 2))
                        - Math.min(...recent.map(r => (r.kneeAngleL + r.kneeAngleR) / 2));

    // ─── Reglas de Clasificación ─────────────────────────────────────

    // SQUAT: Gran rango vertical de cadera + rodillas flexionadas + tronco erguido
    if (hipRange > 0.08 && avgKnee < 155 && kneeVariation > 15 && avgBodyDY > 0.15) {
      return { name: 'SQUAT (Sentadilla)', confidence: Math.min(0.95, 0.6 + hipRange * 2) };
    }

    // PUSHUP: Cuerpo horizontal (bodyDY bajo) + codos flexionándose
    if (avgBodyDY < 0.20 && avgElbow < 155 && avgTrunk > 40) {
      return { name: 'PUSHUP (Flexión)', confidence: Math.min(0.92, 0.55 + (180 - avgElbow) / 100) };
    }

    // SITUP: Rango moderado de cadera + tronco se flexiona mucho
    if (hipRange > 0.05 && avgHip < 130 && avgBodyDY < 0.35) {
      return { name: 'SITUP (Abdominal)', confidence: Math.min(0.90, 0.50 + hipRange * 3) };
    }

    // LUNGE: Asimetría de rodillas (una muy flexionada, otra más extendida)
    const kneeAsymmetry = Math.abs(m.kneeAngleL - m.kneeAngleR);
    if (kneeAsymmetry > 25 && (m.kneeAngleL < 120 || m.kneeAngleR < 120) && hipRange > 0.05) {
      return { name: 'LUNGE (Zancada)', confidence: Math.min(0.88, 0.50 + kneeAsymmetry / 80) };
    }

    // DEADLIFT: Cadera se mueve mucho, tronco se inclina, rodillas casi extendidas
    if (hipRange > 0.06 && avgTrunk > 15 && avgKnee > 140) {
      return { name: 'DEADLIFT (Peso Muerto)', confidence: Math.min(0.85, 0.45 + avgTrunk / 50) };
    }

    // PLANK: Cuerpo horizontal y estático (poco movimiento)
    if (avgBodyDY < 0.18 && hipRange < 0.03 && avgTrunk > 50) {
      return { name: 'PLANK (Plancha)', confidence: 0.80 };
    }

    // JUMPING JACK: Movimiento rápido de brazos (ángulo de hombro cambia mucho)
    const shoulderVar = Math.max(...recent.map(r => (r.shoulderAngleL + r.shoulderAngleR) / 2))
                      - Math.min(...recent.map(r => (r.shoulderAngleL + r.shoulderAngleR) / 2));
    if (shoulderVar > 30 && hipRange > 0.03) {
      return { name: 'JUMPING JACK', confidence: Math.min(0.85, 0.50 + shoulderVar / 80) };
    }

    // OVERHEAD PRESS: Brazos se extienden hacia arriba
    if (m.shoulderAngleL > 140 && m.shoulderAngleR > 140 && avgElbow > 130) {
      return { name: 'PRESS (Prensa)', confidence: 0.78 };
    }

    // EJERCICIO GENERAL (no clasificado)
    return { name: 'EJERCICIO GENERAL', confidence: 0.50 };
  }

  /**
   * Actualiza la fase del ejercicio y cuenta repeticiones.
   * Usa un umbral dinámico basado en el rango de movimiento observado.
   */
  _updatePhaseAndReps(metrics, exercise) {
    if (exercise === 'EJERCICIO GENERAL' || exercise === 'Calibrando...' || exercise === 'PLANK (Plancha)') {
      return;
    }

    // Usar ángulo de rodilla para squats/lunges, codo para pushups, cadera para situps
    let trackingValue;
    if (exercise.includes('SQUAT') || exercise.includes('LUNGE') || exercise.includes('DEADLIFT')) {
      trackingValue = (metrics.kneeAngleL + metrics.kneeAngleR) / 2;
    } else if (exercise.includes('PUSHUP')) {
      trackingValue = (metrics.elbowAngleL + metrics.elbowAngleR) / 2;
    } else if (exercise.includes('SITUP')) {
      trackingValue = (metrics.hipAngleL + metrics.hipAngleR) / 2;
    } else {
      trackingValue = metrics.midHipY;
    }

    // Obtener rango dinámico
    const recent = this.buffer.slice(-30);
    let recentValues;
    if (exercise.includes('SQUAT') || exercise.includes('LUNGE') || exercise.includes('DEADLIFT')) {
      recentValues = recent.map(r => (r.kneeAngleL + r.kneeAngleR) / 2);
    } else if (exercise.includes('PUSHUP')) {
      recentValues = recent.map(r => (r.elbowAngleL + r.elbowAngleR) / 2);
    } else if (exercise.includes('SITUP')) {
      recentValues = recent.map(r => (r.hipAngleL + r.hipAngleR) / 2);
    } else {
      recentValues = recent.map(r => r.midHipY);
    }

    const minVal = Math.min(...recentValues);
    const maxVal = Math.max(...recentValues);
    const range = maxVal - minVal;

    if (range < 8) return; // No hay suficiente movimiento

    const midThreshold = minVal + range * 0.5;
    const framesSincePhase = this.framesSinceStart - this.lastPhaseChange;

    if (trackingValue < midThreshold && this.currentPhase !== 'down') {
      if (this.currentPhase === 'up' && framesSincePhase > this.minRepInterval) {
        this.repCount++;
      }
      this.currentPhase = 'down';
      this.lastPhaseChange = this.framesSinceStart;
    } else if (trackingValue > midThreshold && this.currentPhase !== 'up') {
      this.currentPhase = 'up';
      this.lastPhaseChange = this.framesSinceStart;
    }
  }

  /**
   * Retorna el elemento más frecuente del array (voto mayoritario).
   */
  _majorityVote(arr) {
    const freq = {};
    let maxCount = 0;
    let winner = arr[arr.length - 1];
    for (const item of arr) {
      freq[item] = (freq[item] || 0) + 1;
      if (freq[item] > maxCount) {
        maxCount = freq[item];
        winner = item;
      }
    }
    return winner;
  }

  /**
   * Reinicia el contador y estado.
   */
  reset() {
    this.buffer = [];
    this.repCount = 0;
    this.currentPhase = 'idle';
    this.exerciseHistory = [];
    this.framesSinceStart = 0;
  }
}
