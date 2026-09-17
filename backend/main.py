from pathlib import Path
import shutil
import tempfile

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from ml_model2.src.predict import analyze_video


# ==========================================
# FASTAPI APP
# ==========================================

app = FastAPI(
    title="Badminton AI - Model 2 API",
    description="Badminton shot recognition and analytics using CNN + LSTM",
    version="2.0.0"
)


# ==========================================
# CORS
# ==========================================

app.add_middleware(
    CORSMiddleware,

    # For local frontend
    # Later we can replace this with
    # the Render frontend URL.
    allow_origins=["*"],

    allow_credentials=False,

    allow_methods=["*"],

    allow_headers=["*"],
)


# ==========================================
# HOME
# ==========================================

@app.get("/")
def home():

    return {
        "message": "Badminton AI Model 2 API is running",
        "model": "CNN + LSTM",
        "version": "2.0"
    }


# ==========================================
# HEALTH CHECK
# ==========================================

@app.get("/health")
def health():

    return {
        "status": "ok",
        "model": "Model 2"
    }


# ==========================================
# MODEL 2 PREDICTION
# ==========================================

@app.post("/predict-model2")
async def predict_model2(
    file: UploadFile = File(...)
):

    # --------------------------------------
    # Validate filename
    # --------------------------------------

    if not file.filename:

        return {
            "error": "No filename provided."
        }


    # --------------------------------------
    # Check video extension
    # --------------------------------------

    allowed_extensions = {
        ".mp4",
        ".avi",
        ".mov",
        ".mkv"
    }

    suffix = Path(
        file.filename
    ).suffix.lower()


    if suffix not in allowed_extensions:

        return {
            "error": (
                "Unsupported video format. "
                "Use MP4, AVI, MOV or MKV."
            )
        }


    # --------------------------------------
    # Create temporary video file
    # --------------------------------------

    temp_video_path = None


    try:

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=suffix
        ) as temp_file:

            shutil.copyfileobj(
                file.file,
                temp_file
            )

            temp_video_path = temp_file.name


        # ----------------------------------
        # Run Model 2
        # ----------------------------------

        result = analyze_video(
            temp_video_path
        )


        # ----------------------------------
        # Convert confidence values
        # ----------------------------------

        confidences = [
            round(
                float(confidence) * 100,
                2
            )

            for confidence
            in result["confidences"]
        ]


        # ----------------------------------
        # Return complete Model 2 result
        # ----------------------------------

        return {

            "filename": file.filename,

            "model": "Model 2",

            "predictions": result[
                "predictions"
            ],

            "confidences": confidences,

            "analytics": result[
                "analytics"
            ]

        }


    except Exception as error:

        print(
            "Model 2 prediction error:",
            error
        )

        return {

            "error":
                "Model 2 prediction failed.",

            "details":
                str(error)

        }


    finally:

        # ----------------------------------
        # Delete temporary video
        # ----------------------------------

        if temp_video_path:

            Path(
                temp_video_path
            ).unlink(
                missing_ok=True
            )


# ==========================================
# RUN DIRECTLY
# ==========================================

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )