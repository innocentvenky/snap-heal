
console.log("MAIN_HOME.JS LOADED");


// ============================================================
// PROMPTS
// ============================================================

const prompts = {

    "en-IN": {
        welcome: "Welcome to Snap Heal, your digital crop doctor. Farmers are the backbone of our nation, and we are here to support you.",
        cropName: "What is the name of your crop?",
        askAge: "What is the current age of your crop?",
        askLoc: "Which village or district is your farm located in?",
        askProb: "Please describe the problem or bugs you see on your crop.",
        success: "Thank you! All your details have been captured successfully.",
        listeningName: "🎙️ Listening for Crop Name...",
        listeningAge: "🎙️ Listening for Crop Age...",
        listeningLoc: "🎙️ Listening for Location...",
        listeningProb: "🎙️ Listening for Problem...",
        paused: "⌨️ Typing detected. Voice paused."
    },

    "te-IN": {
        welcome: "స్నాప్ హీల్ డిజిటల్ పంట వైద్యునికి స్వాగతం. రైతే రాజు, మీ కష్టానికి తగిన ప్రతిఫలం అందించడమే మా లక్ష్యం.",
        cropName: "మీ పంట పేరు ఏమిటి?",
        askAge: "మీ పంట వయస్సు ఎన్ని రోజులు లేదా వారాలు?",
        askLoc: "మీ పొలం ఏ గ్రామం లేదా జిల్లాలో ఉంది?",
        askProb: "మీ పంటకు వచ్చిన తెగులు లేదా సమస్య గురించి వివరించండి.",
        success: "ధన్యవాదాలు! మీ వివరాలు విజయవంతంగా నమోదయ్యాయి.",
        listeningName: "🎙️ పంట పేరు కోసం వింటోంది...",
        listeningAge: "🎙️ పంట వయస్సు కోసం వింటోంది...",
        listeningLoc: "🎙️ ప్రాంతం లేదా గ్రామం కోసం వింటోంది...",
        listeningProb: "🎙️ పంట సమస్య కోసం వింటోంది...",
        paused: "⌨️ మీరు టైప్ చేస్తున్నారు."
    },

    "hi-IN": {
        welcome:"स्नैप हील डिजिटल फसल डॉक्टर में आपका स्वागत है। किसान हमारे देश की शान हैं, और हम आपकी हर कदम पर मदद करेंगे।",
        cropName: "आपकी फसल का नाम क्या है?",
        askAge: "आपकी फसल कितने दिन या हफ्तों की है?",
        askLoc: "आपका खेत किस गांव या जिले में स्थित है?",
        askProb: "अपनी फसल की समस्या या कीड़ों के बारे में बताएं।",
        success: "धन्यवाद! आपकी जानकारी सफलतापूर्वक दर्ज कर ली गई है।",
        listeningName: "🎙️ फसल का नाम सुन रहा हूँ...",
        listeningAge: "🎙️ फसल की उम्र सुन रहा हूँ...",
        listeningLoc: "🎙️ स्थान या गाँव सुन रहा हूँ...",
        listeningProb: "🎙️ फसल की समस्या सुन रहा हूँ...",
        paused: "⌨️ टाइपिंग मोड चालू है।"
    }

};


// ============================================================
// SPEECH API
// ============================================================

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition ;


let recognition = null;

if (SpeechRecognition) {

    recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;

} else {

    console.error("Speech Recognition not supported.");

}


// ============================================================
// SPEECH SYNTHESIS
// ============================================================

const synth = window.speechSynthesis;

let selectedLang = "en-IN";


// ============================================================
// ACTIVE VOICE FIELD
// ============================================================

let activeTargetId = null;
let activeButtonElement = null;


// ============================================================
// STATUS
// ============================================================

function setStatus(message) {

    const statusBox =
        document.getElementById("statusBox");

    if (statusBox) {

        statusBox.innerText = message;

    }

}


// ============================================================
// TEXT TO SPEECH
// ============================================================

function ladySpeak(text, callback) {

    console.log("Speaking:", text);

    synth.cancel();

    const utterance =
        new SpeechSynthesisUtterance(text);

    utterance.lang = selectedLang;

    utterance.rate = 0.95;

    utterance.pitch = 1.1;


    utterance.onend = function () {

        console.log("Speech finished");

        if (callback) {

            callback();

        }

    };


    utterance.onerror = function (event) {

        console.error(
            "Speech synthesis error:",
            event
        );

        if (callback) {

            callback();

        }

    };


    synth.speak(utterance);

}


// ============================================================
// LANGUAGE CHANGE
// ============================================================

const langSelect =
    document.getElementById("langSelect");


if (langSelect) {

    langSelect.addEventListener(
        "change",
        function () {

            selectedLang = this.value;

            console.log(
                "Language:",
                selectedLang
            );

            ladySpeak(
                prompts[selectedLang].welcome
            );

        }
    );

}


// ============================================================
// VOICE BUTTON
// ============================================================

