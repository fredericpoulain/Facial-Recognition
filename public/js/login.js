const elBlocEmail = document.querySelector('.blocEmail');
const elEmail = document.querySelector('.email');
const elBlocPassword = document.querySelector('.blocPassword');
const elPassword = document.querySelector('.password')
const elAlert = document.querySelector('.alert');
const elForm = document.querySelector('form');
const elBtnEmail = document.querySelector('.btnEmail');
const elBtnConnect = document.querySelector('.btnConnect');
const elWebcamContainer = document.querySelector('.webcam-container');
const videoContainer = document.querySelector('.video-container');
const webcamElement = document.querySelector('.webcam');
const elStartWebcam = document.querySelector(".startWebcam");
const elStartFacialReco = document.querySelector(".startFacialReco");

const regexMail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const modelPath = 'models';

let email;
let displaySize;
let canvas;

const constraints = {
    video: true
};

//Associe la taille du canvas avec celle de l'élément vidéo
webcamElement.addEventListener("loadedmetadata", () => {
    displaySize = {width: webcamElement.scrollWidth, height: webcamElement.scrollHeight};
});
elEmail.addEventListener("keyup", () => deleteStyleAlert(elEmail));
elPassword.addEventListener("keyup", () => deleteStyleAlert(elPassword));



async function callServer(dataObject, route) {
    const formData = new FormData();
    const entries = Object.entries(dataObject); // convertit l'objet en un tableau de paires clé/valeur
    for (const [key, value] of entries) { // parcourt le tableau
        formData.append(key, value); // ajoute chaque paire au formData
    }
    const response = await fetch(route, {
        method: "POST",
        body: formData,
    });
    if (!response.ok) throw new Error(`Une erreur est survenue: ${response.status}`);
    return await response.json();
}

elBtnEmail.addEventListener('click', async (e) => {
    e.preventDefault();
    if (validateEmail()) {
        try {
            const resEmail = await callServer({email: elEmail.value}, "/email-verified")
            if (!resEmail.isSuccessful) throw new Error(resEmail.message);
            email = resEmail.email;
            elBlocEmail.classList.add('d-none')
            elWebcamContainer.classList.remove('d-none')
            elStartWebcam.addEventListener('click', initWebCam);
        } catch (error) {
            handleMessage(error.message)
        }
    }
})

function validateEmail() {
    if (elEmail.value === "" || !elEmail.value.match(regexMail)) {
        elEmail.classList.add('is-invalid')
        return false;
    }
    return true
}
function validatePassword() {
    if (elPassword.value === "" || elPassword.value.length < 8) {
        elPassword.classList.add('is-invalid')
        return false;
    }
    return true
}

function initWebCam(e) {
    e.preventDefault()
    // Demander la permission d'utiliser la webcam
    navigator.mediaDevices.getUserMedia(constraints)
        .then(faceRecognition)
        .catch(()=>{
            handleMessage("Erreur d'initialisation de la webcam");
        });
}

function faceRecognition(stream) {
    // Récupérer le flux vidéo
    webcamElement.srcObject = stream;
    // Écouter l'événement loadedmetadata de l'élément vidéo
    webcamElement.addEventListener('loadedmetadata', async () => {
        //On charge tous les models
        const promises = [
            //faceRecognitionNet : calcule un descripteur de visage à partir d’une image de visage
            faceapi.nets.faceRecognitionNet.load(modelPath),
            // //tinyFaceDetector : détecteur de visages
            faceapi.nets.tinyFaceDetector.load(modelPath),
            // //faceLandmark68TinyNet : détecteur de points de repère du visage
            faceapi.nets.faceLandmark68TinyNet.load(modelPath),

            // //faceExpressionNet : reconnaissance des expressions faciales
            // faceapi.nets.faceExpressionNet.load(modelPath),

            // // ageGenderNet : estimation de l’âge et du genre
            // faceapi.nets.ageGenderNet.load(modelPath)
        ];
        await Promise.all(promises); //on attend que tous les models soient chargés
        createCanvas(); //On crée le canvas
        startDetection();//et on démarre la detection du visage par faceAPIjs

        //Au 'click', l'identification du visage démarre
        elStartFacialReco.addEventListener('click', startIdentification);

    });
    // Désactiver le bouton
    elStartWebcam.disabled = true;
}

