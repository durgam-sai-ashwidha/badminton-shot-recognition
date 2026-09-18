// ============================================================
// BADMINTON AI - MODEL 2 FRONTEND
// ============================================================

console.log("🔥🔥🔥 BADMINTON SCRIPT.JS LOADED 🔥🔥🔥");


// ============================================================
// API
// ============================================================

const API_URL = "http://127.0.0.1:8000";

const PREDICT_URL =
    `${API_URL}/predict-model2`;

console.log(
    "Badminton AI frontend loaded."
);

console.log(
    "Model 2 API:",
    PREDICT_URL
);


// ============================================================
// HTML ELEMENTS
// ============================================================

const videoInput =
    document.getElementById("videoInput");

const videoPreview =
    document.getElementById("videoPreview");

const noVideo =
    document.getElementById("noVideo");

const analyzeBtn =
    document.getElementById("analyzeBtn");


// ============================================================
// CHECK HTML ELEMENTS
// ============================================================

console.log(
    "videoInput:",
    videoInput
);

console.log(
    "videoPreview:",
    videoPreview
);

console.log(
    "noVideo:",
    noVideo
);

console.log(
    "analyzeBtn:",
    analyzeBtn
);


// ============================================================
// STATE
// ============================================================

let selectedVideo = null;


// ============================================================
// VIDEO SELECTION
// ============================================================

videoInput.addEventListener(
    "change",
    function () {

        console.log(
            "========== FILE SELECTED =========="
        );


        const file =
            this.files[0];


        if (!file) {

            console.log(
                "No file selected."
            );

            return;
        }


        // Store selected file

        selectedVideo =
            file;


        console.log(
            "Selected file:",
            file.name
        );

        console.log(
            "File type:",
            file.type
        );

        console.log(
            "File size:",
            file.size
        );


        // ====================================================
        // VIDEO PREVIEW
        // ====================================================

        const videoURL =
            URL.createObjectURL(file);


        videoPreview.src =
            videoURL;


        videoPreview.style.display =
            "block";


        noVideo.style.display =
            "none";


        // Load the video

        videoPreview.load();


        // Reset previous results

        resetResults();


        console.log(
            "Video preview loaded."
        );

        console.log(
            "=================================="
        );

    }
);


// ============================================================
// RESET RESULTS
// ============================================================

function resetResults() {

    console.log(
        "Resetting frontend results..."
    );


    // Main prediction

    document.getElementById(
        "prediction"
    ).textContent = "---";


    document.getElementById(
        "confidence"
    ).textContent = "--";


    // Shot classes

    document.getElementById(
        "smash"
    ).textContent = "--";


    document.getElementById(
        "clear"
    ).textContent = "--";


    document.getElementById(
        "drop"
    ).textContent = "--";


    document.getElementById(
        "drive"
    ).textContent = "--";


    document.getElementById(
        "net"
    ).textContent = "--";


    // Frequency

    document.getElementById(
        "frequency-smash"
    ).textContent = "--";


    document.getElementById(
        "frequency-clear"
    ).textContent = "--";


    document.getElementById(
        "frequency-drop"
    ).textContent = "--";


    document.getElementById(
        "frequency-drive"
    ).textContent = "--";


    document.getElementById(
        "frequency-net"
    ).textContent = "--";


    // Distribution

    document.getElementById(
        "distribution-smash"
    ).textContent = "--";


    document.getElementById(
        "distribution-clear"
    ).textContent = "--";


    document.getElementById(
        "distribution-drop"
    ).textContent = "--";


    document.getElementById(
        "distribution-drive"
    ).textContent = "--";


    document.getElementById(
        "distribution-net"
    ).textContent = "--";


    // Bars

    document.getElementById(
        "bar-smash"
    ).style.width = "0%";


    document.getElementById(
        "bar-clear"
    ).style.width = "0%";


    document.getElementById(
        "bar-drop"
    ).style.width = "0%";


    document.getElementById(
        "bar-drive"
    ).style.width = "0%";


    document.getElementById(
        "bar-net"
    ).style.width = "0%";


    // Sequence

    document.getElementById(
        "shotSequence"
    ).textContent =
        "No analysis yet.";


    // Combinations

    document.getElementById(
        "shotCombinations"
    ).textContent =
        "No analysis yet.";

}


// ============================================================
// CONFIDENCE FORMAT
// ============================================================

function formatConfidence(value) {

    const number =
        Number(value);


    if (
        Number.isNaN(number)
    ) {

        return "0.00%";

    }


    const percentage =
        number <= 1
            ? number * 100
            : number;


    return (
        percentage.toFixed(2)
        + "%"
    );

}


// ============================================================
// DISPLAY PREDICTION
// ============================================================

