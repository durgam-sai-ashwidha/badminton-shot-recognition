import torch
from pathlib import Path

from ml_model2.src.model import BadmintonCNNLSTM

from ml_model2.src.preprocessing import (
    extract_frames,
    extract_video_windows
)

from ml_model2.src.analytics import analyze_predictions


# ==========================================
# MODEL PATH
# ==========================================

MODEL_PATH = (
    Path(__file__).resolve().parent.parent
    / "models"
    / "best_badminton_cnn_lstm_model2.pth"
)


# ==========================================
# CLASS NAMES
# ==========================================

CLASS_NAMES = [
    "Smash",
    "Clear",
    "Net Shot",
    "Drop",
    "Drive"
]


# ==========================================
# LOAD MODEL
# ==========================================

def load_model():

    device = torch.device(
        "cuda"
        if torch.cuda.is_available()
        else "cpu"
    )

    model = BadmintonCNNLSTM(
        num_classes=5,
        hidden_size=256,
        num_layers=2
    )

    checkpoint = torch.load(
        MODEL_PATH,
        map_location=device,
        weights_only=True
    )

    model.load_state_dict(
        checkpoint["model_state_dict"]
    )

    model.to(device)

    model.eval()

    return model, device


# ==========================================
# PREDICT COMPLETE VIDEO
# ==========================================

def predict_video(video_path):

    model, device = load_model()

    windows = extract_video_windows(
        video_path,
        num_frames=16,
        stride=8
    )

    predictions = []
    confidences = []

    with torch.inference_mode():

        for window in windows:

            window = window.to(device)

            outputs = model(window)

            probabilities = torch.softmax(
                outputs,
                dim=1
            )

            predicted_class = torch.argmax(
                probabilities,
                dim=1
            ).item()

            predicted_label = CLASS_NAMES[
                predicted_class
            ]

            confidence = probabilities[
                0,
                predicted_class
            ].item()

            predictions.append(
                predicted_label
            )

            confidences.append(
                confidence
            )

    return predictions, confidences


# ==========================================
# ANALYZE COMPLETE VIDEO
# ==========================================

def analyze_video(video_path):

    predictions, confidences = predict_video(
        video_path
    )

    analytics = analyze_predictions(
        predictions
    )

    return {
        "predictions": predictions,

        "confidences": confidences,

        "analytics": analytics
    }


# ==========================================
# LOCAL TEST
# ==========================================

if __name__ == "__main__":

    video_path = "test_video.mp4"

    result = analyze_video(
        video_path
    )

    print(
        "=========================================="
    )

    print(
        "MODEL 2 VIDEO ANALYSIS"
    )

    print(
        "=========================================="
    )

    print(
        "\nTotal windows:"
    )

    print(
        len(result["predictions"])
    )

    print(
        "\nPredictions:"
    )

    print(
        result["predictions"]
    )

    print(
        "\nShot Frequency:"
    )

    print(
        result["analytics"]["shot_frequency"]
    )

    print(
        "\nShot Distribution:"
    )

    print(
        result["analytics"]["shot_distribution"]
    )

    print(
        "\nShot Sequence:"
    )

    print(
        result["analytics"]["shot_sequence"]
    )

    print(
        "\nShot Combinations:"
    )

    print(
        result["analytics"]["shot_combinations"]
    )

    print(
        "=========================================="
    )