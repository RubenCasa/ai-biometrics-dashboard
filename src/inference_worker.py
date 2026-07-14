# -*- coding: utf-8 -*-
"""
src/inference_worker.py
-----------------------
Trabajador de inferencia seguro para Windows Python 3.13.
Ejecuta la inferencia de PyTorch en el hilo principal del proceso para evitar [WinError 1114] en Streamlit.
"""

import os
import sys
import json
import argparse
import numpy as np
import scipy.io as sio

# Configuración DLL Windows
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

import torch
import torch.nn.functional as F

try:
    from src.config import LABELS_DIR, MODELS_DIR
    from src.model import PoseQualityHybridModel
    from src.feedback import generar_feedback
except ImportError:
    from config import LABELS_DIR, MODELS_DIR
    from model import PoseQualityHybridModel
    from feedback import generar_feedback


def predict_sequence(video_id: str) -> dict:
    mat_path = os.path.join(LABELS_DIR, f"{video_id}.mat")
    if not os.path.exists(mat_path):
        return {"error": f"No existe {mat_path}"}

    mat = sio.loadmat(mat_path)
    x = mat['x'].astype(np.float32)
    y = mat['y'].astype(np.float32)
    nframes = x.shape[0]

    x_norm = (x - np.mean(x)) / (np.std(x) + 1e-7)
    y_norm = (y - np.mean(y)) / (np.std(y) + 1e-7)

    features = np.empty((nframes, 26), dtype=np.float32)
    features[:, 0::2] = x_norm
    features[:, 1::2] = y_norm

    if nframes < 46:
        pad_width = 46 - nframes
        last_frame = features[-1:, :]
        features_aligned = np.vstack([features, np.repeat(last_frame, pad_width, axis=0)])
    else:
        indices = np.linspace(0, nframes - 1, 46).astype(int)
        features_aligned = features[indices, :]

    device = torch.device("cpu")
    model = PoseQualityHybridModel().to(device)
    model_path = os.path.join(MODELS_DIR, "modelo.pth")
    
    if os.path.exists(model_path):
        checkpoint = torch.load(model_path, map_location=device)
        model.load_state_dict(checkpoint['model_state_dict'])
        is_trained = True
    else:
        is_trained = False

    model.eval()
    tensor_in = torch.tensor(features_aligned, dtype=torch.float32).unsqueeze(0)
    with torch.no_grad():
        logits = model(tensor_in)

    clase_idx, conf, nombre_clase, mensaje_fb = generar_feedback(logits)

    return {
        "clase_idx": int(clase_idx),
        "confianza": float(conf),
        "nombre_clase": nombre_clase,
        "mensaje_fb": mensaje_fb,
        "is_trained": is_trained
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--video_id", type=str, required=True)
    args = parser.parse_args()

    res = predict_sequence(args.video_id)
    print(json.dumps(res, ensure_ascii=True))