function displayPrediction(result) {

    console.log(
        "Displaying prediction:",
        result
    );


    const predictions =
        result.predictions || [];


    const confidences =
        result.confidences || [];


    if (
        predictions.length === 0
    ) {

        document.getElementById(
            "prediction"
        ).textContent =
            "No prediction";


        document.getElementById(
            "confidence"
        ).textContent =
            "0.00%";


        return;

    }


    const lastIndex =
        predictions.length - 1;


    const predictedShot =
        predictions[lastIndex];


    const confidence =
        Number(
            confidences[lastIndex] || 0
        );


    // Main prediction

    document.getElementById(
        "prediction"
    ).textContent =
        predictedShot;


    // Confidence

    document.getElementById(
        "confidence"
    ).textContent =
        formatConfidence(
            confidence
        );


    // Reset class values

    document.getElementById(
        "smash"
    ).textContent = "--";


    document.getElementById(
        "clear"
    ).textContent = "--";


    document.getElementById(
        "drop"
    ).textContent = "--";


    document.getElementById(
        "drive"
    ).textContent = "--";


    document.getElementById(
        "net"
    ).textContent = "--";


    // Display predicted shot

    const shot =
        String(
            predictedShot
        )
        .trim()
        .toLowerCase();


    if (
        shot === "smash"
    ) {

        document.getElementById(
            "smash"
        ).textContent =
            formatConfidence(
                confidence
            );

    }


    else if (
        shot === "clear"
    ) {

        document.getElementById(
            "clear"
        ).textContent =
            formatConfidence(
                confidence
            );

    }


    else if (
        shot === "drop"
    ) {

        document.getElementById(
            "drop"
        ).textContent =
            formatConfidence(
                confidence
            );

    }


    else if (
        shot === "drive"
    ) {

        document.getElementById(
            "drive"
        ).textContent =
            formatConfidence(
                confidence
            );

    }


    else if (
        shot === "net shot"
    ) {

        document.getElementById(
            "net"
        ).textContent =
            formatConfidence(
                confidence
            );

    }


    console.log(
        "Prediction displayed:",
        predictedShot
    );

}


// ============================================================
// DISPLAY ANALYTICS
// ============================================================

function displayAnalytics(result) {

    console.log(
        "Displaying analytics:",
        result.analytics
    );


    const analytics =
        result.analytics;


    if (!analytics) {

        console.warn(
            "No analytics returned."
        );

        return;

    }


    // ========================================================
    // FREQUENCY
    // ========================================================

    const frequency =
        analytics.shot_frequency || {};


    document.getElementById(
        "frequency-smash"
    ).textContent =
        frequency["Smash"] ?? 0;


    document.getElementById(
        "frequency-clear"
    ).textContent =
        frequency["Clear"] ?? 0;


    document.getElementById(
        "frequency-drop"
    ).textContent =
        frequency["Drop"] ?? 0;


    document.getElementById(
        "frequency-drive"
    ).textContent =
        frequency["Drive"] ?? 0;


    document.getElementById(
        "frequency-net"
    ).textContent =
        frequency["Net Shot"] ?? 0;


    // ========================================================
    // DISTRIBUTION
    // ========================================================

    const distribution =
        analytics.shot_distribution || {};


    const smash =
        Number(
            distribution["Smash"] ?? 0
        );


    const clear =
        Number(
            distribution["Clear"] ?? 0
        );


    const drop =
        Number(
            distribution["Drop"] ?? 0
        );


    const drive =
        Number(
            distribution["Drive"] ?? 0
        );


    const net =
        Number(
            distribution["Net Shot"] ?? 0
        );


    // Text

    document.getElementById(
        "distribution-smash"
    ).textContent =
        `${smash.toFixed(2)}%`;


    document.getElementById(
        "distribution-clear"
    ).textContent =
        `${clear.toFixed(2)}%`;


    document.getElementById(
        "distribution-drop"
    ).textContent =
        `${drop.toFixed(2)}%`;


    document.getElementById(
        "distribution-drive"
    ).textContent =
        `${drive.toFixed(2)}%`;


    document.getElementById(
        "distribution-net"
    ).textContent =
        `${net.toFixed(2)}%`;


    // Bars

    document.getElementById(
        "bar-smash"
    ).style.width =
        `${smash}%`;


    document.getElementById(
        "bar-clear"
    ).style.width =
        `${clear}%`;


    document.getElementById(
        "bar-drop"
    ).style.width =
        `${drop}%`;


    document.getElementById(
        "bar-drive"
    ).style.width =
        `${drive}%`;


    document.getElementById(
        "bar-net"
    ).style.width =
        `${net}%`;


    // ========================================================
    // SEQUENCE
    // ========================================================

    const sequence =
        analytics.shot_sequence || [];


    const sequenceElement =
        document.getElementById(
            "shotSequence"
        );


    if (
        sequence.length === 0
    ) {

        sequenceElement.textContent =
            "No shot sequence detected.";

    }

    else {

        sequenceElement.textContent =
            sequence.join(
                " → "
            );

    }


    // ========================================================
    // COMBINATIONS
    // ========================================================

    const combinations =
        analytics.shot_combinations || {};


    const twoShot =
        combinations["2_shot"] || [];


    const threeShot =
        combinations["3_shot"] || [];


    const combinationsElement =
        document.getElementById(
            "shotCombinations"
        );


    let combinationHTML = "";


    if (
        twoShot.length > 0
    ) {

        combinationHTML +=
            "<strong>2-shot patterns:</strong><br>";


        twoShot.forEach(
            function (item) {

                combinationHTML +=
                    `${item.pattern} `
                    + `(${item.count})<br>`;

            }
        );

    }


    if (
        threeShot.length > 0
    ) {

        combinationHTML +=
            "<br>"
            + "<strong>3-shot patterns:</strong><br>";


        threeShot.forEach(
            function (item) {

                combinationHTML +=
                    `${item.pattern} `
                    + `(${item.count})<br>`;

            }
        );

    }


    if (
        combinationHTML === ""
    ) {

        combinationHTML =
            "No shot combinations detected.";

    }


    combinationsElement.innerHTML =
        combinationHTML;


    console.log(
        "Analytics displayed."
    );

}


