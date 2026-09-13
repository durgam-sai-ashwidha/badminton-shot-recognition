from pathlib import Path
import shutil
import tempfile

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from ml_model1.src.predict import predict_video


app = FastAPI(
    title="Badminton Shot Recognition API"
)


# Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "Badminton Shot Recognition API is running"
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    # Create temporary file
    suffix = Path(file.filename).suffix

    with tempfile.NamedTemporaryFile(
        delete=False,
        suffix=suffix
    ) as temp_file:

        shutil.copyfileobj(
            file.file,
            temp_file
        )

        temp_video_path = temp_file.name

    try:

        # Run CNN + LSTM prediction
        label, confidence = predict_video(
            temp_video_path
        )

        return {
            "filename": file.filename,
            "predicted_shot": label,
            "confidence": round(
                confidence * 100,
                2
            )
        }

    finally:

        # Delete temporary video
        Path(temp_video_path).unlink(
            missing_ok=True
        )