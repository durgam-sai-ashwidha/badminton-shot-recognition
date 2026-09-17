const API_URL = "http://127.0.0.1:8000/predict-model2";

// ------------------------------------------
// HTML ELEMENTS
// ------------------------------------------

const videoInput = document.getElementById("videoInput");
const videoPreview = document.getElementById("videoPreview");
const noVideo = document.getElementById("noVideo");
const analyzeBtn = document.getElementById("analyzeBtn");


// ------------------------------------------
// STATE
// ------------------------------------------

let selectedVideo = null;


// ------------------------------------------
// VIDEO SELECTION
// ------------------------------------------

videoInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) {
        return;
    }

    selectedVideo = file;

    const videoURL = URL.createObjectURL(file);

    videoPreview.src = videoURL;
    videoPreview.style.display = "block";

    noVideo.style.display = "none";

    resetResults();
});


// ------------------------------------------
// RESET RESULTS
// ------------------------------------------

function resetResults() {

    document.getElementById("prediction").textContent = "---";

    document.getElementById("confidence").textContent = "--";

    document.getElementById("smash").textContent = "--";
    document.getElementById("clear").textContent = "--";
    document.getElementById("drop").textContent = "--";
    document.getElementById("drive").textContent = "--";
    document.getElementById("net").textContent = "--";
}


// ------------------------------------------
// DISPLAY PREDICTED SHOT
// ------------------------------------------

function displayPrediction(result) {

    const predictions = result.predictions || [];
    const confidences = result.confidences || [];

    if (predictions.length === 0) {
        return;
    }

    const lastIndex = predictions.length - 1;

    const predictedShot = predictions[lastIndex];

    const confidence = Number(
        confidences[lastIndex] || 0
    );


    // Main prediction

    document.getElementById(
        "prediction"
    ).textContent = predictedShot;


    document.getElementById(
        "confidence"
    ).textContent =
        `${confidence.toFixed(2)}%`;


    // Reset class values

    document.getElementById("smash").textContent = "--";
    document.getElementById("clear").textContent = "--";
    document.getElementById("drop").textContent = "--";
    document.getElementById("drive").textContent = "--";
    document.getElementById("net").textContent = "--";


    // Display confidence for predicted class

    const shot = predictedShot.toLowerCase();


    if (shot === "smash") {

        document.getElementById(
            "smash"
        ).textContent =
            `${confidence.toFixed(2)}%`;

    }

    else if (shot === "clear") {

        document.getElementById(
            "clear"
        ).textContent =
            `${confidence.toFixed(2)}%`;

    }

    else if (shot === "drop") {

        document.getElementById(
            "drop"
        ).textContent =
            `${confidence.toFixed(2)}%`;

    }

    else if (shot === "drive") {

        document.getElementById(
            "drive"
        ).textContent =
            `${confidence.toFixed(2)}%`;

    }

    else if (shot === "net shot") {

        document.getElementById(
            "net"
        ).textContent =
            `${confidence.toFixed(2)}%`;
    }
}


// ------------------------------------------
// ANALYTICS
// ------------------------------------------

function displayAnalytics(result) {

    const analytics = result.analytics;

    if (!analytics) {
        return;
    }

    console.log(
        "Shot Frequency:",
        analytics.shot_frequency
    );

    console.log(
        "Shot Distribution:",
        analytics.shot_distribution
    );

    console.log(
        "Shot Sequence:",
        analytics.shot_sequence
    );

    console.log(
        "Shot Combinations:",
        analytics.shot_combinations
    );
}


// ------------------------------------------
// ANALYZE VIDEO
// ------------------------------------------

analyzeBtn.addEventListener(
    "click",
    async function () {

        if (!selectedVideo) {

            alert(
                "Please select a badminton video first."
            );

            return;
        }


        // Disable button

        analyzeBtn.disabled = true;

        analyzeBtn.textContent =
            "⏳ Analyzing...";


        // Create form data

        const formData = new FormData();

        formData.append(
            "file",
            selectedVideo
        );


        try {

            const response = await fetch(
                API_URL,
                {
                    method: "POST",
                    body: formData
                }
            );


            if (!response.ok) {

                throw new Error(
                    `Server returned ${response.status}`
                );
            }


            const result =
                await response.json();


            console.log(
                "Model 2 result:",
                result
            );


            // Display prediction

            displayPrediction(
                result
            );


            // Display analytics

            displayAnalytics(
                result
            );


        }

        catch (error) {

            console.error(
                "Prediction error:",
                error
            );


            alert(
                "Could not connect to the Model 2 backend."
            );
        }


        finally {

            analyzeBtn.disabled = false;

            analyzeBtn.textContent =
                "▶ Analyze Video";
        }

    }
);