import torch
import torch.nn as nn
import torchvision.models as models


class BadmintonCNNLSTM(nn.Module):

    def __init__(
        self,
        num_classes=5,
        hidden_size=256,
        num_layers=2
    ):
        super(BadmintonCNNLSTM, self).__init__()

        # Pretrained ResNet18
        self.cnn = models.resnet18(
            weights=None
        )

        # Remove the final ImageNet classifier
        self.cnn.fc = nn.Identity()

        # LSTM for temporal information
        self.lstm = nn.LSTM(
            input_size=512,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=0.3
        )

        # Final classifier
        self.classifier = nn.Sequential(
            nn.Dropout(0.5),
            nn.Linear(hidden_size, num_classes)
        )

    def forward(self, x):

        batch_size, seq_len, C, H, W = x.size()

        # Combine batch and frame dimensions
        x = x.view(
            batch_size * seq_len,
            C,
            H,
            W
        )

        # Extract spatial features
        features = self.cnn(x)

        # Restore sequence dimension
        features = features.view(
            batch_size,
            seq_len,
            -1
        )

        # LSTM
        lstm_out, _ = self.lstm(features)

        # Last time-step output
        last_output = lstm_out[:, -1, :]

        # Classification
        output = self.classifier(last_output)

        return output