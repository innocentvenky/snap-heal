
"use strict";


/* =========================================================
   SCRIPT LOADED CHECK
========================================================= */

console.log("====================================");
console.log("HOME.JS LOADED SUCCESSFULLY");
console.log("====================================");


/* =========================================================
   IMAGE PREVIEW FUNCTION
========================================================= */

function setupImagePreview(input) {

    console.log(
        "Setting up:",
        input.id
    );


    const previewId =
        input.dataset.preview;

    const removeId =
        input.dataset.remove;


    const preview =
        document.getElementById(
            previewId
        );


    const removeButton =
        document.getElementById(
            removeId
        );


    /* -----------------------------------------------------
       SAFETY CHECK
    ----------------------------------------------------- */

    if (!preview) {

        console.error(
            "Preview not found:",
            previewId
        );

        return;
    }


    if (!removeButton) {

        console.error(
            "Remove button not found:",
            removeId
        );

        return;
    }


    /* -----------------------------------------------------
       INITIAL STATE
    ----------------------------------------------------- */

    removeButton.style.display = "none";


    /* =====================================================
       IMAGE SELECT
    ===================================================== */

    input.addEventListener(
        "change",
        function (event) {

            console.log(
                "CHANGE EVENT:",
                input.id
            );


            const file =
                event.target.files[0];


            /* ------------------------------------------------
               NO FILE
            ------------------------------------------------ */

            if (!file) {

                console.log(
                    "No file selected"
                );

                return;
            }


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


            /* ------------------------------------------------
               IMAGE TYPE CHECK
            ------------------------------------------------ */

            if (
                !file.type ||
                !file.type.startsWith("image/")
            ) {

                alert(
                    "Please select a valid image."
                );

                input.value = "";

                return;
            }


            /* ------------------------------------------------
               SIZE CHECK
               10 MB
            ------------------------------------------------ */

            const maxSize =
                10 * 1024 * 1024;


            if (file.size > maxSize) {

                alert(
                    "Image must be less than 10 MB."
                );

                input.value = "";

                return;
            }


            /* ------------------------------------------------
               FILE READER
            ------------------------------------------------ */

            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    console.log(
                        "Image loaded:",
                        file.name
                    );


                    preview.innerHTML = "";


                    const image =
                        document.createElement(
                            "img"
                        );


                    image.src =
                        event.target.result;


                    image.alt =
                        "Selected crop image";


                    preview.appendChild(
                        image
                    );


                    removeButton.style.display =
                        "flex";
                };


            reader.onerror =
                function () {

                    console.error(
                        "FileReader error"
                    );

                    alert(
                        "Unable to read the selected image."
                    );
                };


            reader.readAsDataURL(
                file
            );

        }
    );


    /* =====================================================
       REMOVE IMAGE
    ===================================================== */

    removeButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            event.stopPropagation();


            console.log(
                "Removing:",
                input.id
            );


            /* ------------------------------------------------
               CLEAR INPUT
            ------------------------------------------------ */

            input.value = "";


            /* ------------------------------------------------
               RESTORE PREVIEW
            ------------------------------------------------ */

            preview.innerHTML = `

                <span class="camera">
                    📷
                </span>

                <strong>
                    Add Photo
                </strong>

                <small>
                    Camera or Gallery
                </small>

            `;


            /* ------------------------------------------------
               HIDE REMOVE BUTTON
            ------------------------------------------------ */

            removeButton.style.display =
                "none";

        }
    );

}


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "DOM CONTENT LOADED"
        );


        /* =================================================
           FIND IMAGE INPUTS
        ================================================= */

        const imageInputs =
            document.querySelectorAll(
                'input[type="file"][data-preview]'
            );


        console.log(
            "IMAGE INPUT COUNT:",
            imageInputs.length
        );


        /* =================================================
           CHECK INPUTS
        ================================================= */

        if (imageInputs.length === 0) {

            console.error(
                "NO IMAGE INPUTS FOUND"
            );

            return;
        }


        /* =================================================
           INITIALIZE
        ================================================= */

        imageInputs.forEach(
            function (input) {

                setupImagePreview(
                    input
                );

            }
        );


        /* =================================================
           FORM
        ================================================= */

        const form =
            document.getElementById(
                "cropForm"
            );


        const submitButton =
            document.getElementById(
                "submitButton"
            );


        if (form) {

            form.addEventListener(
                "submit",
                function () {

                    console.log(
                        "FORM SUBMITTED"
                    );


                    /* -----------------------------------------
                       Count selected images
                    ----------------------------------------- */

                    let count = 0;


                    imageInputs.forEach(
                        function (input) {

                            if (
                                input.files &&
                                input.files.length > 0
                            ) {

                                count++;
                            }

                        }
                    );


                    console.log(
                        "TOTAL IMAGES:",
                        count
                    );


                    /* -----------------------------------------
                       Allow submission even with no images
                       if backend permits it.
                    ----------------------------------------- */

                    if (submitButton) {

                        submitButton.disabled =
                            true;

                        submitButton.querySelector(
                            "span"
                        ).textContent =
                            "Uploading...";
                    }

                }
            );

        }

    }
);