function createCanvas() {
    canvas = faceapi.createCanvasFromMedia(webcamElement)
    videoContainer.append(canvas)
    faceapi.matchDimensions(canvas, displaySize)
}

function removeCanvas() {
    // Assurez-vous que le canvas existe
    if (canvas && canvas.parentNode) {
        // Supprimez le canvas de son parent (videoContainer)
        canvas.parentNode.removeChild(canvas);
    }
}

function startDetection() {
    const faceDetection = setInterval(async () => {
        //ici, on peut éventuellement ajouter la reconnaissance des expressions faciale, et celle du genre
        const detections = await faceapi.detectAllFaces(webcamElement, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks(true)
            // .withFaceExpressions()
            // .withAgeAndGender();
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

        // faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
        // resizedDetections.forEach(result => {
        //     const { age, gender, genderProbability } = result
        //     new faceapi.draw.DrawTextField(
        //         [
        //             `${Math.round(age, 0)} years`,
        //             `${gender} (${Math.round(genderProbability)})`
        //         ],
        //         result.detection.box.bottomRight
        //     ).draw(canvas)
        // })

    }, 300);
}

async function startIdentification(e) {
    e.preventDefault()
    // Extraction des caractéristiques du visage, on obtient un "descripteur".
    const webcamDescriptor = await faceapi.computeFaceDescriptor(webcamElement)

    //On place les valeurs dans un objet pour l'envoi au serveur
    const dataObject = {
        email: elEmail.value,
        dataFaceApi: webcamDescriptor
    }
    try {
        const resFaceReco = await callServer(dataObject, "/face-recognition")
        if (!resFaceReco.isSuccessful) throw new Error(resFaceReco.message);

        // Le serveur répond positivement à l'identification faciale
        // On récupère le token de cession et on le stocke dans le localStorage
        // Ce token est la preuve que l'identification par reconnaissance faciale à était effectué.
        // À l'étape suivante (saisie du mot de passe pour la connexion finale) le serveur réclamera ce token du localStorage et le comparera avec celui de la session.
        const tokenFaceRecognition = resFaceReco.tokenFaceRecognition;
        localStorage.setItem('tokenFaceRecognition', tokenFaceRecognition);

        handleMessage(resFaceReco.message, 'alert-success')
        stopWebCam();
        removeCanvas();
        elWebcamContainer.classList.add('d-none')
        elBlocPassword.classList.remove('d-none');

        //au 'click' du bouton de connexion, une requête finale sera envoyé au serveur.
        elBtnConnect.addEventListener('click', connect);

    } catch (error) {
        handleMessage(error.message)
    }
}

async function connect(e) {
    e.preventDefault();
    if (validatePassword()){
        try {
            const formData = new FormData(elForm);
            //on récupère le token reçu lors de l'identification par reconnaissance faciale pour le placer dans le FormData
            const tokenFaceRecognition = localStorage.getItem('tokenFaceRecognition');
            formData.append('tokenFaceRecognition', tokenFaceRecognition);
            const response = await fetch('/connexion', {
                method: "POST",
                body: formData,
            });
            if (!response.ok) throw new Error(`Une erreur est survenue: ${response.status}`);
            const res = await response.json();
            if (!res.isSuccessful) throw new Error(res.message)

            //Le serveur a envoyé une response positive, a bien comparé les tokens côté client et serveur, et a procédé à la connexion.
            // On redirige vers l'accueil
            window.location.href = '/';
        } catch (error) {
            handleMessage(error.message);
        }
    }
}

function handleMessage(message, className = 'alert-danger') {
    elAlert.classList.remove('d-none')
    elAlert.classList.add(className)
    elAlert.textContent = message
    setTimeout(() => {
        elAlert.classList.add('d-none')
        elAlert.classList.remove('alert-danger')
        elAlert.textContent = "";

    }, 4000);
}
function deleteStyleAlert(element) {
    element.classList.remove('is-invalid');
}

function stopWebCam() {
    // Obtenir le flux média de l'élément vidéo
    const stream = webcamElement.srcObject;
    // Obtenir les pistes du flux
    const tracks = stream.getTracks();
    // Arrêter chaque piste
    tracks.forEach((track) => {
        track.stop();
    });
    // Supprimer le flux de l'élément vidéo
    webcamElement.srcObject = null;
}


