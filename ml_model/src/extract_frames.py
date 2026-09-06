import cv2
import os

video_path = "ml_model/data/raw/smash/smash1.mp4"
output_folder = "ml_model/data/processed/smash/smash1"

os.makedirs(output_folder, exist_ok=True)

video = cv2.VideoCapture(video_path)

if not video.isOpened():
    print("ERROR: Could not open video:", video_path)
    exit()

total_frames = int(video.get(cv2.CAP_PROP_FRAME_COUNT))

print("Total frames:", total_frames)

num_frames = 16

for i in range(num_frames):

    frame_number = int(i * total_frames / num_frames)

    video.set(cv2.CAP_PROP_POS_FRAMES, frame_number)

    ret, frame = video.read()

    if ret:
        frame = cv2.resize(frame, (224, 224))

        filename = os.path.join(
            output_folder,
            f"frame_{i:02d}.jpg"
        )

        cv2.imwrite(filename, frame)

        print("Saved:", filename)

    else:
        print("Could not read frame:", frame_number)

video.release()

print("Frame extraction completed!")