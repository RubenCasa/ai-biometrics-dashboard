# -*- coding: utf-8 -*-
"""
dataset.py
----------
Módulo de Preparación de Datos y PyTorch DataLoader para Penn Action Dataset.
- Lectura de archivos .mat con scipy.io
- Extracción de coordenadas (x, y) de las 13 articulaciones
- Normalización Z-Score de las 26 características por frame
- Padding/truncado temporal a MAX_SEQ_LENGTH (46 frames)
- Asignación de etiquetas posturales (0: Correcta, 1: Error Espalda, 2: Error Extremidades)
"""

import os
import glob
import numpy as np
import scipy.io as sio
import torch
from torch.utils.data import Dataset, DataLoader, random_split
from typing import Tuple, List, Dict, Optional

try:
    from src.config import LABELS_DIR, MAX_SEQ_LENGTH, TARGET_ACTIONS
except ImportError:
    from config import LABELS_DIR, MAX_SEQ_LENGTH, TARGET_ACTIONS


def extract_action_name(mat_data: dict) -> str:
    """Extrae el nombre de la acción de manera robusta desde el diccionario .mat."""
    action_raw = mat_data.get('action', '')
    if isinstance(action_raw, np.ndarray):
        if action_raw.size > 0:
            return str(action_raw.item() if action_raw.size == 1 else action_raw[0])
        return ''
    return str(action_raw)


def calc_angle_py(a_x, a_y, b_x, b_y, c_x, c_y):
    ab_x, ab_y = a_x - b_x, a_y - b_y
    cb_x, cb_y = c_x - b_x, c_y - b_y
    dot = ab_x * cb_x + ab_y * cb_y
    mag_ab = np.sqrt(ab_x**2 + ab_y**2)
    mag_cb = np.sqrt(cb_x**2 + cb_y**2)
    if mag_ab * mag_cb < 1e-6:
        return 180.0
    cos_theta = dot / (mag_ab * mag_cb)
    cos_theta = np.clip(cos_theta, -1.0, 1.0)
    return np.arccos(cos_theta) * (180.0 / np.pi)


def assign_posture_label(action: str, x: np.ndarray, y: np.ndarray) -> int:
    """
    Asigna una etiqueta de calidad postural (0, 1 o 2) de forma DETERMINISTA
    y BIOMECÁNICA a partir de las coordenadas de las articulaciones.
    
    Clases:
      0: Postura Correcta
      1: Error de Espalda / Tronco (desalineación o inclinación excesiva)
      2: Error de Extremidades / Rodillas (colapso de rodillas, mala flexión de codos)
    """
    nframes = x.shape[0]
    if nframes < 5:
        return 0

    # Puntos medios del torso
    mid_shoulder_x = (x[:, 1] + x[:, 2]) / 2.0
    mid_shoulder_y = (y[:, 1] + y[:, 2]) / 2.0
    mid_hip_x = (x[:, 7] + x[:, 8]) / 2.0
    mid_hip_y = (y[:, 7] + y[:, 8]) / 2.0

    # Inclinación del tronco respecto a la vertical
    dx_trunk = mid_shoulder_x - mid_hip_x
    dy_trunk = mid_hip_y - mid_shoulder_y + 1e-6  # Positivo si los hombros están arriba de la cadera
    trunk_angles = np.abs(np.arctan2(dx_trunk, dy_trunk) * (180.0 / np.pi))
    max_trunk_angle = np.max(trunk_angles)
    avg_trunk_angle = np.mean(trunk_angles)
    trunk_var = np.std(trunk_angles)

    # Asimetría de hombros
    shoulder_diff = np.abs(y[:, 1] - y[:, 2])
    max_shoulder_diff = np.max(shoulder_diff)

    # Valgo de rodillas (spread de rodillas vs spread de tobillos)
    knee_spread = np.abs(x[:, 9] - x[:, 10])
    ankle_spread = np.abs(x[:, 11] - x[:, 12]) + 1e-6
    valgus_ratios = knee_spread / ankle_spread
    min_valgus = np.min(valgus_ratios)

    # Ángulos de flexión
    knee_angles = [calc_angle_py(x[t, 7], y[t, 7], x[t, 9], y[t, 9], x[t, 11], y[t, 11]) for t in range(nframes)]
    min_knee_angle = np.min(knee_angles)

    elbow_angles = [calc_angle_py(x[t, 1], y[t, 1], x[t, 3], y[t, 3], x[t, 5], y[t, 5]) for t in range(nframes)]
    min_elbow_angle = np.min(elbow_angles)

    # Clasificación biomecánica basada en el tipo de ejercicio
    action_clean = action.lower().strip()

    if "squat" in action_clean:
        # En squat, inclinar la espalda > 26° o mucha variación es un error de espalda
        if max_trunk_angle > 26.0 or trunk_var > 12.0:
            return 1  # Error de Espalda / Tronco
        # Rodillas colapsando hacia adentro durante la flexión (valgo)
        elif min_valgus < 0.72 and min_knee_angle < 130.0:
            return 2  # Error de Extremidades / Rodillas
        else:
            return 0  # Postura Correcta

    elif "pushup" in action_clean:
        # En flexión, la espalda debe mantenerse recta (poca inclinación y variación)
        if trunk_var > 6.0 or max_trunk_angle > 20.0:
            return 1  # Error de Espalda / Tronco (cadera caída o arqueada)
        # Si los codos no se flexionan lo suficiente
        elif min_elbow_angle > 140.0:
            return 2  # Error de Extremidades / Rodillas (rango incompleto / codos flácidos)
        else:
            return 0  # Postura Correcta

    elif "situp" in action_clean:
        # En abdominales, levantarse chueco (asimetría de hombros) es un error de espalda
        if max_shoulder_diff > 0.18:
            return 1  # Error de Espalda / Tronco
        # Mantener las piernas totalmente estiradas en lugar de flexionadas
        elif min_knee_angle > 145.0:
            return 2  # Error de Extremidades / Rodillas
        else:
            return 0  # Postura Correcta

    else:
        # General / Fallback
        if max_trunk_angle > 22.0:
            return 1
        elif min_valgus < 0.72 or min_knee_angle > 175.0:
            return 2
        else:
            return 0



