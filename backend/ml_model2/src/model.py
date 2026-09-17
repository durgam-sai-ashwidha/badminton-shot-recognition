import torch
import torch.nn as nn


# ==========================================
# RESNET BASIC BLOCK
# ==========================================

class BasicBlock(nn.Module):

    expansion = 1

    def __init__(self, in_channels, out_channels, stride=1):

        super().__init__()

        self.conv1 = nn.Conv2d(
            in_channels,
            out_channels,
            kernel_size=3,
            stride=stride,
            padding=1,
            bias=False
        )

        self.bn1 = nn.BatchNorm2d(out_channels)

        self.conv2 = nn.Conv2d(
            out_channels,
            out_channels,
            kernel_size=3,
            stride=1,
            padding=1,
            bias=False
        )

        self.bn2 = nn.BatchNorm2d(out_channels)

        self.downsample = None

        if stride != 1 or in_channels != out_channels:

            self.downsample = nn.Sequential(
                nn.Conv2d(
                    in_channels,
                    out_channels,
                    kernel_size=1,
                    stride=stride,
                    bias=False
                ),
                nn.BatchNorm2d(out_channels)
            )

        self.relu = nn.ReLU(inplace=True)

    def forward(self, x):

        identity = x

        out = self.conv1(x)
        out = self.bn1(out)
        out = self.relu(out)

        out = self.conv2(out)
        out = self.bn2(out)

        if self.downsample is not None:
            identity = self.downsample(x)

        out += identity
        out = self.relu(out)

        return out


# ==========================================
# CUSTOM RESNET18
# ==========================================

class ResNet18(nn.Module):

    def __init__(self):

        super().__init__()

        self.conv1 = nn.Conv2d(
            3,
            64,
            kernel_size=7,
            stride=2,
            padding=3,
            bias=False
        )

        self.bn1 = nn.BatchNorm2d(64)

        self.relu = nn.ReLU(inplace=True)

        self.maxpool = nn.MaxPool2d(
            kernel_size=3,
            stride=2,
            padding=1
        )

        self.layer1 = self._make_layer(
            64, 64, 2, stride=1
        )

        self.layer2 = self._make_layer(
            64, 128, 2, stride=2
        )

        self.layer3 = self._make_layer(
            128, 256, 2, stride=2
        )

        self.layer4 = self._make_layer(
            256, 512, 2, stride=2
        )

        self.avgpool = nn.AdaptiveAvgPool2d(
            (1, 1)
        )

    def _make_layer(
        self,
        in_channels,
        out_channels,
        blocks,
        stride
    ):

        layers = []

        layers.append(
            BasicBlock(
                in_channels,
                out_channels,
                stride
            )
        )

        for _ in range(1, blocks):

            layers.append(
                BasicBlock(
                    out_channels,
                    out_channels
                )
            )

        return nn.Sequential(*layers)

    def forward(self, x):

        x = self.conv1(x)
        x = self.bn1(x)
        x = self.relu(x)
        x = self.maxpool(x)

        x = self.layer1(x)
        x = self.layer2(x)
        x = self.layer3(x)
        x = self.layer4(x)

        x = self.avgpool(x)

        x = torch.flatten(x, 1)

        return x


# ==========================================
# BADMINTON CNN + LSTM
# ==========================================

class BadmintonCNNLSTM(nn.Module):

    def __init__(
        self,
        num_classes=5,
        hidden_size=256,
        num_layers=2
    ):

        super().__init__()

        self.cnn = ResNet18()

        self.lstm = nn.LSTM(
            input_size=512,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True
        )

        self.classifier = nn.Sequential(
            nn.Dropout(0.5),
            nn.Linear(
                hidden_size,
                num_classes
            )
        )

    def forward(self, x):

        # Expected:
        # [batch, sequence, channels, height, width]

        batch_size, sequence_length, C, H, W = x.shape

        x = x.view(
            batch_size * sequence_length,
            C,
            H,
            W
        )

        x = self.cnn(x)

        x = x.view(
            batch_size,
            sequence_length,
            512
        )

        x, _ = self.lstm(x)

        x = x[:, -1, :]

        x = self.classifier(x)

        return x