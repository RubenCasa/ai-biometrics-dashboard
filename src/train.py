# -*- coding: utf-8 -*-
"""
train.py
--------
Script completo de entrenamiento y evaluación para el modelo híbrido
1D-CNN + BiLSTM en detección de patrones de error postural.

Incluye:
- Bucle de entrenamiento y validación por época
- Optimización con Adam + Scheduler ReduceLROnPlateau
- Función de pérdida CrossEntropyLoss
- Guardado del mejor checkpoint ('modelo.pth')
- Cálculo de métricas: Accuracy, F1-Score y Matriz de Confusión
- Gráficos de evolución de pérdida y precisión
"""

import os
import argparse
import numpy as np
import matplotlib.pyplot as plt
import torch
import torch.nn as nn
from torch.optim import Adam
from torch.optim.lr_scheduler import ReduceLROnPlateau
from sklearn.metrics import accuracy_score, f1_score, confusion_matrix

try:
    from src.config import MODELS_DIR, CLASS_NAMES
    from src.dataset import get_dataloaders
    from src.model import PoseQualityHybridModel
except ImportError:
    from config import MODELS_DIR, CLASS_NAMES
    from dataset import get_dataloaders
    from model import PoseQualityHybridModel


def train_epoch(model, dataloader, criterion, optimizer, device):
    """Ejecuta una época de entrenamiento."""
    model.train()
    running_loss = 0.0
    all_preds = []
    all_targets = []

    for batch_idx, (features, labels, _) in enumerate(dataloader):
        features = features.to(device)
        labels = labels.to(device)

        optimizer.zero_grad()

        # Forward
        logits = model(features)
        loss = criterion(logits, labels)

        # Backward & Optimización
        loss.backward()
        # Clip de gradiente para estabilizar el entrenamiento en LSTMs
        nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        optimizer.step()

        running_loss += loss.item() * features.size(0)
        preds = torch.argmax(logits, dim=1)

        all_preds.extend(preds.cpu().numpy())
        all_targets.extend(labels.cpu().numpy())

    epoch_loss = running_loss / len(dataloader.dataset)
    epoch_acc = accuracy_score(all_targets, all_preds)
    return epoch_loss, epoch_acc


@torch.no_grad()
def evaluate(model, dataloader, criterion, device):
    """Evalúa el modelo en validación/test."""
    model.eval()
    running_loss = 0.0
    all_preds = []
    all_targets = []

    for features, labels, _ in dataloader:
        features = features.to(device)
        labels = labels.to(device)

        logits = model(features)
        loss = criterion(logits, labels)

        running_loss += loss.item() * features.size(0)
        preds = torch.argmax(logits, dim=1)

        all_preds.extend(preds.cpu().numpy())
        all_targets.extend(labels.cpu().numpy())

    eval_loss = running_loss / len(dataloader.dataset)
    acc = accuracy_score(all_targets, all_preds)
    f1 = f1_score(all_targets, all_preds, average='macro', zero_division=0)
    cm = confusion_matrix(all_targets, all_preds, labels=[0, 1, 2])

    return eval_loss, acc, f1, cm


def plot_training_curves(train_losses, val_losses, train_accs, val_accs, save_path):
    """Genera y guarda el gráfico de pérdida y precisión del entrenamiento."""
    epochs = range(1, len(train_losses) + 1)
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

    # Gráfico de Pérdida
    ax1.plot(epochs, train_losses, 'b-o', label='Train Loss')
    ax1.plot(epochs, val_losses, 'r-s', label='Val Loss')
    ax1.set_title('Evolución de la Pérdida (Loss)')
    ax1.set_xlabel('Época')
    ax1.set_ylabel('CrossEntropyLoss')
    ax1.legend()
    ax1.grid(True, linestyle='--', alpha=0.6)

    # Gráfico de Precisión
    ax2.plot(epochs, train_accs, 'b-o', label='Train Accuracy')
    ax2.plot(epochs, val_accs, 'g-s', label='Val Accuracy')
    ax2.set_title('Evolución de la Precisión (Accuracy)')
    ax2.set_xlabel('Época')
    ax2.set_ylabel('Precisión')
    ax2.legend()
    ax2.grid(True, linestyle='--', alpha=0.6)

    plt.tight_layout()
    plt.savefig(save_path, dpi=300)
    plt.close()
    print(f"[GRÁFICO] Curvas de entrenamiento guardadas en: {save_path}")


