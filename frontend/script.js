const API_URL = "http://127.0.0.1:8000/predict";


// Get HTML elements
const videoInput = document.getElementById("videoInput");
const videoPreview = document.getElementById("videoPreview");
const noVideo = document.getElementById("noVideo");
const analyzeBtn = document.getElementById("analyzeBtn");


// Store selected video
let selectedVideo = null;


// ------------------------------------
// When user selects a video
// ------------------------------------

videoInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) {
        return;
    }

    selectedVideo = file;

    // Show video preview
    const videoURL = URL.createObjectURL(file);

    videoPreview.src = videoURL;
    videoPreview.style.display = "block";

    noVideo.style.display = "none";

    // Reset previous prediction
    document.getElementById("prediction").textContent = "---";
    document.getElementById("confidence").textContent = "--";

});


// ------------------------------------
// Analyze button
// ------------------------------------

analyzeBtn.addEventListener("click", async function () {

    if (!selectedVideo) {

        alert("Please select a video first.");

        return;
    }


    // Disable button while processing
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = "⏳ Analyzing...";


    const formData = new FormData();

    formData.append("file", selectedVideo);


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
                `Server error: ${response.status}`
            );

        }


        const result = await response.json();


        console.log("Backend result:", result);


        // ------------------------------------
        // Display prediction
        // ------------------------------------

        document.getElementById(
            "prediction"
        ).textContent = result.predicted_shot;


        document.getElementById(
            "confidence"
        ).textContent =
            `${result.confidence.toFixed(2)}%`;


        // ------------------------------------
        // Display confidence only for
        // predicted class
        // ------------------------------------

        // Reset all class percentages
        document.getElementById("smash").textContent = "--";
        document.getElementById("clear").textContent = "--";
        document.getElementById("drop").textContent = "--";
        document.getElementById("drive").textContent = "--";
        document.getElementById("net").textContent = "--";


        // Set predicted class confidence
        const predictedClass =
            result.predicted_shot.toLowerCase();


        if (predictedClass === "smash") {

            document.getElementById("smash").textContent =
                `${result.confidence.toFixed(2)}%`;

        }

        else if (predictedClass === "clear") {

            document.getElementById("clear").textContent =
                `${result.confidence.toFixed(2)}%`;

        }

        else if (predictedClass === "drop") {

            document.getElementById("drop").textContent =
                `${result.confidence.toFixed(2)}%`;

        }

        else if (predictedClass === "drive") {

            document.getElementById("drive").textContent =
                `${result.confidence.toFixed(2)}%`;

        }

        else if (predictedClass === "net shot") {

            document.getElementById("net").textContent =
                `${result.confidence.toFixed(2)}%`;

        }


    }

    catch (error) {

        console.error(
            "Prediction error:",
            error
        );


        alert(
            "Could not connect to the prediction server."
        );

    }


    finally {

        analyzeBtn.disabled = false;
        analyzeBtn.textContent = "▶ Analyze Video";

    }

});