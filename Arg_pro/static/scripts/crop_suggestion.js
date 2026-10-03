
/* ============================================================
   SNAP-HEAL
   SMART CROP RECOMMENDATION
   VOICE INPUT + TEXT TO SPEECH
   ============================================================ */


/* ============================================================
   GLOBAL VARIABLES
   ============================================================ */

let selectedLang = "en-IN";

let recognition = null;

let isListening = false;

let currentVoiceInput = null;

let currentMicButton = null;


/* ============================================================
   LANGUAGE PROMPTS
   ============================================================ */

const prompts = {

    "en-IN": {

        soilType:
            "Please tell me your soil type.",

        soilPh:
            "Please tell me the soil pH value.",

        organicCarbon:
            "Please tell me the organic carbon value in your soil.",

        location:
            "Please tell me your farm location or village name.",

        pincode:
            "Please tell me your farm pincode.",

        farmArea:
            "Please tell me your farm area.",

        irrigation:
            "Please tell me your irrigation type.",

        waterSource:
            "Please tell me your water source.",

        plantingDate:
            "When are you planning to plant the crop?",

        previousCrop:
            "Please tell me which crop you cultivated previously.",

        desiredCrop:
            "Which crop would you like to cultivate?",

        success:
            "Your farm details are ready. Please review them before saving."

    },


    "te-IN": {

        soilType:
            "మీ పొలంలో నేల రకం ఏమిటో చెప్పండి.",

        soilPh:
            "మీ నేల pH విలువ ఎంత ఉందో చెప్పండి.",

        organicCarbon:
            "మీ నేలలో సేంద్రీయ కార్బన్ విలువ ఎంత ఉందో చెప్పండి.",

        location:
            "మీ పొలం ఉన్న ప్రాంతం లేదా గ్రామం పేరు చెప్పండి.",

        pincode:
            "మీ పొలం పిన్‌కోడ్ చెప్పండి.",

        farmArea:
            "మీ పొలం విస్తీర్ణం ఎంత ఉందో చెప్పండి.",

        irrigation:
            "మీ పొలంలో ఏ రకమైన నీటిపారుదల సౌకర్యం ఉంది?",

        waterSource:
            "మీ పొలానికి నీటి వనరు ఏమిటి?",

        plantingDate:
            "మీరు పంటను ఎప్పుడు నాటాలని అనుకుంటున్నారు?",

        previousCrop:
            "మీరు గతంలో ఏ పంటను సాగు చేశారు?",

        desiredCrop:
            "మీరు ఏ పంటను సాగు చేయాలనుకుంటున్నారు?",

        success:
            "మీ వ్యవసాయ వివరాలు సిద్ధంగా ఉన్నాయి. సేవ్ చేయడానికి ముందు వాటిని పరిశీలించండి."

    },


    "hi-IN": {

        soilType:
            "कृपया अपने खेत की मिट्टी का प्रकार बताएं।",

        soilPh:
            "कृपया अपनी मिट्टी का pH मान बताएं।",

        organicCarbon:
            "कृपया अपनी मिट्टी में जैविक कार्बन का मान बताएं।",

        location:
            "कृपया अपने खेत का स्थान या गांव का नाम बताएं।",

        pincode:
            "कृपया अपने खेत का पिनकोड बताएं।",

        farmArea:
            "कृपया अपने खेत का क्षेत्रफल बताएं।",

        irrigation:
            "आपके खेत में किस प्रकार की सिंचाई की सुविधा है?",

        waterSource:
            "आपके खेत का पानी का स्रोत क्या है?",

        plantingDate:
            "आप फसल की बुवाई कब करने की योजना बना रहे हैं?",

        previousCrop:
            "आपने पिछली बार कौन सी फसल उगाई थी?",

        desiredCrop:
            "आप कौन सी फसल उगाना चाहते हैं?",

        success:
            "आपके खेत की जानकारी तैयार है। सेव करने से पहले कृपया जानकारी जांच लें।"

    }

};