function activateBlockVoice(
    targetInputId,
    speakPromptKey,
    statusListenKey
) {

    console.log(
        "Voice button clicked:",
        targetInputId
    );


    if (!recognition) {

        alert(
            "Voice recognition is not supported. Please use Chrome or Edge."
        );

        return;

    }


    selectedLang =
        document.getElementById("langSelect").value;


    const targetInput =
        document.getElementById(targetInputId);


    if (!targetInput) {

        console.error(
            "Target input not found:",
            targetInputId
        );

        return;

    }


    const clickedButton =
        targetInput.parentElement.querySelector(
            ".mic-btn"
        );


    // --------------------------------------------------------
    // STOP CURRENT RECOGNITION
    // --------------------------------------------------------

    if (activeTargetId === targetInputId) {

        console.log("Stopping recognition");

        recognition.abort();

        synth.cancel();

        resetMicButtons();

        return;

    }


    // --------------------------------------------------------
    // RESET
    // --------------------------------------------------------

    recognition.abort();

    synth.cancel();

    resetMicButtons();


    activeTargetId =
        targetInputId;

    activeButtonElement =
        clickedButton;


    recognition.lang =
        selectedLang;


    if (clickedButton) {

        clickedButton.innerText = "⏳";

    }


    setStatus("🤖 Speaking question...");


    // --------------------------------------------------------
    // SPEAK QUESTION
    // --------------------------------------------------------

    ladySpeak(
        prompts[selectedLang][speakPromptKey],
        function () {

            if (!activeTargetId) {

                return;

            }


            if (clickedButton) {

                clickedButton.classList.add(
                    "listening"
                );

                clickedButton.innerText = "🔴";

            }


            setStatus(
                prompts[selectedLang][statusListenKey]
            );


            try {

                recognition.start();

                console.log(
                    "Recognition started"
                );

            } catch (error) {

                console.error(
                    "Recognition start error:",
                    error
                );

            }

        }
    );

}


// ============================================================
// RECOGNITION RESULT
// ============================================================

if (recognition) {

    recognition.onresult = function (event) {

        console.log(
            "Speech result:",
            event
        );


        if (
            !event.results ||
            event.results.length === 0
        ) {

            return;

        }


        const spokenText =
            event.results[
                event.results.length - 1
            ][0].transcript.trim();


        console.log(
            "Recognized text:",
            spokenText
        );


        if (
            spokenText &&
            activeTargetId
        ) {

            const input =
                document.getElementById(
                    activeTargetId
                );


            if (input) {

                input.value =
                    spokenText;

            }

        }

    };


    recognition.onend = function () {

        console.log(
            "Recognition ended"
        );

        resetMicButtons();

    };


    recognition.onerror = function (event) {

        console.error(
            "Recognition error:",
            event.error
        );

        resetMicButtons();

    };

}


// ============================================================
// RESET MICROPHONE
// ============================================================

function resetMicButtons() {

    activeTargetId = null;


    if (activeButtonElement) {

        activeButtonElement.classList.remove(
            "listening"
        );

        activeButtonElement.innerText =
            "🎙️";

        activeButtonElement = null;

    }


    setStatus(
        "Tap the 🎙️ button next to any block to talk to Snap-Heal."
    );

}


// ============================================================
// STOP VOICE WHEN USER TYPES
// ============================================================

const inputs = [

    document.getElementById("cropName"),
    document.getElementById("cropAge"),
    document.getElementById("location"),
    document.getElementById("problem")

];


inputs.forEach(function (input) {

    if (!input) return;


    input.addEventListener(
        "input",
        function () {

            if (recognition) {

                recognition.abort();

            }

            synth.cancel();

            resetMicButtons();

        }
    );

});


// ============================================================
// SAVE BUTTON
// ============================================================

const saveBtn =
    document.getElementById("saveBtn");


if (saveBtn) {

    console.log(
        "SAVE BUTTON FOUND"
    );


    saveBtn.addEventListener(
        "click",
        function (event) {

            console.log(
                "SAVE BUTTON CLICKED"
            );


            // IMPORTANT:
            // Prevent browser default form submission
            event.preventDefault();


            selectedLang =
                document.getElementById(
                    "langSelect"
                ).value;


            const crop =
                document.getElementById(
                    "cropName"
                ).value.trim();


            const age =
                document.getElementById(
                    "cropAge"
                ).value.trim();


            const location =
                document.getElementById(
                    "location"
                ).value.trim();


            const problem =
                document.getElementById(
                    "problem"
                ).value.trim();


            console.log(
                "FORM DATA:",
                {
                    crop,
                    age,
                    location,
                    problem
                }
            );


            // ------------------------------------------------
            // VALIDATION
            // ------------------------------------------------

            if (
                !crop ||
                !age ||
                !location ||
                !problem
            ) {

                alert(
                    "⚠️ Please fill out all fields before saving."
                );

                return;

            }


            // ------------------------------------------------
            // SUCCESS MESSAGE
            // ------------------------------------------------

            const successText =
                prompts[selectedLang].success;


            console.log(
                "Success message:",
                successText
            );


            // ------------------------------------------------
            // SPEAK SUCCESS
            // ------------------------------------------------

            ladySpeak(
                successText,
                function () {

                    console.log(
                        "SUCCESS SPEECH FINISHED"
                    );


                    // THIS ALERT WILL NOW RUN
                    alert(
                        "🎉 Saved to Snap-Heal Database!\n\n" +
                        "Crop: " + crop +
                        "\nAge: " + age +
                        "\nLocation: " + location +
                        "\nProblem: " + problem
                    );


                    // ------------------------------------------------
                    // NOW SUBMIT TO DJANGO
                    // ------------------------------------------------

                    const form =
                        document.querySelector(
                            ".crop-form"
                        );


                    if (form) {

                        form.submit();

                    }

                }
            );

        }
    );

} else {

    console.error(
        "SAVE BUTTON NOT FOUND"
    );

}


// ============================================================
// PAGE LOAD
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "Snap-Heal main_home.js initialized"
        );

    }
);