// ============================================================
// ANALYZE VIDEO
// ============================================================

analyzeBtn.addEventListener(
    "click",
    async function () {

        console.log(
            "🔥 ANALYZE BUTTON CLICKED 🔥"
        );


        // ====================================================
        // CHECK FILE
        // ====================================================

        if (!selectedVideo) {

            console.error(
                "No video selected."
            );


            alert(
                "Please select a badminton video first."
            );


            return;

        }


        console.log(
            "Video ready:",
            selectedVideo.name
        );


        // ====================================================
        // DISABLE BUTTON
        // ====================================================

        analyzeBtn.disabled =
            true;


        analyzeBtn.textContent =
            "⏳ Analyzing...";


        // ====================================================
        // CREATE FORMDATA
        // ====================================================

        const formData =
            new FormData();


        formData.append(
            "file",
            selectedVideo
        );


        console.log(
            "FormData created."
        );


        console.log(
            "FormData file:",
            formData.get("file")
        );


        // ====================================================
        // REQUEST
        // ====================================================

        console.log(
            "=========================================="
        );


        console.log(
            "MODEL 2 REQUEST"
        );


        console.log(
            "File:",
            selectedVideo.name
        );


        console.log(
            "Type:",
            selectedVideo.type
        );


        console.log(
            "Size:",
            selectedVideo.size
        );


        console.log(
            "Endpoint:",
            PREDICT_URL
        );


        console.log(
            "=========================================="
        );


        try {

            console.log(
                "🚀 FETCH STARTING..."
            );


            const response =
                await fetch(
                    PREDICT_URL,
                    {
                        method: "POST",
                        body: formData
                    }
                );


            console.log(
                "🚨 FETCH FINISHED 🚨"
            );


            console.log(
                "HTTP status:",
                response.status
            );


            console.log(
                "HTTP status text:",
                response.statusText
            );


            const responseText =
                await response.text();


            console.log(
                "Raw backend response:"
            );


            console.log(
                responseText
            );


            if (
                !response.ok
            ) {

                let errorMessage =
                    `HTTP ${response.status}`;


                try {

                    const errorJSON =
                        JSON.parse(
                            responseText
                        );


                    errorMessage +=
                        "\n"
                        + JSON.stringify(
                            errorJSON,
                            null,
                            2
                        );

                }

                catch {

                    errorMessage +=
                        "\n"
                        + responseText;

                }


                throw new Error(
                    errorMessage
                );

            }


            // =================================================
            // PARSE JSON
            // =================================================

            const result =
                JSON.parse(
                    responseText
                );


            console.log(
                "========== MODEL 2 RESULT =========="
            );


            console.log(
                result
            );


            // =================================================
            // UPDATE FRONTEND
            // =================================================

            displayPrediction(
                result
            );


            displayAnalytics(
                result
            );


            console.log(
                "========== FRONTEND UPDATED =========="
            );


        }

        catch (error) {

            console.error(
                "❌ MODEL 2 REQUEST ERROR ❌"
            );


            console.error(
                error
            );


            alert(
                "Model 2 request failed.\n\n"
                + error.message
            );

        }


        finally {

            analyzeBtn.disabled =
                false;


            analyzeBtn.textContent =
                "▶ Analyze Video";

        }

    }
);


// ============================================================
// FINAL LOAD MESSAGE
// ============================================================

console.log(
    "Ready. Select a video and click Analyze Video."
);