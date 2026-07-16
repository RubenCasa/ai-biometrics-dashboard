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


class SelfAttentionPooling(nn.Module):
    """
    Capa de Pooling de Atención Lineal Simple.
    Permite al modelo ponderar dinámicamente qué frames son más importantes para
    evaluar la postura, mejorando la convergencia.
    """
    def __init__(self, input_dim: int):
        super().__init__()
        self.attn_linear = nn.Linear(input_dim, 1, bias=False)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x: (batch_size, seq_len, input_dim)
        scores = self.attn_linear(x)  # -> (batch_size, seq_len, 1)
        weights = torch.softmax(scores, dim=1)  # -> (batch_size, seq_len, 1)
        context = torch.sum(x * weights, dim=1)  # -> (batch_size, input_dim)
        return context


class PoseQualityHybridModel(nn.Module):
    """
    Modelo híbrido 1D-CNN + BiLSTM + Atención para detección de patrones de error postural.
    """

    def __init__(self,
                 input_features: int = INPUT_FEATURES,
                 cnn_channels: int = 48,
                 kernel_size: int = 3,
                 lstm_hidden_size: int = 64,
                 lstm_layers: int = 1,
                 num_classes: int = NUM_CLASSES,
                 dropout_rate: float = 0.25):
        super().__init__()

        self.dropout_rate = dropout_rate

        # 1. Extractor espacial 1D-CNN
        padding = kernel_size // 2
        self.cnn_block = nn.Sequential(
            nn.Conv1d(input_features, cnn_channels, kernel_size, padding=padding, bias=False),
            nn.BatchNorm1d(cnn_channels),
            nn.ReLU(inplace=True),
            nn.Dropout(p=dropout_rate * 0.4),
            nn.Conv1d(cnn_channels, cnn_channels, kernel_size, padding=padding, bias=False),
            nn.BatchNorm1d(cnn_channels)
        )
        
        # Conexión residual para la CNN
        self.cnn_shortcut = nn.Sequential(
            nn.Conv1d(input_features, cnn_channels, kernel_size=1, bias=False),
            nn.BatchNorm1d(cnn_channels)
        )

        # 2. Bloque temporal BiLSTM
        self.lstm = nn.LSTM(
            input_size=cnn_channels,
            hidden_size=lstm_hidden_size,
            num_layers=lstm_layers,
            batch_first=True,
            bidirectional=True,
            dropout=dropout_rate if lstm_layers > 1 else 0.0
        )

        # Al ser bidireccional, la dimensión se duplica
        lstm_out_dim = lstm_hidden_size * 2

        # 3. Pooling por Atención
        self.attention_pooling = SelfAttentionPooling(lstm_out_dim)

        # 4. Cabeza clasificadora regularizada
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
        x: (batch_size, seq_len=46, input_features=26)
        """
        # Acomodar para Conv1d: (batch_size, channels=26, seq_len=46)
        x_permuted = x.permute(0, 2, 1)

        # Extracción convolucional 1D con conexión residual
        cnn_out = self.cnn_block(x_permuted)
        shortcut = self.cnn_shortcut(x_permuted)
        cnn_out = nn.functional.relu(cnn_out + shortcut)
        cnn_out = nn.functional.dropout(cnn_out, p=self.dropout_rate * 0.4, training=self.training)

        # Reacomodar para LSTM: (batch_size, seq_len, cnn_channels)
        lstm_in = cnn_out.permute(0, 2, 1)

        # Paso por la BiLSTM
        lstm_out, _ = self.lstm(lstm_in)  # -> (batch_size, seq_len, 2 * lstm_hidden_size)

        # Pooling por Atención
        context_vector = self.attention_pooling(lstm_out)  # -> (batch_size, 2 * lstm_hidden_size)

        # Clasificación
        logits = self.classifier(context_vector)  # -> (batch_size, num_classes)
        return logits


if __name__ == "__main__":
    # Prueba rápida de integridad de dimensiones
    model = PoseQualityHybridModel()
    dummy_input = torch.randn(4, 46, 26)  # Batch de 4, 46 frames, 26 features
    output = model(dummy_input)
    print(f"[TEST MODEL] Entrada: {dummy_input.shape} -> Salida Logits: {output.shape}")
