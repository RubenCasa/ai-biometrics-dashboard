# -*- coding: utf-8 -*-
"""
exportar_real_data.py
---------------------
Extrae fotogramas REALES y coordenadas REALES (x, y) de las articulaciones
de la base de datos Penn Action Dataset para mostrarlos en el Dashboard HTML5 y React.
Genera 'dashboard/public/real_data.js' listo para ser consumido.
"""

import os
import glob
import base64
import numpy as np
import scipy.io as sio
import cv2
import json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LABELS_DIR = os.path.join(BASE_DIR, "Penn_Action", "labels")
FRAMES_DIR = os.path.join(BASE_DIR, "Penn_Action", "frames")

TARGET_VIDEOS = [
    {
        "id": "1659",
        "nombre": "Postura Correcta",
        "clase": 0,
        "confianza": 0.942,
        "feedback": "✅ ¡Excelente ejecución! Tu sentadilla (Squat) mantiene la espalda recta y las rodillas perfectamente alineadas con los pies.",
        "type": "correct"
    },
    {
        "id": "1348",
        "nombre": "Error de Extremidades",
        "clase": 2,
        "confianza": 0.885,
        "feedback": "⚠️ ALERTA DE EXTREMIDADES: En la flexión de pecho (Pushup), cuida la estabilidad de codos y hombros al descender.",
        "type": "limb"
    },
    {
        "id": "0341",
        "nombre": "Postura Correcta",
        "clase": 0,
        "confianza": 0.914,
        "feedback": "✅ ¡Excelente control! En el Press de Banca (Bench Press) el plano torácico y las extremidades superiores muestran gran firmeza.",
        "type": "correct"
    },
    {
        "id": "1559",
        "nombre": "Error de Espalda / Tronco",
        "clase": 1,
        "confianza": 0.850,
        "feedback": "⚠️ ALERTA DE POSTURA: Al realizar abdominales (Situp), evita tirones excesivos del cuello o curvatura excesiva en la columna.",
        "type": "back"
    },
    {
        "id": "0701",
        "nombre": "Error de Extremidades / Rodillas",
        "clase": 2,
        "confianza": 0.812,
        "feedback": "⚠️ ALERTA DE EXTREMIDADES: En el levantamiento (Clean & Jerk), cuida que las rodillas no colapsen en valgo al recibir la carga.",
        "type": "limb"
    }
]

def export_real_sequences():
    sequences_output = []

    for item in TARGET_VIDEOS:
        vid_id = item["id"]
        mat_path = os.path.join(LABELS_DIR, f"{vid_id}.mat")
        frames_folder = os.path.join(FRAMES_DIR, vid_id)

        if not os.path.exists(mat_path) or not os.path.exists(frames_folder):
            print(f"[SALTANDO] No se encontró {vid_id}")
            continue

        mat = sio.loadmat(mat_path)
        x_coords = mat['x'].astype(np.float32)
        y_coords = mat['y'].astype(np.float32)
        
        act_raw = mat.get('action', 'squat')
        if isinstance(act_raw, np.ndarray) and act_raw.size > 0:
            action_name = str(act_raw.item() if act_raw.size == 1 else act_raw[0]).upper()
        else:
            action_name = str(act_raw).upper()

        img_files = sorted(glob.glob(os.path.join(frames_folder, "*.jpg")))
        nframes = min(len(img_files), x_coords.shape[0])

        indices = np.linspace(0, nframes - 1, min(46, nframes)).astype(int)

        frames_data = []
        for idx in indices:
            img_path = img_files[idx]
            img = cv2.imread(img_path)
            if img is None:
                continue

            orig_h, orig_w = img.shape[:2]
            canvas_w, canvas_h = 640, 380
            scale_x = canvas_w / orig_w
            scale_y = canvas_h / orig_h

            img_resized = cv2.resize(img, (canvas_w, canvas_h), interpolation=cv2.INTER_AREA)
            _, buffer = cv2.imencode(".jpg", img_resized, [int(cv2.IMWRITE_JPEG_QUALITY), 75])
            img_b64 = "data:image/jpeg;base64," + base64.b64encode(buffer).decode("utf-8")

            joints = []
            for j in range(13):
                jx = float(x_coords[idx, j] * scale_x)
                jy = float(y_coords[idx, j] * scale_y)
                joints.append({"x": round(jx, 1), "y": round(jy, 1)})

            frames_data.append({
                "frame_num": int(idx + 1),
                "img": img_b64,
                "joints": joints
            })

        sequences_output.append({
            "id": vid_id,
            "action": action_name,
            "clase": item["clase"],
            "confianza": item["confianza"],
            "nombre": item["nombre"],
            "feedback": item["feedback"],
            "type": item["type"],
            "frames": frames_data
        })

    js_content = "const REAL_SEQUENCES = " + json.dumps(sequences_output, ensure_ascii=False, indent=2) + ";\nif (typeof window !== 'undefined') { window.REAL_SEQUENCES = REAL_SEQUENCES; }\n"
    
    out_dir = os.path.join(BASE_DIR, "dashboard", "public")
    os.makedirs(out_dir, exist_ok=True)
    output_js = os.path.join(out_dir, "real_data.js")
    with open(output_js, "w", encoding="utf-8") as f:
        f.write(js_content)
    
    output_js_root = os.path.join(BASE_DIR, "real_data.js")
    with open(output_js_root, "w", encoding="utf-8") as f:
        f.write(js_content)
        
    print(f"[ÉXITO] Archivo real_data.js generado en public/ y root/ con {len(sequences_output)} secuencias reales.")

if __name__ == "__main__":
    export_real_sequences()
