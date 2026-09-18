from pathlib import Path

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from ml_model2.src.predict import analyze_video


app = FastAPI(
    title="Badminton AI - Model 2 API",
    version="2.0.0",
    description="Badminton shot recognition and analytics using CNN + LSTM",
)


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
        "status": "ok",
        "model": "Model 2"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model": "Model 2"
    }


@app.post("/predict-model2")
async def predict_model2(
    file: UploadFile = File(...)
):

    temp_dir = Path("temp")
    temp_dir.mkdir(exist_ok=True)

    video_path = temp_dir / file.filename

    contents = await file.read()

    with open(video_path, "wb") as f:
        f.write(contents)

    try:

        result = analyze_video(
            str(video_path)
        )

        return {
            "filename": file.filename,
            "model": "Model 2",
            **result
        }

    finally:

        if video_path.exists():
            video_path.unlink()