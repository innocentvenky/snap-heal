

/* ============================================================
   LOADING MESSAGES
============================================================ */

const loadingMessages = [

    "🌱 Analyzing your crop...",
    
    "📍 Detecting farm location...",

    "🌡️ Analyzing weather conditions...",

    "🔍 Studying the reported symptoms...",

    "📷 Reviewing crop information...",

    "🧠 Identifying possible crop diseases...",

    "🌿 Preparing crop treatment advice...",

    "💧 Preparing irrigation recommendations...",

    "🌾 Preparing fertilizer recommendations...",

    "🐛 Checking pest management options...",

    "🛡️ Preparing disease management guidance...",

    "📋 Preparing your final crop advisory..."

];


let messageIndex = 0;

let progressValue = 5;


const statusElement =
    document.getElementById(
        "loading-status"
    );


const progressBar =
    document.getElementById(
        "progress-bar"
    );


const messageTimer =
    setInterval(
        function () {


            if (
                messageIndex <
                loadingMessages.length - 1
            ) {

                messageIndex++;

            }


            statusElement.innerText =
                loadingMessages[
                    messageIndex
                ];


            progressValue =
                Math.min(
                    progressValue + 7,
                    90
                );


            progressBar.style.width =
                progressValue + "%";


        },
        1800
    );


/* ============================================================
   START AI
============================================================ */

async function startAI() {

    try {

const response =
    await fetch(
        generateAdviceUrl,
        {
            method: "GET",

            headers: {
                "X-Requested-With":
                    "XMLHttpRequest"
            }
        }
    );

        if (!response.ok) {

            throw new Error(
                "AI request failed"
            );

        }


        if (!response.body) {

            throw new Error(
                "Streaming is not supported."
            );

        }


        const reader =
            response.body.getReader();


        const decoder =
            new TextDecoder(
                "utf-8"
            );


        let buffer = "";

        let markdownText = "";


        while (true) {


            const result =
                await reader.read();


            if (result.done) {

                break;

            }


            buffer +=
                decoder.decode(
                    result.value,
                    {
                        stream: true
                    }
                );


            const lines =
                buffer.split("\n");


            buffer =
                lines.pop();


            for (
                const line of lines
            ) {


                if (!line.trim()) {

                    continue;

                }


                try {


                    const data =
                        JSON.parse(
                            line
                        );


                    /* ======================================
                       AI TEXT
                    ====================================== */

                    if (
                        data.type ===
                        "text"
                    ) {

                        markdownText +=
                            data.content;

                    }


                    /* ======================================
                       COMPLETE
                    ====================================== */

                    if (
                        data.type ===
                        "complete"
                    ) {

                        finishAI(
                            markdownText
                        );

                    }


                    /* ======================================
                       ERROR
                    ====================================== */

                    if (
                        data.type ===
                        "error"
                    ) {

                        throw new Error(
                            data.message
                        );

                    }


                }
                catch (error) {

                    console.error(
                        "Stream parsing error:",
                        error
                    );

                }

            }

        }


        /*
        Safety fallback
        */

        if (
            markdownText.trim()
        ) {

            finishAI(
                markdownText
            );

        }


    }
    catch (error) {


        console.error(
            "AI generation error:",
            error
        );


        clearInterval(
            messageTimer
        );


        statusElement.innerText =
            "❌ AI analysis failed.";


        progressBar.style.width =
            "0%";


        alert(
            "Unable to generate the crop advisory. Please try again."
        );

    }

}


/* ============================================================
   FINISH AI
============================================================ */

function finishAI(
    markdownText
) {


    if (
        !markdownText ||
        !markdownText.trim()
    ) {

        return;

    }


    clearInterval(
        messageTimer
    );


    const html =
        marked.parse(
            markdownText
        );


    document.getElementById(
        "ai-result"
    ).innerHTML =
        html;


    progressBar.style.width =
        "100%";


    statusElement.innerText =
        "✅ Crop advisory is ready!";


    setTimeout(
        function () {


            document.getElementById(
                "ai-loading"
            ).style.display =
                "none";


            document.getElementById(
                "result-container"
            ).style.display =
                "block";


            window.scrollTo(
                0,
                0
            );


        },
        700
    );

}


/* ============================================================
   DOWNLOAD PDF
============================================================ */

/*
    IMPORTANT:

    We are NOT using html2pdf.js.

    This uses the browser's native print engine.

    Therefore:

        Print
             ↓
        Chrome Print Preview
             ↓
        Save to PDF

    uses EXACTLY the same rendering as the
    Print button.
*/

function downloadReport() {

    window.print();

}


/* ============================================================
   PRINT
============================================================ */

function printReport() {

    window.print();

}


/* ============================================================
   START AI AFTER PAGE IS READY
============================================================ */

window.addEventListener(
    "load",
    function () {

        startAI();

    }
);


