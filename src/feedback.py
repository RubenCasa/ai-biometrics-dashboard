# -*- coding: utf-8 -*-
"""
feedback.py
-----------
Módulo de Retroalimentación Textual Inteligente (Post-Procesamiento).

Toma los logits del modelo híbrido 1D-CNN + BiLSTM, aplica Softmax para
calcular la distribución de probabilidad (confianza) y utiliza un motor
de reglas basado en umbrales para generar mensajes de corrección postural
claros, accionables y en español.
"""

import torch
import torch.nn.functional as F
from typing import Dict, Tuple

try:
    from src.config import CLASS_NAMES
except ImportError:
    from config import CLASS_NAMES


# Diccionario jerárquico de reglas de retroalimentación textual
POSTURAL_RULES = {
    0: {
        "high_confidence": (
            "✅ ¡Excelente ejecución! Tu postura es correcta y el eje tronco-extremidades "
            "se mantiene estable en todo el movimiento."
        ),
        "moderate_confidence": (
            "🟢 Buena ejecución en general. Intenta mantener un ritmo constante "
            "para consolidar la técnica."
        ),
        "low_confidence": (
            "ℹ️ Movimiento aceptable, pero la alineación oscila ligeramente. "
            "Concéntrate en la estabilidad de tu core."
        )
    },
    1: {
        "high_confidence": (
            "⚠️ ALERTA DE POSTURA: Tu espalda se está encorvando o perdiendo neutralidad. "
            "Mantén el pecho erguido, retrae las escápulas y activa el core abdominal."
        ),
        "moderate_confidence": (
            "⚠️ Atención a tu espalda: Se detecta ligera flexión lumbar/torácica. "
            "Asegúrate de no inclinar en exceso el tronco hacia adelante."
        ),
        "low_confidence": (
            "ℹ️ Sugerencia postural: Revisa la alineación hombro-cadera para evitar "
            "sobrecarga en la zona lumbar."
        )
    },
    2: {
        "high_confidence": (
            "⚠️ ALERTA DE EXTREMIDADES: Inestabilidad o desalineación en rodillas/codos. "
            "Evita que las rodillas colapsen hacia adentro (valgo) y alinéalas con las puntas de los pies."
        ),
        "moderate_confidence": (
            "⚠️ Control articular: Se observa oscilación en extremidades inferiores/superiores. "
            "Controla la fase excéntrica del movimiento."
        ),
        "low_confidence": (
            "ℹ️ Sugerencia articular: Distribuye el peso de manera equilibrada y estabiliza "
            "tus articulaciones durante el descenso."
        )
    }
}


def generar_feedback(logits: torch.Tensor) -> Tuple[int, float, str, str]:
    """
    Convierte los logits del modelo en una predicción, probabilidad de confianza
    y un mensaje de retroalimentación textual detallado en español.

    Args:
        logits: Tensor de forma (num_classes,) o (1, num_classes) proveniente del modelo.

    Returns:
        clase_predicha (int): Índice de la clase predicha (0, 1 o 2).
        confianza (float): Porcentaje de confianza en rango [0.0, 1.0].
        nombre_clase (str): Nombre de la clase en español.
        mensaje_feedback (str): Mensaje con retroalimentación correctiva.
    """
    if logits.dim() == 2:
        logits = logits.squeeze(0)

    # 1. Aplicar Softmax para obtener probabilidades
    probabilidades = F.softmax(logits, dim=-1)

    # 2. Obtener clase con máxima probabilidad y su valor
    confianza_tensor, clase_idx_tensor = torch.max(probabilidades, dim=-1)
    clase_predicha = int(clase_idx_tensor.item())
    confianza = float(confianza_tensor.item())

    nombre_clase = CLASS_NAMES.get(clase_predicha, "Desconocido")

    # 3. Selección de mensaje según umbral de confianza
    rules = POSTURAL_RULES.get(clase_predicha, POSTURAL_RULES[0])
    if confianza >= 0.80:
        mensaje_feedback = rules["high_confidence"]
    elif confianza >= 0.55:
        mensaje_feedback = rules["moderate_confidence"]
    else:
        mensaje_feedback = rules["low_confidence"]

    return clase_predicha, confianza, nombre_clase, mensaje_feedback


if __name__ == "__main__":
    # Pruebas unitarias rápidas del módulo de retroalimentación
    print("--- Test de Retroalimentación Textual ---")

    # Caso 1: Error de espalda con alta confianza
    logits_error_espalda = torch.tensor([[-1.5, 3.8, -0.2]])
    c, conf, nombre, feedback = generar_feedback(logits_error_espalda)
    print(f"Predicción: {c} ({nombre}) | Confianza: {conf*100:.1f}%\nFeedback: {feedback}\n")

    # Caso 2: Postura correcta con alta confianza
    logits_correcta = torch.tensor([[4.2, -1.0, -0.8]])
    c, conf, nombre, feedback = generar_feedback(logits_correcta)
    print(f"Predicción: {c} ({nombre}) | Confianza: {conf*100:.1f}%\nFeedback: {feedback}\n")
