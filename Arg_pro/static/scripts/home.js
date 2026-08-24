/*
============================================================
CROP IMAGE PREVIEW
============================================================
*/


function setupImagePreview(input) {


    /*
    ========================================================
    GET ELEMENT IDS
    ========================================================
    */

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



    /*
    ========================================================
    SAFETY CHECK
    ========================================================
    */

    if (
        !input ||
        !preview ||
        !removeButton
    ) {

        console.error(
            "Image preview elements not found:",
            {
                input: input,
                preview: preview,
                removeButton: removeButton
            }
        );

        return;
    }



    /*
    ========================================================
    INITIAL STATE
    ========================================================
    */

    removeButton.style.display =
        "none";



    /*
    ========================================================
    IMAGE SELECT
    ========================================================
    */

    input.addEventListener(
        "change",
        function () {


            /*
            ------------------------------------------------
            GET SELECTED FILE
            ------------------------------------------------
            */

            const file =
                this.files[0];


            if (!file) {

                return;
            }



            /*
            ------------------------------------------------
            CHECK IMAGE TYPE
            ------------------------------------------------
            */

            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                alert(
                    "Please select a valid image."
                );


                this.value = "";


                return;
            }



            /*
            ------------------------------------------------
            OPTIONAL FILE SIZE CHECK
            ------------------------------------------------

            10 MB maximum
            */

            const maxSize =
                10 * 1024 * 1024;


            if (
                file.size > maxSize
            ) {

                alert(
                    "Image size must be less than 10 MB."
                );


                this.value = "";


                return;
            }



            /*
            ------------------------------------------------
            FILE READER
            ------------------------------------------------
            */

            const reader =
                new FileReader();



            reader.onload =
                function (event) {


                    /*
                    ========================================
                    SHOW IMAGE
                    ========================================
                    */

                    preview.innerHTML = `

                        <img
                            src="${event.target.result}"
                            alt="Crop image preview"
                        >

                    `;


                    /*
                    ========================================
                    SHOW REMOVE BUTTON
                    ========================================
                    */

                    removeButton.style.display =
                        "flex";

                };



            /*
            ------------------------------------------------
            READ IMAGE
            ------------------------------------------------
            */

            reader.readAsDataURL(
                file
            );

        }
    );



    /*
    ========================================================
    REMOVE IMAGE
    ========================================================
    */

    removeButton.addEventListener(
        "click",
        function (event) {


            /*
            ------------------------------------------------
            STOP LABEL CLICK
            ------------------------------------------------
            */

            event.preventDefault();

            event.stopPropagation();



            /*
            ------------------------------------------------
            CLEAR SELECTED FILE
            ------------------------------------------------
            */

            input.value = "";



            /*
            ------------------------------------------------
            RESTORE PREVIEW
            ------------------------------------------------
            */

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



            /*
            ------------------------------------------------
            HIDE REMOVE BUTTON
            ------------------------------------------------
            */

            removeButton.style.display =
                "none";

        }
    );

}



/*
============================================================
DOM READY
============================================================
*/

document.addEventListener(
    "DOMContentLoaded",
    function () {


        /*
        ====================================================
        FIND ALL IMAGE INPUTS
        ====================================================
        */

        const imageInputs =
            document.querySelectorAll(
                'input[type="file"][data-preview]'
            );



        /*
        ====================================================
        INITIALIZE IMAGE PREVIEWS
        ====================================================
        */

        imageInputs.forEach(
            function (input) {

                setupImagePreview(
                    input
                );

            }
        );



        /*
        ====================================================
        CHARACTER COUNT
        ====================================================
        */

        const diseaseTextarea =
            document.querySelector(
                'textarea[name="disease"]'
            );


        const charCount =
            document.getElementById(
                "charCount"
            );



        if (
            diseaseTextarea &&
            charCount
        ) {


            /*
            ------------------------------------------------
            MAXIMUM 500 CHARACTERS
            ------------------------------------------------
            */

            diseaseTextarea.setAttribute(
                "maxlength",
                "500"
            );



            /*
            ------------------------------------------------
            UPDATE CHARACTER COUNT
            ------------------------------------------------
            */

            function updateCharacterCount() {

                charCount.textContent =
                    `${diseaseTextarea.value.length} / 500`;

            }



            /*
            ------------------------------------------------
            INPUT EVENT
            ------------------------------------------------
            */

            diseaseTextarea.addEventListener(
                "input",
                updateCharacterCount
            );



            /*
            ------------------------------------------------
            INITIAL COUNT
            ------------------------------------------------
            */

            updateCharacterCount();

        }

    }
);