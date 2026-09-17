```javascript
// ==========================================
// BADMINTON AI - MODEL 2 FRONTEND
// ==========================================

// Local backend for now.
// Later, when deploying to Render, change this
// to your Render backend URL.
const API_URL = "http://127.0.0.1:8000/predict-model2";


// ==========================================
// HTML ELEMENTS
// ==========================================

const videoInput = document.getElementById("videoInput");
const videoPreview = document.getElementById("videoPreview");
const noVideo = document.getElementById("noVideo");
const analyzeBtn = document.getElementById("analyzeBtn");


// ==========================================
// SELECTED VIDEO
// ==========================================

let selectedVideo = null;


// ==========================================
// VIDEO SELECTION
// ==========================================

videoInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) {
        return;
    }

    selectedVideo = file;


    // Create video preview
    const videoURL = URL.createObjectURL(file);

    videoPreview.src = videoURL;

    videoPreview.style.display = "block";

    noVideo.style.display = "none";


    // Reset old results
    resetResults();

});


// ==========================================
// ANALYZE BUTTON
// ==========================================

analyzeBtn.addEventListener(
    "click",
    async function () {

        if (!selectedVideo) {

            alert(
                "Please select a video first."
            );

            return;
        }


        // Disable button
        analyzeBtn.disabled = true;

        analyzeBtn.textContent =
            "⏳ Analyzing Model 2...";


        // Create multipart form
        const formData = new FormData();

        formData.append(
            "file",
            selectedVideo
        );


        try {

            console.log(
                "Sending video to Model 2..."
            );


            // ==================================
            // SEND VIDEO TO FASTAPI
            // ==================================

            const response = await fetch(
                API_URL,
                {
                    method: "POST",
                    body: formData
                }
            );


            console.log(
                "Server status:",
                response.status
            );


            // ==================================
            // SERVER ERROR
            // ==================================

            if (!response.ok) {

                throw new Error(
                    `Server error: ${response.status}`
                );

            }


            // ==================================
            // READ JSON
            // ==================================

            const result =
                await response.json();


            console.log(
                "MODEL 2 RESULT:",
                result
            );


            // ==================================
            // BACKEND ERROR
            // ==================================

            if (result.error) {

                throw new Error(
                    result.details ||
                    result.error
                );

            }


            // ==================================
            // DISPLAY EVERYTHING
            // ==================================

            displayPrediction(result);

            displayAnalytics(
                result.analytics
            );


        }

        catch (error) {

            console.error(
                "Model 2 prediction error:",
                error
            );


            alert(
                "Model 2 analysis failed.\n\n" +
                error.message
            );

        }


        finally {

            // Re-enable button
            analyzeBtn.disabled = false;

            analyzeBtn.textContent =
                "▶ Analyze Video";

        }

    }
);


// ==========================================
// DISPLAY MAIN PREDICTION
// ==========================================

function displayPrediction(result) {

    const predictions =
        result.predictions || [];


    const confidences =
        result.confidences || [];


    if (predictions.length === 0) {

        document.getElementById(
            "prediction"
        ).textContent = "No prediction";

        return;

    }


    // Use first detected window
    // for the main prediction display.

    const predictedShot =
        predictions[0];


    const confidence =
        confidences.length > 0
            ? Number(confidences[0])
            : 0;


    // ==================================
    // MAIN PREDICTION
    // ==================================

    document.getElementById(
        "prediction"
    ).textContent =
        predictedShot;


    document.getElementById(
        "confidence"
    ).textContent =
        `${confidence.toFixed(2)}%`;


    // ==================================
    // RESET CLASS CONFIDENCES
    // ==================================

    setText("smash", "--");
    setText("clear", "--");
    setText("drop", "--");
    setText("drive", "--");
    setText("net", "--");


    // ==================================
    // DISPLAY PREDICTED CLASS
    // ==================================

    const predictedClass =
        predictedShot.toLowerCase();


    if (
        predictedClass === "smash"
    ) {

        setText(
            "smash",
            `${confidence.toFixed(2)}%`
        );

    }

    else if (
        predictedClass === "clear"
    ) {

        setText(
            "clear",
            `${confidence.toFixed(2)}%`
        );

    }

    else if (
        predictedClass === "drop"
    ) {

        setText(
            "drop",
            `${confidence.toFixed(2)}%`
        );

    }

    else if (
        predictedClass === "drive"
    ) {

        setText(
            "drive",
            `${confidence.toFixed(2)}%`
        );

    }

    else if (
        predictedClass === "net shot"
    ) {

        setText(
            "net",
            `${confidence.toFixed(2)}%`
        );

    }

}


// ==========================================
// DISPLAY MODEL 2 ANALYTICS
// ==========================================

function displayAnalytics(
    analytics
) {

    if (!analytics) {

        console.warn(
            "No analytics returned."
        );

        return;
    }


    console.log(
        "Model 2 analytics:",
        analytics
    );


    // ==================================
    // SHOT FREQUENCY
    // ==================================

    const frequency =
        analytics.shot_frequency || {};


    setText(
        "frequency-smash",
        frequency["Smash"] ?? 0
    );


    setText(
        "frequency-clear",
        frequency["Clear"] ?? 0
    );


    setText(
        "frequency-drop",
        frequency["Drop"] ?? 0
    );


    setText(
        "frequency-drive",
        frequency["Drive"] ?? 0
    );


    setText(
        "frequency-net",
        frequency["Net Shot"] ?? 0
    );


    // ==================================
    // SHOT DISTRIBUTION
    // ==================================

    const distribution =
        analytics.shot_distribution || {};


    const smashDistribution =
        getPercentage(
            distribution["Smash"]
        );


    const clearDistribution =
        getPercentage(
            distribution["Clear"]
        );


    const dropDistribution =
        getPercentage(
            distribution["Drop"]
        );


    const driveDistribution =
        getPercentage(
            distribution["Drive"]
        );


    const netDistribution =
        getPercentage(
            distribution["Net Shot"]
        );


    setText(
        "distribution-smash",
        formatPercentage(
            smashDistribution
        )
    );


    setText(
        "distribution-clear",
        formatPercentage(
            clearDistribution
        )
    );


    setText(
        "distribution-drop",
        formatPercentage(
            dropDistribution
        )
    );


    setText(
        "distribution-drive",
        formatPercentage(
            driveDistribution
        )
    );


    setText(
        "distribution-net",
        formatPercentage(
            netDistribution
        )
    );


    // ==================================
    // DISTRIBUTION BARS
    // ==================================

    setDistributionBar(
        "bar-smash",
        smashDistribution
    );


    setDistributionBar(
        "bar-clear",
        clearDistribution
    );


    setDistributionBar(
        "bar-drop",
        dropDistribution
    );


    setDistributionBar(
        "bar-drive",
        driveDistribution
    );


    setDistributionBar(
        "bar-net",
        netDistribution
    );


    // ==================================
    // SHOT SEQUENCE
    // ==================================

    const sequence =
        analytics.shot_sequence;


    if (
        Array.isArray(sequence)
    ) {

        if (sequence.length > 0) {

            setText(
                "shotSequence",
                sequence.join(" → ")
            );

        }

        else {

            setText(
                "shotSequence",
                "No sequence detected."
            );

        }

    }

    else if (sequence) {

        setText(
            "shotSequence",
            String(sequence)
        );

    }

    else {

        setText(
            "shotSequence",
            "No sequence detected."
        );

    }


    // ==================================
    // SHOT COMBINATIONS
    // ==================================

    const combinations =
        analytics.shot_combinations;


    if (
        Array.isArray(combinations)
    ) {

        if (
            combinations.length > 0
        ) {

            setText(
                "shotCombinations",
                combinations.join("\n")
            );

        }

        else {

            setText(
                "shotCombinations",
                "No combinations detected."
            );

        }

    }

    else if (combinations) {

        setText(
            "shotCombinations",
            formatCombinations(
                combinations
            )
        );

    }

    else {

        setText(
            "shotCombinations",
            "No combinations detected."
        );

    }

}


// ==========================================
// RESET RESULTS
// ==========================================

function resetResults() {

    // Main prediction

    setText(
        "prediction",
        "---"
    );


    setText(
        "confidence",
        "--"
    );


    // Class confidence

    setText("smash", "--");
    setText("clear", "--");
    setText("drop", "--");
    setText("drive", "--");
    setText("net", "--");


    // Frequency

    setText(
        "frequency-smash",
        "--"
    );

    setText(
        "frequency-clear",
        "--"
    );

    setText(
        "frequency-drop",
        "--"
    );

    setText(
        "frequency-drive",
        "--"
    );

    setText(
        "frequency-net",
        "--"
    );


    // Distribution

    setText(
        "distribution-smash",
        "--"
    );

    setText(
        "distribution-clear",
        "--"
    );

    setText(
        "distribution-drop",
        "--"
    );

    setText(
        "distribution-drive",
        "--"
    );

    setText(
        "distribution-net",
        "--"
    );


    // Distribution bars

    setDistributionBar(
        "bar-smash",
        0
    );

    setDistributionBar(
        "bar-clear",
        0
    );

    setDistributionBar(
        "bar-drop",
        0
    );

    setDistributionBar(
        "bar-drive",
        0
    );

    setDistributionBar(
        "bar-net",
        0
    );


    // Sequence

    setText(
        "shotSequence",
        "No analysis yet."
    );


    // Combinations

    setText(
        "shotCombinations",
        "No analysis yet."
    );

}


// ==========================================
// SET TEXT HELPER
// ==========================================

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;

    }

}


// ==========================================
// GET PERCENTAGE
// ==========================================

function getPercentage(value) {

    if (
        value === undefined ||
        value === null
    ) {

        return 0;

    }


    let number =
        Number(value);


    if (Number.isNaN(number)) {

        return 0;

    }


    // If backend returns decimal
    // such as 0.32, convert to 32.

    if (
        number >= 0 &&
        number <= 1
    ) {

        number =
            number * 100;

    }


    return Math.max(
        0,
        Math.min(
            100,
            number
        )
    );

}


// ==========================================
// FORMAT PERCENTAGE
// ==========================================

function formatPercentage(
    value
) {

    if (
        value === undefined ||
        value === null
    ) {

        return "--";

    }


    const number =
        Number(value);


    if (Number.isNaN(number)) {

        return "--";

    }


    return `${number.toFixed(2)}%`;

}


// ==========================================
// DISTRIBUTION BAR
// ==========================================

function setDistributionBar(
    id,
    value
) {

    const bar =
        document.getElementById(id);


    if (!bar) {

        return;

    }


    const percentage =
        getPercentage(value);


    bar.style.width =
        `${percentage}%`;

}


// ==========================================
// FORMAT COMBINATIONS
// ==========================================

function formatCombinations(
    combinations
) {

    if (
        typeof combinations !== "object"
    ) {

        return String(
            combinations
        );

    }


    const lines = [];


    for (
        const [key, value]
        of Object.entries(combinations)
    ) {

        lines.push(
            `${key}: ${value}`
        );

    }


    return lines.join("\n");

}
```
