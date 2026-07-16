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


def plot_training_curves(train_losses, val_losses, val_accs, val_f1s, save_path, lr=5e-4):
    """Genera y guarda el gráfico de pérdida y precisión en estilo científico Dark Blue Premium."""
    epochs = range(1, len(train_losses) + 1)
    
    # Configuración de estilo científico dark
    plt.rcParams['font.family'] = 'sans-serif'
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 6.5), facecolor='#0f172a')
    
    # Colores base
    ax1.set_facecolor('#1e293b')
    ax2.set_facecolor('#1e293b')
    
    # --- Gráfico de Pérdida (Loss) ---
    ax1.plot(epochs, train_losses, color='#06b6d4', marker='o', linewidth=2.5, markersize=5, label='Pérdida de Entrenamiento (Train Loss)')
    ax1.plot(epochs, val_losses, color='#f43f5e', marker='s', linewidth=2.5, markersize=5, label='Pérdida de Validación (Val Loss)')
    
    # Encontrar mejor época (mínima val loss o máxima val F1)
    best_epoch_idx = np.argmax(val_f1s)
    best_epoch = epochs[best_epoch_idx]
    best_loss = val_losses[best_epoch_idx]
    
    ax1.axvline(x=best_epoch, color='#10b981', linestyle='--', linewidth=2, label='Early Stopping / Checkpoint')
    ax1.annotate(f'Época Óptima ({best_epoch})\nLoss: {best_loss:.4f}',
                 xy=(best_epoch, best_loss), xytext=(best_epoch - 3, best_loss + 0.15),
                 color='#10b981', fontweight='bold', fontsize=10,
                 arrowprops=dict(arrowstyle='->', color='#10b981', lw=1.5))
    
    ax1.set_title(f'Evolución de la Función de Pérdida (CrossEntropy Loss)\n[lr={lr}, Weight Decay=5e-4, Dropout=0.25]', color='#f8fafc', fontsize=12, fontweight='bold', pad=15)
    ax1.set_xlabel('Época de Entrenamiento', color='#cbd5e1', fontsize=11)
    ax1.set_ylabel('Pérdida (Loss)', color='#cbd5e1', fontsize=11)
    ax1.tick_params(colors='#94a3b8', labelsize=10)
    ax1.grid(True, linestyle=':', alpha=0.3, color='#64748b')
    ax1.legend(loc='upper right', facecolor='#0f172a', edgecolor='#334155', labelcolor='#f8fafc', fontsize=9.5)
    
    # --- Gráfico de Rendimiento (Accuracy & F1-Score) ---
    val_accs_pct = [acc * 100 for acc in val_accs]
    ax2.plot(epochs, val_accs_pct, color='#10b981', marker='D', linewidth=2.5, markersize=5, label='Precisión de Validación (Accuracy %)')
    
    ax2.set_title('Métricas de Rendimiento y Generalización en Validación\n[1D-CNN + BiLSTM con ResNet Shortcuts en Penn Action]', color='#f8fafc', fontsize=12, fontweight='bold', pad=15)
    ax2.set_xlabel('Época de Entrenamiento', color='#cbd5e1', fontsize=11)
    ax2.set_ylabel('Precisión (%)', color='#10b981', fontsize=11)
    ax2.tick_params(axis='y', colors='#10b981', labelsize=10)
    ax2.tick_params(axis='x', colors='#94a3b8', labelsize=10)
    ax2.grid(True, linestyle=':', alpha=0.3, color='#64748b')
    
    # Segundo eje para F1-Score
    ax2_f1 = ax2.twinx()
    ax2_f1.plot(epochs, val_f1s, color='#f59e0b', marker='^', linestyle='--', linewidth=2.2, markersize=5, label='Macro F1-Score')
    ax2_f1.set_ylabel('F1-Score', color='#f59e0b', fontsize=11)
    ax2_f1.tick_params(axis='y', colors='#f59e0b', labelsize=10)
    
    # Anotación del máximo rendimiento
    max_acc = val_accs_pct[best_epoch_idx]
    max_f1 = val_f1s[best_epoch_idx]
    ax2.annotate(f'Acc Máxima: {max_acc:.1f}%\nF1-Score: {max_f1:.3f}',
                 xy=(best_epoch, max_acc), xytext=(best_epoch - 5, max_acc - 10),
                 color='#10b981', fontweight='bold', fontsize=10,
                 arrowprops=dict(arrowstyle='->', color='#10b981', lw=1.5))
    
    # Combinar leyendas de ax2 y ax2_f1
    lines1, labels1 = ax2.get_legend_handles_labels()
    lines2, labels2 = ax2_f1.get_legend_handles_labels()
    ax2.legend(lines1 + lines2, labels1 + labels2, loc='lower right', facecolor='#0f172a', edgecolor='#334155', labelcolor='#f8fafc', fontsize=9.5)
    
    plt.tight_layout()
    plt.savefig(save_path, dpi=300, facecolor=fig.get_facecolor(), edgecolor='none')
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
    train_accs, val_accs, val_f1s = [], [], []

    print(f"[ENTRENAMIENTO] Iniciando bucle de entrenamiento por hasta {epochs} épocas (con Early Stopping)...")
    for epoch in range(1, epochs + 1):
        tr_loss, tr_acc = train_epoch(model, train_loader, criterion, optimizer, device)
        val_loss, val_acc, val_f1, val_cm = evaluate(model, val_loader, criterion, device)

        scheduler.step(val_loss)

        train_losses.append(tr_loss)
        val_losses.append(val_loss)
        train_accs.append(tr_acc)
        val_accs.append(val_acc)
        val_f1s.append(val_f1)

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
    plot_training_curves(train_losses, val_losses, val_accs, val_f1s, plot_path, lr=lr)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Entrenar Modelo Híbrido 1D-CNN + BiLSTM")
    parser.add_argument("--epochs", type=int, default=20, help="Número de épocas")
    parser.add_argument("--batch_size", type=int, default=32, help="Tamaño de lote")
    parser.add_argument("--lr", type=float, default=1e-3, help="Tasa de aprendizaje")
    args = parser.parse_args()

    main(epochs=args.epochs, batch_size=args.batch_size, lr=args.lr)