/* ============================================================
   INITIALIZE
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "🌱 Snap-Heal Crop Recommendation JS loaded"
        );


        /* --------------------------------------------------------
           LANGUAGE SELECT
        -------------------------------------------------------- */

        const langSelect =
            document.getElementById(
                "langSelect"
            );


        if (langSelect) {

            selectedLang =
                langSelect.value || "en-IN";


            console.log(
                "🌐 Initial language:",
                selectedLang
            );


            langSelect.addEventListener(
                "change",
                function () {

                    selectedLang =
                        this.value || "en-IN";


                    const languageInput =
                        document.getElementById(
                            "languageInput"
                        );


                    if (languageInput) {

                        languageInput.value =
                            selectedLang;

                    }


                    console.log(
                        "🌐 Language changed:",
                        selectedLang
                    );

                }
            );

        }


        /* --------------------------------------------------------
           INITIALIZE SPEECH RECOGNITION
        -------------------------------------------------------- */

        initializeSpeechRecognition();


        /* --------------------------------------------------------
           INITIALIZE MICROPHONE BUTTONS
        -------------------------------------------------------- */

        initializeMicrophoneButtons();


        /* --------------------------------------------------------
           INITIALIZE SAVE BUTTON
        -------------------------------------------------------- */

        initializeSaveButton();

    }
);


/* ============================================================
   SPEECH RECOGNITION INITIALIZATION
   ============================================================ */

function initializeSpeechRecognition() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        console.error(
            "❌ Speech Recognition is not supported."
        );


        showStatus(
            "⚠️ Speech recognition is not supported in this browser."
        );


        return;

    }


    recognition =
        new SpeechRecognition();


    recognition.continuous = false;

    recognition.interimResults = false;

    recognition.maxAlternatives = 1;


    /* --------------------------------------------------------
       START
    -------------------------------------------------------- */

    recognition.onstart =
        function () {

            isListening = true;


            console.log(
                "🎙️ Microphone listening..."
            );


            updateMicButtonState(
                true
            );


            showStatus(
                "🎙️ Listening... Please speak now."
            );

        };


    /* --------------------------------------------------------
       RESULT
    -------------------------------------------------------- */

    recognition.onresult =
        function (event) {

            console.log(
                "🎤 Speech result received:",
                event
            );


            if (
                !event.results ||
                !event.results.length
            ) {

                console.warn(
                    "⚠️ No speech result."
                );

                return;

            }


            const transcript =
                event.results[0][0]
                    .transcript
                    .trim();


            console.log(
                "🎤 User said:",
                transcript
            );


            if (!transcript) {

                showStatus(
                    "⚠️ I could not understand your speech. Please try again."
                );

                return;

            }


            /* ------------------------------------------------
               FIND CURRENT INPUT
            ------------------------------------------------ */

            if (currentVoiceInput) {

                const input =
                    document.getElementById(
                        currentVoiceInput
                    );


                if (input) {

                    input.value =
                        transcript;


                    input.dispatchEvent(
                        new Event(
                            "input",
                            {
                                bubbles: true
                            }
                        )
                    );


                    input.dispatchEvent(
                        new Event(
                            "change",
                            {
                                bubbles: true
                            }
                        )
                    );


                    console.log(
                        "✅ Transcript inserted into:",
                        currentVoiceInput
                    );


                    showStatus(
                        "✅ " + transcript
                    );

                }

                else {

                    console.error(
                        "❌ Input element not found:",
                        currentVoiceInput
                    );

                }

            }

            else {

                console.warn(
                    "⚠️ No current voice input selected."
                );

            }


            isListening = false;


            updateMicButtonState(
                false
            );

        };


    /* --------------------------------------------------------
       ERROR
    -------------------------------------------------------- */

    recognition.onerror =
        function (event) {

            isListening = false;


            updateMicButtonState(
                false
            );


            console.error(
                "❌ Speech recognition error:",
                event.error
            );


            let message =
                "Voice recognition failed.";


            switch (
                event.error
            ) {

                case "not-allowed":

                    message =
                        "Please allow microphone permission in your browser.";

                    break;


                case "service-not-allowed":

                    message =
                        "Speech recognition service is not allowed.";

                    break;


                case "no-speech":

                    message =
                        "I could not hear you. Please speak again.";

                    break;


                case "audio-capture":

                    message =
                        "No microphone was detected.";

                    break;


                case "network":

                    message =
                        "Speech recognition needs an internet connection.";

                    break;


                case "aborted":

                    message =
                        "Voice input was stopped.";

                    break;


                default:

                    message =
                        "Voice recognition failed. Please try again.";

            }


            showStatus(
                "⚠️ " + message
            );

        };


    /* --------------------------------------------------------
       END
    -------------------------------------------------------- */

    recognition.onend =
        function () {

            isListening = false;


            updateMicButtonState(
                false
            );


            console.log(
                "🎙️ Listening stopped"
            );

        };

}


