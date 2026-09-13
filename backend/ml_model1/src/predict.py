import torch
from pathlib import Path

from ml_model1.src.model import BadmintonCNNLSTM
from ml_model1.src.preprocessing import extract_frames


MODEL_PATH = (
    Path(__file__).resolve().parent.parent
    / "models"
    / "best_badminton_cnn_lstm.pth"
)


CLASS_NAMES = [
    "Smash",
    "Clear",
    "Net Shot",
    "Drop",
    "Drive"
]


def load_model():

    device = torch.device(
        "cuda" if torch.cuda.is_available() else "cpu"
    )

    model = BadmintonCNNLSTM()

    state_dict = torch.load(
        MODEL_PATH,
        map_location=device,
        weights_only=True
    )

    model.load_state_dict(state_dict)

    model.to(device)

    model.eval()

    return model, device


def predict_video(video_path):

    model, device = load_model()

    frames = extract_frames(video_path)

    frames = frames.to(device)

    with torch.inference_mode():

        outputs = model(frames)

        probabilities = torch.softmax(
            outputs,
            dim=1
        )

        predicted_class = torch.argmax(
            probabilities,
            dim=1
        ).item()

    predicted_label = CLASS_NAMES[predicted_class]

    confidence = probabilities[0][predicted_class].item()

    return predicted_label, confidence


if __name__ == "__main__":

    video_path = "test_video.mp4"

    label, confidence = predict_video(video_path)

    print("Predicted shot:", label)
    print("Confidence:", f"{confidence * 100:.2f}%")