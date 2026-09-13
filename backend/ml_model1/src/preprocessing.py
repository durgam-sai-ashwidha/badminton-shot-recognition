import cv2
import numpy as np
import torch
from PIL import Image
from torchvision import transforms


NUM_FRAMES = 16


transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


def extract_frames(video_path, num_frames=NUM_FRAMES):

    cap = cv2.VideoCapture(video_path)

    total_frames = int(
        cap.get(cv2.CAP_PROP_FRAME_COUNT)
    )

    if total_frames <= 0:
        cap.release()
        raise ValueError("Could not read video.")

    frame_indices = np.linspace(
        0,
        total_frames - 1,
        num_frames
    ).astype(int)

    frames = []

    for frame_idx in frame_indices:

        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)

        ret, frame = cap.read()

        if ret:

            frame = cv2.cvtColor(
                frame,
                cv2.COLOR_BGR2RGB
            )

            frame = Image.fromarray(frame)

            frame = transform(frame)

            frames.append(frame)

        else:

            black_frame = Image.fromarray(
                np.zeros(
                    (224, 224, 3),
                    dtype=np.uint8
                )
            )

            black_frame = transform(black_frame)

            frames.append(black_frame)

    cap.release()

    frames = torch.stack(frames)

    # Add batch dimension
    frames = frames.unsqueeze(0)

    return frames