/* ============================================================
   MICROPHONE BUTTON INITIALIZATION
   ============================================================ */

function initializeMicrophoneButtons() {

    const micButtons =
        document.querySelectorAll(
            ".mic-btn"
        );


    console.log(
        "🎙️ Microphone buttons found:",
        micButtons.length
    );


    if (!micButtons.length) {

        console.error(
            "❌ No .mic-btn elements found."
        );


        return;

    }


    micButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    event.stopPropagation();


                    const inputId =
                        button.dataset.field;


                    console.log(
                        "🎙️ Microphone clicked:",
                        inputId
                    );


                    if (!inputId) {

                        console.error(
                            "❌ data-field is missing."
                        );


                        return;

                    }


                    const input =
                        document.getElementById(
                            inputId
                        );


                    if (!input) {

                        console.error(
                            "❌ Input not found:",
                            inputId
                        );


                        return;

                    }


                    currentMicButton =
                        button;


                    activateBlockVoice(
                        inputId,
                        inputId,
                        "statusBox"
                    );

                }
            );

        }
    );

}


/* ============================================================
   ACTIVATE VOICE FOR FIELD
   ============================================================ */

function activateBlockVoice(
    inputId,
    promptKey,
    statusId
) {

    selectedLang =
        document.getElementById(
            "langSelect"
        )?.value || "en-IN";


    currentVoiceInput =
        inputId;


    console.log(
        "🎙️ Activating voice:",
        {
            inputId,
            promptKey,
            selectedLang
        }
    );


    const input =
        document.getElementById(
            inputId
        );


    const status =
        document.getElementById(
            statusId
        );


    if (!input) {

        console.error(
            "❌ Input not found:",
            inputId
        );


        return;

    }


    if (!recognition) {

        alert(
            "Voice recognition is not supported in this browser."
        );


        return;

    }


    /* --------------------------------------------------------
       GET QUESTION
    -------------------------------------------------------- */

    const question =
        prompts[selectedLang]?.[promptKey] ||
        prompts["en-IN"]?.[promptKey];


    if (!question) {

        console.error(
            "❌ Voice prompt not found:",
            promptKey
        );


        return;

    }


    /* --------------------------------------------------------
       SHOW STATUS
    -------------------------------------------------------- */

    if (status) {

        status.textContent =
            "🔊 " + question;

    }


    /* --------------------------------------------------------
       STOP EXISTING RECOGNITION
    -------------------------------------------------------- */

    if (isListening) {

        try {

            recognition.stop();

        }

        catch (error) {

            console.warn(
                "Recognition stop warning:",
                error
            );

        }

    }


    /* --------------------------------------------------------
       SPEAK QUESTION
    -------------------------------------------------------- */

    speakText(
        question,
        selectedLang,
        function () {

            console.log(
                "🔊 Question finished."
            );


            /* -----------------------------------------------
               START LISTENING
            ----------------------------------------------- */

            startRecognition(
                inputId
            );

        }
    );

}


/* ============================================================
   START SPEECH RECOGNITION
   ============================================================ */

function startRecognition(
    inputId
) {

    if (!recognition) {

        console.error(
            "❌ Recognition is not initialized."
        );


        return;

    }


    currentVoiceInput =
        inputId;


    selectedLang =
        document.getElementById(
            "langSelect"
        )?.value || "en-IN";


    recognition.lang =
        selectedLang;


    console.log(
        "🎙️ Starting recognition:",
        {
            inputId,
            language: selectedLang
        }
    );


    try {

        recognition.start();

    }

    catch (error) {

        console.warn(
            "⚠️ Recognition could not start:",
            error
        );


        /*
         * Chrome can throw InvalidStateError
         * if recognition is already running.
         */

        if (
            error.name ===
            "InvalidStateError"
        ) {

            try {

                recognition.stop();

            }

            catch (stopError) {

                console.warn(
                    stopError
                );

            }


            setTimeout(
                function () {

                    try {

                        recognition.start();

                    }

                    catch (retryError) {

                        console.error(
                            "❌ Recognition retry failed:",
                            retryError
                        );

                    }

                },
                300
            );

        }

    }

}


