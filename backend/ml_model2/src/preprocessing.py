import cv2
import numpy as np
import torch
from PIL import Image
from torchvision import transforms
from collections import deque


# ==========================================
# CONFIGURATION
# ==========================================

NUM_FRAMES = 16
STRIDE = 8
IMAGE_SIZE = 224


# ==========================================
# IMAGE TRANSFORMATION
# ==========================================

transform = transforms.Compose([
    transforms.Resize(
        (IMAGE_SIZE, IMAGE_SIZE)
    ),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=[
            0.485,
            0.456,
            0.406
        ],

        std=[
            0.229,
            0.224,
            0.225
        ]
    )
])


# ==========================================
# PROCESS SINGLE FRAME
# ==========================================

def process_frame(frame):

    frame = cv2.cvtColor(
        frame,
        cv2.COLOR_BGR2RGB
    )

    frame = Image.fromarray(frame)

    frame = transform(frame)

    return frame


# ==========================================
# EXTRACT FIXED FRAMES
# ==========================================

def extract_frames(
    video_path,
    num_frames=NUM_FRAMES
):

    cap = cv2.VideoCapture(video_path)

    total_frames = int(
        cap.get(
            cv2.CAP_PROP_FRAME_COUNT
        )
    )

    if total_frames <= 0:
        cap.release()
        raise ValueError(
            "Could not read video."
        )

    frame_indices = np.linspace(
        0,
        total_frames - 1,
        num_frames
    ).astype(int)

    frames = []

    for frame_idx in frame_indices:

        cap.set(
            cv2.CAP_PROP_POS_FRAMES,
            int(frame_idx)
        )

        ret, frame = cap.read()

        if ret:

            frame = process_frame(frame)

            frames.append(frame)

        else:

            black_frame = np.zeros(
                (
                    IMAGE_SIZE,
                    IMAGE_SIZE,
                    3
                ),
                dtype=np.uint8
            )

            black_frame = Image.fromarray(
                black_frame
            )

            black_frame = transform(
                black_frame
            )

            frames.append(
                black_frame
            )

    cap.release()

    frames = torch.stack(frames)

    frames = frames.unsqueeze(0)

    return frames


# ==========================================
# MEMORY-EFFICIENT SLIDING WINDOWS
# ==========================================

def extract_video_windows(
    video_path,
    num_frames=NUM_FRAMES,
    stride=STRIDE
):

    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():

        raise ValueError(
            "Could not open video."
        )

    frame_buffer = deque(
        maxlen=num_frames
    )

    frame_count = 0
    yielded_window = False

    while True:

        ret, frame = cap.read()

        if not ret:
            break

        processed_frame = process_frame(
            frame
        )

        frame_buffer.append(
            processed_frame
        )

        frame_count += 1

        # ----------------------------------
        # Full window available
        # ----------------------------------

        if len(frame_buffer) == num_frames:

            window = torch.stack(
                list(frame_buffer)
            )

            window = window.unsqueeze(0)

            yield window

            yielded_window = True

            # Move forward by stride
            for _ in range(
                min(
                    stride,
                    len(frame_buffer)
                )
            ):

                frame_buffer.popleft()

    cap.release()

    # --------------------------------------
    # Short video
    # --------------------------------------

    if not yielded_window:

        if len(frame_buffer) == 0:

            raise ValueError(
                "No frames could be extracted."
            )

        padded_frames = list(
            frame_buffer
        )

        while len(padded_frames) < num_frames:

            padded_frames.append(
                padded_frames[-1].clone()
            )

        window = torch.stack(
            padded_frames[:num_frames]
        )

        window = window.unsqueeze(0)

        yield window