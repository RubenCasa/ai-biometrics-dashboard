# -*- coding: utf-8 -*-
"""
main.py
-------
Punto de entrada unificado para el Proyecto de Corrección Postural Automática.
Arquitectura híbrida 1D-CNN + BiLSTM + Retroalimentación Textual explicable.

Uso:
  1. Entrenar el modelo:
     python main.py --mode train --epochs 25 --batch_size 32

  2. Generar video de demostración Wow Factor:
     python main.py --mode demo --video_id 0001 --output demo_postura_wow.mp4
"""

import argparse
from src.train import main as train_main
from src.visualize_demo import procesar_secuencia_penn


def main():
    parser = argparse.ArgumentParser(
        description="Proyecto Semestre 5: Detección de Patrones de Error Postural (1D-CNN + BiLSTM)"
    )
    parser.add_argument(
        "--mode",
        type=str,
        default="train",
        choices=["train", "demo"],
        help="Modo de ejecución: 'train' para entrenar o 'demo' para generar video Wow Factor"
    )
    parser.add_argument("--epochs", type=int, default=25, help="Número de épocas para entrenamiento")
    parser.add_argument("--batch_size", type=int, default=32, help="Tamaño de lote (batch size)")
    parser.add_argument("--lr", type=float, default=1e-3, help="Tasa de aprendizaje (learning rate)")
    parser.add_argument("--video_id", type=str, default="0001", help="ID de video de Penn Action para demostración")
    parser.add_argument("--output", type=str, default="demo_postura_wow.mp4", help="Archivo MP4 de salida en modo demo")

    args = parser.parse_args()

    if args.mode == "train":
        print("================================================================")
        print("  ENTRENAMIENTO DEL MODELO HÍBRIDO 1D-CNN + BiLSTM")
        print("================================================================")
        train_main(epochs=args.epochs, batch_size=args.batch_size, lr=args.lr)

    elif args.mode == "demo":
        print("================================================================")
        print("  GENERACIÓN DE DEMOSTRACIÓN VISUAL CON RETROALIMENTACIÓN")
        print("================================================================")
        procesar_secuencia_penn(video_id=args.video_id, output_mp4=args.output)


if __name__ == "__main__":
    main()