/* ============================================================
   TEXT TO SPEECH
   ============================================================ */

function speakText(
    text,
    language,
    callback
) {

    if (
        !window.speechSynthesis
    ) {

        console.warn(
            "⚠️ Speech synthesis not supported."
        );


        showStatus(
            "⚠️ Text-to-speech is not supported in this browser."
        );


        if (callback) {

            callback();

        }


        return;

    }


    if (!text) {

        console.warn(
            "⚠️ Empty speech text."
        );


        if (callback) {

            callback();

        }


        return;

    }


    console.log(
        "🔊 Speaking:",
        text,
        language
    );


    /* --------------------------------------------------------
       STOP PREVIOUS SPEECH
    -------------------------------------------------------- */

    window.speechSynthesis.cancel();


    /* --------------------------------------------------------
       CREATE UTTERANCE
    -------------------------------------------------------- */

    const utterance =
        new SpeechSynthesisUtterance(
            text
        );


    utterance.lang =
        language;


    utterance.rate =
        0.9;


    utterance.pitch =
        1;


    utterance.volume =
        1;


    /* --------------------------------------------------------
       FIND BEST VOICE
    -------------------------------------------------------- */

    const voices =
        window.speechSynthesis.getVoices();


    console.log(
        "🔊 Available voices:",
        voices.length
    );


    const languagePrefix =
        language.split("-")[0];


    let selectedVoice =
        voices.find(
            function (voice) {

                return (
                    voice.lang === language
                );

            }
        );


    if (!selectedVoice) {

        selectedVoice =
            voices.find(
                function (voice) {

                    return (
                        voice.lang &&
                        voice.lang.startsWith(
                            languagePrefix
                        )
                    );

                }
            );

    }


    if (selectedVoice) {

        utterance.voice =
            selectedVoice;


        console.log(
            "🔊 Selected voice:",
            selectedVoice.name,
            selectedVoice.lang
        );

    }

    else {

        console.warn(
            "⚠️ No matching voice found for:",
            language
        );

    }


    /* --------------------------------------------------------
       SPEECH START
    -------------------------------------------------------- */

    utterance.onstart =
        function () {

            console.log(
                "🔊 Speech started"
            );

        };


    /* --------------------------------------------------------
       SPEECH END
    -------------------------------------------------------- */

    utterance.onend =
        function () {

            console.log(
                "🔊 Speech ended"
            );


            if (callback) {

                callback();

            }

        };


    /* --------------------------------------------------------
       SPEECH ERROR
    -------------------------------------------------------- */

    utterance.onerror =
        function (event) {

            console.error(
                "❌ Speech synthesis error:",
                event.error
            );


            /*
             * Even if TTS fails, continue
             * to microphone recognition.
             */

            if (callback) {

                setTimeout(
                    function () {

                        callback();

                    },
                    200
                );

            }

        };


    /* --------------------------------------------------------
       SPEAK
    -------------------------------------------------------- */

    try {

        window.speechSynthesis.speak(
            utterance
        );

    }

    catch (error) {

        console.error(
            "❌ Could not start speech:",
            error
        );


        if (callback) {

            callback();

        }

    }

}


/* ============================================================
   LOAD VOICES
   ============================================================ */

if (
    window.speechSynthesis
) {

    window.speechSynthesis.onvoiceschanged =
        function () {

            const voices =
                window.speechSynthesis.getVoices();


            console.log(
                "🔊 Voices loaded:",
                voices.length
            );

        };

}


/* ============================================================
   LADY SPEAK COMPATIBILITY
   ============================================================ */

function ladySpeak(
    text,
    callback
) {

    speakText(
        text,
        selectedLang,
        callback
    );

}


/* ============================================================
   SHOW STATUS
   ============================================================ */

function showStatus(
    message
) {

    const status =
        document.getElementById(
            "statusBox"
        );


    if (status) {

        status.textContent =
            message;

    }

}


