// Conexiones de 13 articulaciones de Penn Action Dataset
export const PENN_CONNECTIONS = [
  [0, 1], [0, 2], [1, 2], [1, 3], [3, 5], [2, 4], [4, 6],
  [1, 7], [2, 8], [7, 8], [7, 9], [9, 11], [8, 10], [10, 12]
];

// Mapeo de MediaPipe (33 landmarks) a Penn Action (13 articulaciones)
// [nose, l_shoulder, r_shoulder, l_elbow, r_elbow, l_wrist, r_wrist, l_hip, r_hip, l_knee, r_knee, l_ankle, r_ankle]
export const MP_TO_PENN = [0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];

export const STATUS_COLORS = {
  correct: {
    hex: '#10b981',
    glow: 'rgba(16, 185, 129, 0.35)',
    bg: 'rgba(16, 185, 129, 0.15)',
    label: 'POSTURA CORRECTA',
    classId: 0
  },
  back: {
    hex: '#ef4444',
    glow: 'rgba(239, 68, 68, 0.35)',
    bg: 'rgba(239, 68, 68, 0.15)',
    label: 'ERROR DE ESPALDA / TRONCO',
    classId: 1
  },
  limb: {
    hex: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.35)',
    bg: 'rgba(245, 158, 11, 0.15)',
    label: 'ERROR DE EXTREMIDADES',
    classId: 2
  }
};
