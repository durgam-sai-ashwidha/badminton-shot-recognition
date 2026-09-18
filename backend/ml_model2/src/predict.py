
import gc
from pathlib import Path

import torch

from ml_model2.src.model import BadmintonCNNLSTM

from ml_model2.src.preprocessing import (
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

    # Render CPU environment
    device = torch.device("cpu")

    model = BadmintonCNNLSTM(
        num_classes=5,
        hidden_size=256,
        num_layers=2
    )

    # Load checkpoint directly onto CPU.
    # mmap=True helps reduce peak memory while
    # loading supported PyTorch checkpoints.
    checkpoint = torch.load(
        MODEL_PATH,
        map_location=device,
        weights_only=True,
        mmap=True
    )

    model.load_state_dict(
        checkpoint["model_state_dict"]
    )

    # Release checkpoint dictionary after
    # copying the weights into the model.
    del checkpoint

    model.to(device)

    # Evaluation mode disables training behaviour
    # such as Dropout and updates to BatchNorm.
    model.eval()

    return model, device


# ==========================================
# PREDICT COMPLETE VIDEO
# ==========================================

def predict_video(video_path):

    model, device = load_model()

    predictions = []
    confidences = []

    try:

        # IMPORTANT:
        # extract_video_windows now yields ONE
        # window at a time instead of keeping the
        # entire video in RAM.
        windows = extract_video_windows(
            video_path,
            num_frames=16,
            stride=8
        )

        with torch.inference_mode():

            for window in windows:

                # Keep only the current window in memory.
                window = window.to(
                    device,
                    non_blocking=False
                )

                outputs = model(
                    window
                )

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

                # Explicitly release tensors from
                # the current iteration.
                del window
                del outputs
                del probabilities

    finally:

        # Release model and Python references.
        del model

        # Ask Python to release unused objects.
        gc.collect()

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
        "\nConfidences:"
    )

    print(
        result["confidences"]
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

