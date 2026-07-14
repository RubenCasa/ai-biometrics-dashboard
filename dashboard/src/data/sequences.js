// Secuencias base de demostración del Penn Action Dataset y plantillas para videos en vivo

export const INITIAL_SEQUENCES = [
  {
    id: "1659",
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
    action: "PUSHUP",
    clase: 2,
    confianza: 0.884,
    nombre: "Error de Extremidades",
    feedback: "⚠️ Alerta de Flexión: Cadera colapsada hacia abajo perdiendo tensión lumbar. Mantén una línea rígida desde los hombros hasta los tobillos.",
    type: "limb",
    isUserVideo: false,
    framesCount: 46
  },
  {
    id: "0341",
    action: "BENCH_PRESS",
    clase: 0,
    confianza: 0.958,
    nombre: "Postura Correcta",
    feedback: "✅ ¡Óptima estabilidad escapular! El plano de presión horizontal se conserva simétrico sin inclinación asimétrica del codo.",
    type: "correct",
    isUserVideo: false,
    framesCount: 46
  },
  {
    id: "1559",
    action: "SITUP",
    clase: 1,
    confianza: 0.912,
    nombre: "Error de Espalda / Tronco",
    feedback: "⚠️ Alerta Cervico-Lumbar: Tracción excesiva desde el cuello en lugar del cinturón abdominal. Concéntrate en elevar las costillas hacia la pelvis.",
    type: "back",
    isUserVideo: false,
    framesCount: 46
  },
  {
    id: "0701",
    action: "CLEAN_AND_JERK",
    clase: 2,
    confianza: 0.871,
    nombre: "Error de Extremidades / Rodillas",
    feedback: "⚠️ Alerta de Recepción: Asimetría en el anclaje de rodillas durante la fase de empuje (Jerk). Asegura la extensión completa simultánea.",
    type: "limb",
    isUserVideo: false,
    framesCount: 46
  }
];
