# 🏋️ Detección de Patrones de Error Postural en Secuencias de Movimiento
## Arquitectura Híbrida 1D-CNN + BiLSTM con Generación Automática de Retroalimentación Textual

Proyecto de Inteligencia Artificial / Deep Learning aplicado a la biomecánica deportiva y corrección postural automática a partir de secuencias de movimiento del **Penn Action Dataset**.

---

## 🌟 Características del Proyecto

- **Preprocesamiento Biomecánico (`src/dataset.py`)**:
  - Lectura de anotaciones `.mat` de Penn Action con coordenadas $(x, y)$ de 13 articulaciones.
  - Normalización Z-score por secuencia y construcción de vectores de 26 características por fotograma.
  - Alineación temporal a 46 fotogramas mediante padding/truncado.
- **Modelo Híbrido Deep Learning (`src/model.py`)**:
  - **Bloque 1D-CNN**: Capas convolucionales 1D + BatchNorm + ReLU para la extracción de correlaciones espaciales inter-articulación.
  - **Bloque BiLSTM**: LSTM bidireccional para modelar dinámicas temporales y transiciones del movimiento.
  - **Clasificador FC**: Salida en 3 clases posturales (`0: Correcta`, `1: Error Espalda/Tronco`, `2: Error Extremidades/Rodillas`).
- **Entrenamiento y Evaluación Profesional (`src/train.py`)**:
  - Bucle completo con guardado automático de pesos (`checkpoints/modelo.pth`).
  - Cálculo de Precisión (Accuracy), F1-Score Macro y Matriz de Confusión.
  - Exportación de curvas de pérdida y precisión (`checkpoints/training_curves.png`).
- **Retroalimentación Textual Inteligente (`src/feedback.py`)**:
  - Motor de reglas en español con niveles de confianza (Softmax) para generar consejos posturales explicables.
- **Interfaz "Wow Factor" en OpenCV (`src/visualize_demo.py`)**:
  - Superposición visual del esqueleto óseo sobre el video con codificación de colores en tiempo real.
  - Renderizado de panel HUD con barra de confianza y retroalimentación textual en video MP4.
- **Sección de Metodología Completa (`reporte_metodologia.md`)**:
  - Documento académico formal listo para el informe universitario final.

---

## 🚀 Estructura del Repositorio

```text
PROYECTO_GIMACIO_DEEP LEANING/
├── Penn_Action/                 # Dataset Penn Action (frames y labels .mat)
├── checkpoints/                 # Modelos entrenados y gráficos de métricas
│   ├── modelo.pth               # Pesos del mejor modelo entrenado
│   └── training_curves.png      # Gráficos de Loss y Accuracy
├── src/
│   ├── __init__.py
│   ├── config.py                # Hiperparámetros, articulaciones y conexiones óseas
│   ├── dataset.py               # Dataset PyTorch y DataLoader para archivos .mat
│   ├── model.py                 # Arquitectura híbrida PoseQualityHybridModel
│   ├── train.py                 # Script de entrenamiento y validación
│   ├── feedback.py              # Generador de retroalimentación textual en español
│   └── visualize_demo.py        # Generador de video demo OpenCV ("Wow Factor")
├── main.py                      # Punto de entrada unificado por línea de comandos
├── reporte_metodologia.md       # Sección de metodología para el informe universitario
└── README.md                    # Documentación del proyecto
```

---

## 🛠️ Cómo Ejecutar el Proyecto

### 1. Entrenar el Modelo
Para iniciar el entrenamiento completo durante 25 épocas con lotes de 32 secuencias:
```bash
python main.py --mode train --epochs 25 --batch_size 32
```
Al finalizar, se guardará el mejor modelo en `checkpoints/modelo.pth` y las curvas en `checkpoints/training_curves.png`.

### 2. Abrir el Dashboard Interactivo HTML5
Para abrir el panel visual profesional e interactivo, haz doble clic en **`abrir_dashboard.bat`** o en **`dashboard.html`** en tu carpeta del proyecto para abrirlo directamente en Chrome/Edge.
*Esto abrirá al instante un dashboard ultra fluido en modo oscuro con reproductor de secuencias cinemáticas del Penn Action Dataset, selector temporal de fotogramas, matriz de confusión y retroalimentación IA en lenguaje natural.*

### 4. Generar Video de Demostración ("Wow Factor" MP4)
Para procesar un video de Penn Action (ej. `0001`) y exportar una demostración en archivo MP4 con el esqueleto y el mensaje de retroalimentación en pantalla:
```bash
python main.py --mode demo --video_id 0001 --output demo_postura_wow.mp4
```

---

## 📊 Clases y Diagnósticos Posturales

| Clase | Nombre | Descripción | Ejemplo de Retroalimentación Textual |
| :---: | :--- | :--- | :--- |
| **0** | **Postura Correcta** | Eje tronco-extremidades alineado | *"✅ ¡Excelente ejecución! Tu postura es correcta y el eje tronco-extremidades se mantiene estable."* |
| **1** | **Error de Espalda / Tronco** | Flexión lumbar o torácica excesiva | *"⚠️ ALERTA DE POSTURA: Tu espalda se está encorvando. Mantén el pecho erguido y activa el core."* |
| **2** | **Error de Extremidades** | Colapso de rodillas o codos | *"⚠️ ALERTA DE EXTREMIDADES: Evita que las rodillas colapsen hacia adentro (valgo) y alinéalas."* |