class EarlyStopping:
    """
    Parada Temprana (Early Stopping): Detiene el entrenamiento cuando la pérdida
    de validación deja de mejorar o empieza a subir.
    """
    def __init__(self, patience=4, min_delta=1e-4):
        self.patience = patience
        self.min_delta = min_delta
        self.counter = 0
        self.best_loss = float('inf')
        self.early_stop = False

    def __call__(self, val_loss):
        if val_loss < self.best_loss - self.min_delta:
            self.best_loss = val_loss
            self.counter = 0
        else:
            self.counter += 1
            if self.counter >= self.patience:
                self.early_stop = True


def main(epochs: int = 35, batch_size: int = 32, lr: float = 5e-4):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"[DISPOSITIVO] Entrenando en: {device}")

    # 1. Cargar DataLoaders con Aumento de Datos (Data Augmentation) en Train
    print("[DATOS] Preparando DataLoaders con Aumento de Datos (Data Augmentation) en Train...")
    train_loader, val_loader, _ = get_dataloaders(batch_size=batch_size)

    # 2. Inicializar Modelo Simplificado y Regularizado
    model = PoseQualityHybridModel().to(device)
    criterion = nn.CrossEntropyLoss()
    # Regularización L2 equilibrada (weight_decay=5e-4) para evitar underfitting
    optimizer = Adam(model.parameters(), lr=lr, weight_decay=5e-4)
    scheduler = ReduceLROnPlateau(optimizer, mode='min', factor=0.5, patience=2)

    # Inicializar Parada Temprana (Early Stopping alrededor de la época 5-8)
    early_stopper = EarlyStopping(patience=5, min_delta=1e-4)

    best_val_f1 = -1.0
    best_model_path = os.path.join(MODELS_DIR, "modelo.pth")

    train_losses, val_losses = [], []
    train_accs, val_accs = [], []

    print(f"[ENTRENAMIENTO] Iniciando bucle de entrenamiento por hasta {epochs} épocas (con Early Stopping)...")
    for epoch in range(1, epochs + 1):
        tr_loss, tr_acc = train_epoch(model, train_loader, criterion, optimizer, device)
        val_loss, val_acc, val_f1, val_cm = evaluate(model, val_loader, criterion, device)

        scheduler.step(val_loss)

        train_losses.append(tr_loss)
        val_losses.append(val_loss)
        train_accs.append(tr_acc)
        val_accs.append(val_acc)

        print(f"Época [{epoch:02d}/{epochs:02d}] "
              f"| Train Loss: {tr_loss:.4f} | Train Acc: {tr_acc*100:.1f}% "
              f"| Val Loss: {val_loss:.4f} | Val Acc: {val_acc*100:.1f}% | Val F1: {val_f1:.4f}")

        # Guardar mejor modelo basado en F1-Score en validación
        if val_f1 > best_val_f1:
            best_val_f1 = val_f1
            torch.save({
                'epoch': epoch,
                'model_state_dict': model.state_dict(),
                'optimizer_state_dict': optimizer.state_dict(),
                'val_f1': best_val_f1,
                'val_acc': val_acc
            }, best_model_path)
            print(f"   >>> [*] Nuevo mejor modelo guardado en {best_model_path} (F1: {val_f1:.4f})")

        # Verificar Parada Temprana (Early Stopping)
        early_stopper(val_loss)
        if early_stopper.early_stop:
            print(f"\n[STOP - EARLY STOPPING] La pérdida de validación dejó de mejorar durante {early_stopper.patience} épocas continuas (Época {epoch}). Deteniendo entrenamiento para evitar overfitting.")
            break

    print("\n[RESULTADOS FINALES] Evaluación del Mejor Modelo:")
    checkpoint = torch.load(best_model_path, map_location=device)
    model.load_state_dict(checkpoint['model_state_dict'])
    _, final_acc, final_f1, final_cm = evaluate(model, val_loader, criterion, device)

    print(f"  Precisión (Accuracy) Final: {final_acc*100:.2f}%")
    print(f"  F1-Score Macro Final:       {final_f1:.4f}")
    print("  Matriz de Confusión:")
    print(final_cm)

    # Exportar gráfico de entrenamiento
    plot_path = os.path.join(MODELS_DIR, "training_curves.png")
    plot_training_curves(train_losses, val_losses, train_accs, val_accs, plot_path)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Entrenar Modelo Híbrido 1D-CNN + BiLSTM")
    parser.add_argument("--epochs", type=int, default=20, help="Número de épocas")
    parser.add_argument("--batch_size", type=int, default=32, help="Tamaño de lote")
    parser.add_argument("--lr", type=float, default=1e-3, help="Tasa de aprendizaje")
    args = parser.parse_args()

    main(epochs=args.epochs, batch_size=args.batch_size, lr=args.lr)
