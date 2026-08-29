 // 🌍 Exact Custom Prompt Dictionary Match
    const prompts = {
        "en-IN": {
            welcome: "Welcome to Snap Heal, your digital crop doctor. Farmers are the backbone of our nation, and we are here to support you.",
            cropName:"what is the name of your crop?",
            askAge: "What is the current age of your crop?",
            askLoc: "Which village or district is your farm located in?",
            askProb: "Please describe the problem or bugs you see on your crop.",
            success: "Thank you! All your details have been captured successfully.",
            listeningName: "🎙️ Listening for Crop Name...",
            listeningAge: "🎙️ Listening for Crop Age...",
            listeningLoc: "🎙️ Listening for Location...",
            listeningProb: "🎙️ Listening for Problem...",
            paused: "⌨️ Typing detected. Voice paused. Press mic button to talk again."
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
            paused: "⌨️ మీరు టైప్ చేస్తున్నారు. మాట్లాడటానికి మళ్లీ మైక్ బటన్ నొక్కండి."
        },
        "hi-IN": {
            welcome: "स्नैप हील डिजिटल फसल डॉक्टर में आपका स्वागत है। किसान हमारे देश की शान हैं, और हम आपकी हर कदम पर मदद करेंगे।",
            cropName: "आपकी फसल का नाम क्या है?",
            askAge: "आपकी फसल कितने दिन या हफ्तों की है?",
            askLoc: "आपका खेत किस गांव या जिले में स्थित है?",
            askProb: "अपनी फसल की समस्या या कीड़ों के बारे में बताएं।",
            success: "धन्यवाद! आपकी जानकारी सफलतापूर्वक दर्ज कर ली गई है।",
            listeningName: "🎙️ फसल का नाम सुन रहा हूँ...",
            listeningAge: "🎙️ फसल की उम्र सुन रहा हूँ...",
            listeningLoc: "🎙️ स्थान या गाँव सुन रहा हूँ...",
            listeningProb: "🎙️ फसल की समस्या सुन रहा हूँ...",
            paused: "⌨️ टाइपिंग मोड चालू है। बोलने के लिए फिर से माइक दबाएं।"
        }
    };

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = SpeechRecognition ? new SpeechRecognition() : null;
    const synth = window.speechSynthesis;

    if (!recognition) {
        document.getElementById('statusBox').innerHTML = "<b style='color:red;'>Voice support requires Google Chrome or Microsoft Edge.</b>";
    } else {
        recognition.continuous = false;
        recognition.interimResults = false;
    }

    let activeTargetId = null; 
    let activeButtonElement = null; 
    let selectedLang = "en-IN";
    let welcomeSpoken = false; // Flag to stop welcome repeating unnecessarily

    // 🔊 Setup Sweet Female Voice Engine
    function ladySpeak(text, callback) {
        synth.cancel(); 
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = selectedLang;
        
        const voices = synth.getVoices();
        const femaleVoice = voices.find(voice => 
            (voice.lang.includes(selectedLang) && (voice.name.toLowerCase().includes('google') || voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('zira') || voice.name.toLowerCase().includes('heera')))
        );
        if (femaleVoice) utterance.voice = femaleVoice;

        utterance.rate = 0.95; 
        utterance.pitch = 1.1; 

        utterance.onend = () => { if (callback) callback(); };
        synth.speak(utterance);
    }

    // 🎵 NEW AUTOMATIC WELCOME LOGIC: Runs instantly on first page interaction
    function triggerAutoWelcome() {
        if (welcomeSpoken) return;
        selectedLang = document.getElementById('langSelect').value;
        ladySpeak(prompts[selectedLang].welcome);
        welcomeSpoken = true;
        // Clean up page touch events once welcome runs once
        window.removeEventListener('click', triggerAutoWelcome);
        window.removeEventListener('touchstart', triggerAutoWelcome);
    }

    // Listens for the very first touch/click anywhere on the webpage to bypass browser blocks
    window.addEventListener('click', triggerAutoWelcome);
    window.addEventListener('touchstart', triggerAutoWelcome);

    // Language dropdown menu changer voice trigger
    document.getElementById('langSelect').addEventListener('change', (e) => {
        selectedLang = e.target.value;
        welcomeSpoken = true; // prevent click intercept overlay overwrite
        ladySpeak(prompts[selectedLang].welcome);
    });

    // Reset voice engine instantly if user prefers typing manually

const inputs = [document.getElementById('cropName'), document.getElementById('cropAge'), document.getElementById('location'), document.getElementById('problem')];
inputs.forEach(input => {
input.addEventListener('input', () => {
recognition.abort();
synth.cancel();
document.getElementById('statusBox').innerHTML = prompts[document.getElementById('langSelect').value].paused;
resetMicButtons();
});
});
// 🎙️ SINGLE BLOCK VOICE BUTTON CONTROLLER
function activateBlockVoice(targetInputId, speakPromptKey, statusListenKey) {
if (!recognition) return;
welcomeSpoken = true; // Turn off initial screen overlay state
selectedLang = document.getElementById('langSelect').value;
const targetInput = document.getElementById(targetInputId);
const clickedButton = targetInput.nextElementSibling;
if (activeTargetId === targetInputId) {
recognition.abort();
synth.cancel();
resetMicButtons();
return;
}
recognition.abort();
synth.cancel();
resetMicButtons();
activeTargetId = targetInputId;
activeButtonElement = clickedButton;
recognition.lang = selectedLang;
clickedButton.innerText = "⏳";
document.getElementById('statusBox').innerText = "🤖 Speaking question...";
// Speaks the exact matching block audio query
ladySpeak(prompts[selectedLang][speakPromptKey], () => {
clickedButton.classList.add('listening');
clickedButton.innerText = "⏳";
document.getElementById('statusBox').innerText = prompts[selectedLang][statusListenKey];
recognition.start();
});
}
if (recognition) {
recognition.onresult = (event) => {
if (!event.results || event.results.length === 0) return;
const spokenText = event.results[0][0].transcript; // 🛠️ FIXED: Deep nested extraction mapping
if (spokenText && spokenText.toLowerCase() !== "undefined" && activeTargetId) {
document.getElementById(activeTargetId).value = spokenText.trim();
}
};
recognition.onend = () => { resetMicButtons(); };
recognition.onerror = (event) => { console.error(event.error); resetMicButtons(); };
}
function resetMicButtons() {
activeTargetId = null;
if (activeButtonElement) {
activeButtonElement.classList.remove('listening');
activeButtonElement.innerText = "🎙️";
activeButtonElement = null;
}
document.getElementById('statusBox').innerText = "Tap the 🎙️ button next to any block to talk to Snap-Heal.";
}
// 💾 SAVE BUTTON ACTION
document.getElementById('saveBtn').addEventListener('click', () => {
selectedLang = document.getElementById('langSelect').value;
const payload = {
crop: document.getElementById('cropName').value.trim(),
age: document.getElementById('cropAge').value.trim(),
location: document.getElementById('location').value.trim(),
problem: document.getElementById('problem').value.trim()
};
if (!payload.crop || !payload.age || !payload.location || !payload.problem) {
alert("⚠️ Please fill out all fields before saving.");
return;
}
// Play the final success message aloud on submit click
ladySpeak(prompts[selectedLang].success, () => {
alert("🎉 Saved to Snap-Heal Database!\n\nCrop: " + payload.crop + "\nAge: " + payload.age + "\nLocation: " + payload.location + "\nProblem: " + payload.problem);
});
});
if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
speechSynthesis.onvoiceschanged = () => synth.getVoices();
}