/* ============================================================
   MICROPHONE BUTTON UI
   ============================================================ */

function updateMicButtonState(
    listening
) {

    const buttons =
        document.querySelectorAll(
            ".mic-btn"
        );


    buttons.forEach(
        function (button) {

            if (listening) {

                if (
                    button ===
                    currentMicButton
                ) {

                    button.classList.add(
                        "listening"
                    );


                    button.textContent =
                        "🔴";

                }

            }

            else {

                button.classList.remove(
                    "listening"
                );


                button.textContent =
                    "🎙️";

            }

        }
    );

}


/* ============================================================
   SAVE BUTTON
   ============================================================ */

function initializeSaveButton() {

    const saveBtn =
        document.getElementById(
            "saveBtn"
        );


    const form =
        document.getElementById(
            "cropForm"
        );


    if (!saveBtn) {

        console.error(
            "❌ saveBtn not found."
        );


        return;

    }


    if (!form) {

        console.error(
            "❌ cropForm not found."
        );


        return;

    }


    saveBtn.addEventListener(
        "click",
        function (event) {

            event.preventDefault();


            console.log(
                "🌱 SMART CROP RECOMMENDATION CLICKED"
            );


            selectedLang =
                document.getElementById(
                    "langSelect"
                )?.value || "en-IN";


            /* ------------------------------------------------
               UPDATE LANGUAGE HIDDEN FIELD
            ------------------------------------------------ */

            const languageInput =
                document.getElementById(
                    "languageInput"
                );


            if (languageInput) {

                languageInput.value =
                    selectedLang;

            }


            /* ------------------------------------------------
               GET FORM VALUES
            ------------------------------------------------ */

            const data = {

                soilType:
                    getValue("soilType"),

                soilPh:
                    getValue("soilPh"),

                organicCarbon:
                    getValue("organicCarbon"),

                location:
                    getValue("location"),

                pincode:
                    getValue("pincode"),

                farmArea:
                    getValue("farmArea"),

                irrigation:
                    getValue("irrigation"),

                waterSource:
                    getValue("waterSource"),

                plantingDate:
                    getValue("plantingDate"),

                previousCrop:
                    getValue("previousCrop"),

                desiredCrop:
                    getValue("desiredCrop")

            };


            console.log(
                "🌱 FORM DATA:",
                data
            );


            /* ------------------------------------------------
               REQUIRED FIELDS
            ------------------------------------------------ */

            const requiredFields = [

                "soilType",

                "soilPh",

                "organicCarbon",

                "location",

                "pincode",

                "farmArea",

                "irrigation",

                "waterSource",

                "plantingDate",

                "previousCrop"

            ];


            let missingField =
                false;


            for (
                const field
                of requiredFields
            ) {

                if (
                    !data[field]
                ) {

                    missingField =
                        true;


                    const element =
                        document.getElementById(
                            field
                        );


                    if (element) {

                        element.focus();

                    }


                    break;

                }

            }


            /* ------------------------------------------------
               VALIDATION
            ------------------------------------------------ */

            if (missingField) {

                const message =
                    getValidationMessage(
                        selectedLang
                    );


                showStatus(
                    "⚠️ " + message
                );


                speakText(
                    message,
                    selectedLang
                );


                alert(
                    message
                );


                return;

            }


            /* ------------------------------------------------
               FINAL SPEECH
            ------------------------------------------------ */

            const successText =
                prompts[selectedLang]?.success ||
                prompts["en-IN"].success;


            speakText(
                successText,
                selectedLang,
                function () {

                    console.log(
                        "🔊 FINAL SPEECH FINISHED"
                    );


                    showSaveConfirmation();

                }
            );

        }
    );

}


/* ============================================================
   GET INPUT VALUE
   ============================================================ */

function getValue(
    id
) {

    const element =
        document.getElementById(
            id
        );


    if (!element) {

        return "";

    }


    return element.value.trim();

}


/* ============================================================
   SAVE CONFIRMATION
   ============================================================ */