class PennActionPosturalDataset(Dataset):
    """
    Dataset de PyTorch para el análisis postural en secuencias 1D temporal-espacial.
    """

    def __init__(self, labels_dir: str = LABELS_DIR, target_actions: Optional[List[str]] = TARGET_ACTIONS,
                 max_len: int = MAX_SEQ_LENGTH, augment: bool = False):
        super().__init__()
        self.labels_dir = labels_dir
        self.target_actions = target_actions
        self.max_len = max_len
        self.augment = augment
        self.samples = []  # Lista de tuplas: (features_tensor, label, video_id)

        self._load_and_preprocess_data()

    def _load_and_preprocess_data(self):
        mat_files = sorted(glob.glob(os.path.join(self.labels_dir, "*.mat")))
        if not mat_files:
            print(f"[ADVERTENCIA] No se encontraron archivos .mat en {self.labels_dir}")
            return

        for filepath in mat_files:
            try:
                mat = sio.loadmat(filepath)
                action = extract_action_name(mat)

                # Filtrar si target_actions está definido y la acción no está en la lista
                if self.target_actions and action not in self.target_actions:
                    continue

                x = mat['x'].astype(np.float32)  # shape: (nframes, 13)
                y = mat['y'].astype(np.float32)  # shape: (nframes, 13)
                nframes = x.shape[0]

                if nframes == 0:
                    continue

                # 1. Normalización Z-score por secuencia (restar media y dividir por desviación estándar)
                x_norm = (x - np.mean(x)) / (np.std(x) + 1e-7)
                y_norm = (y - np.mean(y)) / (np.std(y) + 1e-7)

                # 2. Combinar en vector de 26 características por frame intercalando (x0, y0, x1, y1...)
                features = np.empty((nframes, 26), dtype=np.float32)
                features[:, 0::2] = x_norm
                features[:, 1::2] = y_norm

                # 3. Alineación temporal (Padding o Truncado a max_len = 46 frames)
                if nframes < self.max_len:
                    pad_width = self.max_len - nframes
                    # Padding repitiendo el último frame (más natural que ceros en secuencias biomecánicas)
                    last_frame = features[-1:, :]
                    padding = np.repeat(last_frame, pad_width, axis=0)
                    features_aligned = np.vstack([features, padding])
                else:
                    # Truncar o submuestrear uniformemente a self.max_len
                    indices = np.linspace(0, nframes - 1, self.max_len).astype(int)
                    features_aligned = features[indices, :]

                # 4. Etiqueta postural
                label = assign_posture_label(action, x, y)
                video_id = os.path.splitext(os.path.basename(filepath))[0]

                self.samples.append((features_aligned, label, video_id))

            except Exception as e:
                # Omitir archivos dañados sin interrumpir la carga
                continue

        print(f"[DATASET] Cargadas {len(self.samples)} secuencias del Penn Action Dataset.")

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, int, str]:
        features, label, video_id = self.samples[idx]
        features_arr = features.copy()

        # AUMENTO DE DATOS BIOMECÁNICO (Data Augmentation) PARA PREVENIR OVERFITTING
        if self.augment:
            # 1. Jittering gaussiano (ruido de sensor/cámara)
            noise = np.random.normal(loc=0.0, scale=0.03, size=features_arr.shape).astype(np.float32)
            features_arr += noise

            # 2. Escalado aleatorio de amplitud biomecánica [0.95, 1.05]
            scale = np.random.uniform(0.95, 1.05)
            features_arr *= scale

            # 3. Reflejo horizontal aleatorio (50% prob) -> invierte signo en el eje X
            if np.random.rand() < 0.5:
                features_arr[:, 0::2] = -features_arr[:, 0::2]

        return torch.tensor(features_arr, dtype=torch.float32), label, video_id


def get_dataloaders(labels_dir: str = LABELS_DIR,
                    batch_size: int = 32,
                    val_split: float = 0.2,
                    seed: int = 42) -> Tuple[DataLoader, DataLoader, PennActionPosturalDataset]:
    """
    Construye DataLoaders aplicando Aumento de Datos (augment=True) en Train y augment=False en Validación.
    """
    base_dataset = PennActionPosturalDataset(labels_dir=labels_dir, augment=False)
    
    if len(base_dataset) == 0:
        raise ValueError(f"El dataset está vacío. Verifica que haya archivos .mat en {labels_dir}")

    from sklearn.model_selection import train_test_split
    labels = [base_dataset.samples[i][1] for i in range(len(base_dataset))]
    train_indices, val_indices = train_test_split(range(len(base_dataset)), test_size=val_split, random_state=seed, stratify=labels)

    # Crear sub-datasets: train con augment=True para prevenir overfitting
    train_dataset = PennActionPosturalDataset(labels_dir=labels_dir, augment=True)
    train_subset = torch.utils.data.Subset(train_dataset, train_indices)
    val_subset = torch.utils.data.Subset(base_dataset, val_indices)

    train_loader = DataLoader(
        train_subset,
        batch_size=batch_size,
        shuffle=True,
        num_workers=0,
        drop_last=False
    )
    val_loader = DataLoader(
        val_subset,
        batch_size=batch_size,
        shuffle=False,
        num_workers=0,
        drop_last=False
    )

    return train_loader, val_loader, base_dataset
