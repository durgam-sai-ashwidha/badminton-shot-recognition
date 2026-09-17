import cv2
import numpy as np
import torch
from PIL import Image
from torchvision import transforms


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

    frame = Image.fromarray(
        frame
    )

    frame = transform(
        frame
    )

    return frame


# ==========================================
# EXTRACT FIXED FRAMES
# ==========================================

def extract_frames(
    video_path,
    num_frames=NUM_FRAMES
):

    cap = cv2.VideoCapture(
        video_path
    )

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

            frame = process_frame(
                frame
            )

            frames.append(
                frame
            )

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


    frames = torch.stack(
        frames
    )


    # Batch dimension
    frames = frames.unsqueeze(0)


    return frames


# ==========================================
# EXTRACT SLIDING WINDOWS
# ==========================================

def extract_video_windows(
    video_path,
    num_frames=NUM_FRAMES,
    stride=STRIDE
):

    cap = cv2.VideoCapture(
        video_path
    )


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


    # ======================================
    # READ VIDEO FRAMES
    # ======================================

    all_frames = []


    for _ in range(total_frames):

        ret, frame = cap.read()


        if not ret:
            break


        processed_frame = process_frame(
            frame
        )


        all_frames.append(
            processed_frame
        )


    cap.release()


    if len(all_frames) == 0:

        raise ValueError(
            "No frames could be extracted."
        )


    # ======================================
    # CREATE WINDOWS
    # ======================================

    windows = []


    # Normal sliding windows

    for start in range(
        0,
        len(all_frames) - num_frames + 1,
        stride
    ):

        window_frames = all_frames[
            start:start + num_frames
        ]


        window = torch.stack(
            window_frames
        )


        # Add batch dimension

        window = window.unsqueeze(0)


        windows.append(
            window
        )


    # ======================================
    # SHORT VIDEO
    # ======================================

    if len(windows) == 0:

        padded_frames = list(
            all_frames
        )


        while len(padded_frames) < num_frames:

            padded_frames.append(
                padded_frames[-1].clone()
            )


        window = torch.stack(
            padded_frames[:num_frames]
        )


        window = window.unsqueeze(0)


        windows.append(
            window
        )


    return windows