function showSaveConfirmation() {

    const messages = {

        "en-IN":
            "🌱 Are you sure you want to save these farm details?",

        "te-IN":
            "🌱 ఈ వ్యవసాయ వివరాలను సేవ్ చేయాలనుకుంటున్నారా?",

        "hi-IN":
            "🌱 क्या आप इन खेत की जानकारी को सेव करना चाहते हैं?"

    };


    const message =
        messages[selectedLang] ||
        messages["en-IN"];


    /*
     * OK     → Save
     * Cancel → Do nothing
     */

    const confirmed =
        window.confirm(
            message
        );


    if (confirmed) {

        submitCropForm();

    }

    else {

        console.log(
            "❌ User cancelled save."
        );

    }

}


/* ============================================================
   SUBMIT FORM
   ============================================================ */

function submitCropForm() {

    const form =
        document.getElementById(
            "cropForm"
        );


    if (!form) {

        console.error(
            "❌ Crop form not found."
        );


        return;

    }


    console.log(
        "✅ User confirmed. Submitting form..."
    );


    /*
     * ONLY HERE THE FORM IS SUBMITTED.
     */

    form.submit();

}


/* ============================================================
   VALIDATION MESSAGE
   ============================================================ */

function getValidationMessage(
    language
) {

    const messages = {

        "en-IN":
            "Please complete all required fields before continuing.",

        "te-IN":
            "కొనసాగించే ముందు దయచేసి అన్ని అవసరమైన వివరాలను నమోదు చేయండి.",

        "hi-IN":
            "आगे बढ़ने से पहले कृपया सभी आवश्यक जानकारी दर्ज करें।"

    };


    return (
        messages[language] ||
        messages["en-IN"]
    );

}


/* ============================================================
   BUILD SUMMARY
   ============================================================ */

function buildSummary(
    language,
    data
) {

    if (
        language === "te-IN"
    ) {

        return (

            "మీ వ్యవసాయ వివరాలు సిద్ధంగా ఉన్నాయి. " +

            "నేల రకం: " +
            data.soilType +

            ", pH: " +
            data.soilPh +

            ", సేంద్రీయ కార్బన్: " +
            data.organicCarbon +

            ", ప్రాంతం: " +
            data.location +

            ", పిన్‌కోడ్: " +
            data.pincode +

            ", పొలం విస్తీర్ణం: " +
            data.farmArea +

            ", నీటిపారుదల: " +
            data.irrigation +

            ", నీటి వనరు: " +
            data.waterSource +

            ", నాటే తేదీ: " +
            data.plantingDate +

            ", గత పంట: " +
            data.previousCrop +

            ", కావలసిన పంట: " +

            (
                data.desiredCrop ||
                "ఏదైనా సరైన పంట"
            )

        );

    }


    if (
        language === "hi-IN"
    ) {

        return (

            "आपके खेत की जानकारी तैयार है। " +

            "मिट्टी का प्रकार: " +
            data.soilType +

            ", pH: " +
            data.soilPh +

            ", जैविक कार्बन: " +
            data.organicCarbon +

            ", स्थान: " +
            data.location +

            ", पिनकोड: " +
            data.pincode +

            ", खेत का क्षेत्रफल: " +
            data.farmArea +

            ", सिंचाई: " +
            data.irrigation +

            ", पानी का स्रोत: " +
            data.waterSource +

            ", बुवाई की तारीख: " +
            data.plantingDate +

            ", पिछली फसल: " +
            data.previousCrop +

            ", वांछित फसल: " +

            (
                data.desiredCrop ||
                "कोई उपयुक्त फसल"
            )

        );

    }


    return (

        "Your farm information is ready. " +

        "Soil type: " +
        data.soilType +

        ", pH: " +
        data.soilPh +

        ", organic carbon: " +
        data.organicCarbon +

        ", location: " +
        data.location +

        ", pincode: " +
        data.pincode +

        ", farm area: " +
        data.farmArea +

        ", irrigation: " +
        data.irrigation +

        ", water source: " +
        data.waterSource +

        ", planting date: " +
        data.plantingDate +

        ", previous crop: " +
        data.previousCrop +

        ", desired crop: " +

        (
            data.desiredCrop ||
            "any suitable crop"
        )

    );

}


/* ============================================================
   DEBUG HELPER
   ============================================================ */

console.log(
    "🌱 Snap-Heal voice module ready."
);
