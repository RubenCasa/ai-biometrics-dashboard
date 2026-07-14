# -*- coding: utf-8 -*-
"""
model.py
--------
Arquitectura Híbrida 1D-CNN + Bidirectional LSTM para Clasificación Postural.

Decisión Técnica de Arquitectura:
1. Bloque 1D-CNN (Conv1d + BatchNorm1d + ReLU):
   - Procesa la secuencia de articulaciones extrayendo correlaciones locales y
     patrones cinemáticos de alta frecuencia (velocidades angulares implícitas y
     co-activaciones entre articulaciones adyacentes en ventanas temporales).
2. Bloque BiLSTM (Bidirectional LSTM):
   - Modela las dependencias temporales de largo alcance a lo largo de los ~46 frames
     en ambas direcciones (pasado -> futuro y futuro -> pasado), crucial para capturar
     fases completas de flexión y extensión.
3. Cabeza Clasificadora (Linear + Dropout):
   - Proyecta la representación latente global a los logits de las 3 clases posturales.
"""

import torch
import torch.nn as nn

try:
    from src.config import INPUT_FEATURES, NUM_CLASSES
except ImportError:
    from config import INPUT_FEATURES, NUM_CLASSES


class PoseQualityHybridModel(nn.Module):
    """
    Modelo híbrido 1D-CNN + BiLSTM para detección de patrones de error postural.
    Arquitectura regularizada y simplificada específicamente para prevenir overfitting.
    """

    def __init__(self,
                 input_features: int = INPUT_FEATURES,
                 cnn_channels: int = 32,
                 kernel_size: int = 3,
                 lstm_hidden_size: int = 48,
                 lstm_layers: int = 1,
                 num_classes: int = NUM_CLASSES,
                 dropout_rate: float = 0.3):
        super().__init__()

        # ---------------------------------------------------------------------
        # 1. Bloque Extractor Espacial/Local (1D-CNN) regularizado con Dropout
        #    Entrada esperada en Conv1d: (batch_size, in_channels=26, seq_len=46)
        # ---------------------------------------------------------------------
        padding = kernel_size // 2  # Mantiene la dimensión temporal (seq_len intacta)
        self.cnn_block = nn.Sequential(
            nn.Conv1d(in_channels=input_features, out_channels=cnn_channels,
                      kernel_size=kernel_size, padding=padding, bias=False),
            nn.BatchNorm1d(cnn_channels),
            nn.ReLU(inplace=True),
            nn.Dropout(p=dropout_rate * 0.4),
            
            # Segunda capa convolucional regularizada
            nn.Conv1d(in_channels=cnn_channels, out_channels=cnn_channels,
                      kernel_size=kernel_size, padding=padding, bias=False),
            nn.BatchNorm1d(cnn_channels),
            nn.ReLU(inplace=True),
            nn.Dropout(p=dropout_rate * 0.4)
        )

        # ---------------------------------------------------------------------
        # 2. Bloque Temporal Secuencial (LSTM Bidireccional compacta)
        # ---------------------------------------------------------------------
        self.lstm = nn.LSTM(
            input_size=cnn_channels,
            hidden_size=lstm_hidden_size,
            num_layers=lstm_layers,
            batch_first=True,
            bidirectional=True,
            dropout=dropout_rate if lstm_layers > 1 else 0.0
        )

        # Al ser bidireccional, la dimensión oculta se duplica (2 * lstm_hidden_size)
        lstm_out_dim = lstm_hidden_size * 2

        # ---------------------------------------------------------------------
        # 3. Cabeza de Clasificación regularizada (Dropout fuerte)
        # ---------------------------------------------------------------------
        self.classifier = nn.Sequential(
            nn.Dropout(p=dropout_rate),
            nn.Linear(lstm_out_dim, 32),
            nn.ReLU(inplace=True),
            nn.Dropout(p=dropout_rate),
            nn.Linear(32, num_classes)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Paso forward del modelo.
        
        Args:
            x: Tensor de entrada con forma (batch_size, seq_len=46, input_features=26)
        
        Returns:
            logits: Tensor con forma (batch_size, num_classes=3)
        """
        # Acomodar para Conv1d: (batch_size, channels=26, seq_len=46)
        x_permuted = x.permute(0, 2, 1)

        # Extracción convolucional 1D
        cnn_out = self.cnn_block(x_permuted)  # -> (batch_size, cnn_channels, seq_len)

        # Reacomodar para LSTM: (batch_size, seq_len, cnn_channels)
        lstm_in = cnn_out.permute(0, 2, 1)

        # Paso por la BiLSTM
        lstm_out, (hn, cn) = self.lstm(lstm_in)
        # lstm_out shape: (batch_size, seq_len, 2 * lstm_hidden_size)

        # Pooling temporal: Tomamos la media sobre toda la secuencia (Average Pooling)
        # o alternativamente el último estado oculto. Global Average Pooling es más robusto al ruido.
        context_vector = torch.mean(lstm_out, dim=1)  # -> (batch_size, 2 * lstm_hidden_size)

        # Clasificación en 3 clases
        logits = self.classifier(context_vector)  # -> (batch_size, num_classes)
        return logits


if __name__ == "__main__":
    # Prueba rápida de integridad de dimensiones
    model = PoseQualityHybridModel()
    dummy_input = torch.randn(4, 46, 26)  # Batch de 4 videos, 46 frames, 26 features
    output = model(dummy_input)
    print(f"[TEST MODEL] Entrada: {dummy_input.shape} -> Salida Logits: {output.shape}")
