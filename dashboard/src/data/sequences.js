// sequences.js
// Secuencias base y videos de ejemplo configurados para vincularse con REAL_SEQUENCES (real_data.js)

export const INITIAL_SEQUENCES = [
  {
    id: "1659",
    vidId: "1659",
    action: "SQUAT",
    clase: 0,
    confianza: 0.942,
    nombre: "Postura Correcta",
    feedback: "✅ ¡Excelente ejecución! Tu sentadilla (Squat) mantiene la espalda recta y las rodillas perfectamente alineadas con los pies.",
    type: "correct",
    isUserVideo: false,
    framesCount: 46
  },
  {
    id: "1348",
    vidId: "1348",
    action: "PUSHUP",
    clase: 2,
    confianza: 0.885,
    nombre: "Error de Extremidades",
    feedback: "⚠️ ALERTA DE EXTREMIDADES: En la flexión de pecho (Pushup), cuida la estabilidad de codos y hombros al descender.",
    type: "limb",
    isUserVideo: false,
    framesCount: 46
  },
  {
    id: "0341",
    vidId: "0341",
    action: "BENCH_PRESS",
    clase: 0,
    confianza: 0.914,
    nombre: "Postura Correcta",
    feedback: "✅ ¡Excelente control! En el Press de Banca (Bench Press) el plano torácico y las extremidades superiores muestran gran firmeza.",
    type: "correct",
    isUserVideo: false,
    framesCount: 46
  },
  {
    id: "1559",
    vidId: "1559",
    action: "SITUP",
    clase: 1,
    confianza: 0.850,
    nombre: "Error de Espalda / Tronco",
    feedback: "⚠️ ALERTA DE POSTURA: Al realizar abdominales (Situp), evita tirones excesivos del cuello o curvatura excesiva en la columna.",
    type: "back",
    isUserVideo: false,
    framesCount: 46
  },
  {
    id: "0701",
    vidId: "0701",
    action: "CLEAN_AND_JERK",
    clase: 2,
    confianza: 0.812,
    nombre: "Error de Extremidades / Rodillas",
    feedback: "⚠️ ALERTA DE EXTREMIDADES: En el levantamiento (Clean & Jerk), cuida que las rodillas no colapsen en valgo al recibir la carga.",
    type: "limb",
    isUserVideo: false,
    framesCount: 46
  }
];

// Lista de videos de ejemplo listos para análisis en tiempo real (vinculados a fotogramas reales de Penn Action)
export const EXAMPLE_VIDEOS = [
  {
    id: "DEMO-SQUAT",
    vidId: "1659",
    file: "demo_squat.mp4",
    title: "Sentadilla (Squat Demo)",
    desc: "Predicción de ángulos de rodilla/cadera en vivo",
    type: "correct",
    defaultAction: "SQUAT"
  },
  {
    id: "DEMO-PUSHUP",
    vidId: "1348",
    file: "demo_pushup.mp4",
    title: "Flexión de Pecho (Pushup Demo)",
    desc: "Análisis de alineación del core y extremidades",
    type: "limb",
    defaultAction: "PUSHUP"
  },
  {
    id: "DEMO-BENCH",
    vidId: "0341",
    file: "demo_bench.mp4",
    title: "Press de Banca (Bench Demo)",
    desc: "Detección de simetría escapular y codos",
    type: "correct",
    defaultAction: "BENCH_PRESS"
  },
  {
    id: "DEMO-SITUP",
    vidId: "1559",
    file: "demo_situp.mp4",
    title: "Abdominales (Situp Demo)",
    desc: "Evaluación de curvatura cervical y lumbar",
    type: "back",
    defaultAction: "SITUP"
  },
  {
    id: "DEMO-MIXTO",
    vidId: "0701",
    file: "video_demo.mp4",
    title: "Levantamiento (Clean Demo)",
    desc: "Clasificación de rodillas y extremidades en valgo",
    type: "limb",
    defaultAction: "CLEAN_AND_JERK"
  }
];
