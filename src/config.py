# -*- coding: utf-8 -*-
"""
config.py
---------
Configuración global del proyecto de Corrección Postural Automática.
Define hiperparámetros, nombres y conexiones de las 13 articulaciones
del Penn Action Dataset, clases posturales y rutas del proyecto.
"""

import os

# Rutas del proyecto
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_DIR = os.path.join(BASE_DIR, "Penn_Action")
LABELS_DIR = os.path.join(DATASET_DIR, "labels")
FRAMES_DIR = os.path.join(DATASET_DIR, "frames")
MODELS_DIR = os.path.join(BASE_DIR, "checkpoints")

# Crear carpeta de modelos si no existe
os.makedirs(MODELS_DIR, exist_ok=True)

# Hiperparámetros de datos y secuencias
MAX_SEQ_LENGTH = 46       # Número estándar de frames por secuencia en Penn Action
NUM_JOINTS = 13           # 13 articulaciones anotadas
INPUT_FEATURES = NUM_JOINTS * 2  # 26 características por frame (intercalado x, y)
NUM_CLASSES = 3

# Clases de Calidad Postural
CLASS_NAMES = {
    0: "Postura Correcta",
    1: "Error de Espalda / Tronco",
    2: "Error de Extremidades / Rodillas"
}

# Colores por clase en BGR (para OpenCV)
CLASS_COLORS_BGR = {
    0: (76, 177, 34),     # Verde
    1: (36, 36, 230),     # Rojo
    2: (0, 165, 255)      # Naranja
}

# Subconjunto de acciones enfocadas en ejercicio/postura en Penn Action Dataset
TARGET_ACTIONS = ["squat", "pushup", "situp"]

# Índice de las 13 articulaciones del Penn Action Dataset (0-indexed)
JOINTS_DICT = {
    0: "Head",
    1: "Left_Shoulder",
    2: "Right_Shoulder",
    3: "Left_Elbow",
    4: "Right_Elbow",
    5: "Left_Wrist",
    6: "Right_Wrist",
    7: "Left_Hip",
    8: "Right_Hip",
    9: "Left_Knee",
    10: "Right_Knee",
    11: "Left_Ankle",
    12: "Right_Ankle"
}

# Conexiones óseas (pares de articulaciones) para visualización de esqueleto
SKELETON_CONNECTIONS = [
    (0, 1), (0, 2),          # Cabeza -> Hombros
    (1, 2),                  # Hombro izq -> Hombro der
    (1, 3), (3, 5),          # Brazo izquierdo (Hombro -> Codo -> Muñeca)
    (2, 4), (4, 6),          # Brazo derecho (Hombro -> Codo -> Muñeca)
    (1, 7), (2, 8),          # Hombro -> Cadera (Tronco)
    (7, 8),                  # Cadera izq -> Cadera der
    (7, 9), (9, 11),         # Pierna izquierda (Cadera -> Rodilla -> Tobillo)
    (8, 10), (10, 12)        # Pierna derecha (Cadera -> Rodilla -> Tobillo)
]
