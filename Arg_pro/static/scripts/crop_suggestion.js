
let selectedLang = "en-IN";

let recognition = null;

let isListening = false;


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


        const langSelect =
            document.getElementById(
                "langSelect"
            );


        if (langSelect) {

            selectedLang =
                langSelect.value;


            langSelect.addEventListener(
                "change",
                function () {

                    selectedLang =
                        this.value;

                    console.log(
                        "Language:",
                        selectedLang
                    );

                }
            );

        }


        initializeSpeechRecognition();

        initializeSaveButton();

    }
);


/* ============================================================
   SPEECH RECOGNITION
============================================================ */

function initializeSpeechRecognition() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        console.warn(
            "Speech Recognition is not supported in this browser."
        );

        return;

    }


    recognition =
        new SpeechRecognition();


    recognition.continuous = false;

    recognition.interimResults = false;

    recognition.maxAlternatives = 1;


    recognition.onstart =
        function () {

            isListening = true;

            console.log(
                "🎙️ Listening..."
            );

        };


    recognition.onresult =
        function (event) {

            const transcript =
                event
                    .results[0][0]
                    .transcript
                    .trim();


            console.log(
                "🎤 User said:",
                transcript
            );


            if (
                window.currentVoiceInput
            ) {

                const input =
                    document.getElementById(
                        window.currentVoiceInput
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

                }

            }


            isListening = false;

        };


    recognition.onerror =
        function (event) {

            console.error(
                "Speech recognition error:",
                event.error
            );


            isListening = false;

        };


    recognition.onend =
        function () {

            isListening = false;

            console.log(
                "🎙️ Listening stopped"
            );

        };

}


/* ============================================================
   VOICE FIELD ACTIVATION
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
            "Input not found:",
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
       SAVE WHICH INPUT SHOULD RECEIVE THE ANSWER
    -------------------------------------------------------- */

    window.currentVoiceInput =
        inputId;


    /* --------------------------------------------------------
       GET QUESTION
    -------------------------------------------------------- */

    const question =
        prompts[selectedLang]?.[
            promptKey
        ] || prompts["en-IN"][promptKey];


    /* --------------------------------------------------------
       SHOW STATUS
    -------------------------------------------------------- */

    if (status) {

        status.textContent =
            "🎙️ " + question;

    }


    /* --------------------------------------------------------
       SPEAK QUESTION
    -------------------------------------------------------- */

    speakText(
        question,
        selectedLang,
        function () {

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

        return;

    }


    window.currentVoiceInput =
        inputId;


    recognition.lang =
        selectedLang;


    try {

        recognition.start();

        console.log(
            "🎙️ Started recognition:",
            selectedLang
        );

    }

    catch (error) {

        console.warn(
            "Recognition could not start:",
            error
        );

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

        if (callback) {

            callback();

        }

        return;

    }


    window.speechSynthesis.cancel();


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


    utterance.onend =
        function () {

            if (callback) {

                callback();

            }

        };


    utterance.onerror =
        function () {

            if (callback) {

                callback();

            }

        };


    window.speechSynthesis.speak(
        utterance
    );

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
            "❌ saveBtn not found"
        );

        return;

    }


    if (!form) {

        console.error(
            "❌ cropForm not found"
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


            /* ------------------------------------------------
               UPDATE LANGUAGE
            ------------------------------------------------ */

            selectedLang =
                document.getElementById(
                    "langSelect"
                )?.value || "en-IN";


            /* ------------------------------------------------
               GET FORM VALUES
            ------------------------------------------------ */

            const data = {

                soilType:
                    getValue(
                        "soilType"
                    ),

                soilPh:
                    getValue(
                        "soilPh"
                    ),

                organicCarbon:
                    getValue(
                        "organicCarbon"
                    ),

                location:
                    getValue(
                        "location"
                    ),

                pincode:
                    getValue(
                        "pincode"
                    ),

                farmArea:
                    getValue(
                        "farmArea"
                    ),

                irrigation:
                    getValue(
                        "irrigation"
                    ),

                waterSource:
                    getValue(
                        "waterSource"
                    ),

                plantingDate:
                    getValue(
                        "plantingDate"
                    ),

                previousCrop:
                    getValue(
                        "previousCrop"
                    ),

                desiredCrop:
                    getValue(
                        "desiredCrop"
                    )

            };


            console.log(
                "FORM DATA:",
                data
            );


            /* ------------------------------------------------
               VALIDATION
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


            if (missingField) {

                const message =
                    getValidationMessage(
                        selectedLang
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


                    /*
                     * IMPORTANT:
                     *
                     * Nothing is saved yet.
                     *
                     * Show browser confirmation.
                     */

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
     * SIMPLE BROWSER POPUP
     *
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
            "❌ User cancelled save"
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
            "❌ Crop form not found"
        );

        return;

    }


    console.log(
        "✅ User confirmed. Submitting form..."
    );


    /*
     * IMPORTANT:
     *
     * This is the ONLY place where
     * the form is submitted.
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
            "आगे बढ़ने से पहले कृपया सभी आवश्यक जानकारी भरें।"

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
