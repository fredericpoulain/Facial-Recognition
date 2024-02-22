const elEmail = document.querySelector('.email');
const elUsername = document.querySelector('.userName');
const elpassword = document.querySelector('.password');
const elImage = document.querySelector('.image');
const elAgreeTerms = document.querySelector('.agreeTerms');
const elDataFaceApi = document.querySelector('.dataFaceApi');
const elAlert = document.querySelector('.alert');
const elAlertText = document.querySelector('.alert span');
const elForm = document.querySelector('form');
const elBtnRegister = document.querySelector('.btnRegister');


const regexMail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const modelPath = 'models';


elEmail.addEventListener("keyup", () => deleteStyleAlert(elEmail));
elUsername.addEventListener("keyup", () => deleteStyleAlert(elUsername));
elpassword.addEventListener("keyup", () => deleteStyleAlert(elpassword));
elImage.addEventListener("keyup", () => deleteStyleAlert(elImage));
elAgreeTerms.addEventListener("click", () => deleteStyleAlert(elAgreeTerms));

function deleteStyleAlert(element) {
    element.classList.remove('is-invalid');
}

elBtnRegister.addEventListener('click', async (e) => {
    e.preventDefault();
    const file = elImage.files[0];

    if (validationRegisterForm(file)) {
        try {
            //ont créé un blob de l'image
            const photo = await createBlob(file)
            if (photo) {
                //On charge le ou les models nécessaire
                const promises = [
                    //faceRecognitionNet : calcule un descripteur de visage à partir d’une image de visage
                    faceapi.nets.faceRecognitionNet.load(modelPath),

                    // //tinyFaceDetector : détecteur de visages
                    // faceapi.nets.tinyFaceDetector.load(modelPath),

                    // //faceLandmark68TinyNet : détecteur de points de repère du visage
                    // faceapi.nets.faceLandmark68TinyNet.load(modelPath),

                    // //faceExpressionNet : reconnaissance des expressions faciales
                    // faceapi.nets.faceExpressionNet.load(modelPath),

                    // // ageGenderNet : estimation de l’âge et du genre
                    // faceapi.nets.ageGenderNet.load(modelPath)
                ];
                await Promise.all(promises);
                //l'image doit être en base64 pour pouvoir être exploité par faceAPI.js
                const base64 = await faceapi.bufferToImage(photo);

                //On récupère un "descripteur" : un tableau de 128 nombres flottants qui correspond à la photo
                const infoFaceApi = await faceapi.computeFaceDescriptor(base64);
                //ont converti le résultat en chaine de caractère pour l'enregistrement en base de données
                const infoFaceApiString = infoFaceApi.join(',');
                //et on l'ajoute au champ caché
                elDataFaceApi.value = infoFaceApiString;

                //on prépare la requête ajax en POST pour l'envoyer au serveur
                const formData = new FormData(elForm);
                const response = await fetch("/inscription", {
                    method: "POST",
                    body: formData,
                });
                if (!response.ok) throw new Error(`Une erreur est survenue: ${response.status}`);
                const resultat = await response.json();
                if (!resultat.isSuccessful){
                    let errorMessage = resultat.message;
                    // On vérifie s'il y a des erreurs supplémentaires
                    if (resultat.errors && resultat.errors.length > 0) {
                        // Et on créé une chaîne de texte contenant les messages d'erreur
                        errorMessage += resultat.errors;
                    }
                    throw new Error(errorMessage);
                }
                elForm.reset();
                elBtnRegister.disabled = true;
                handleMessage(resultat.message, 'alert-success');
            }
        } catch (error) {
            handleMessage(error, 'alert-danger');
        }
    }

})

function validationRegisterForm(file) {
    if (elEmail.value === "" || !elEmail.value.match(regexMail)) {
        elEmail.classList.add('is-invalid')
        return false;
    }
    if (elUsername.value === "") {
        elUsername.classList.add('is-invalid')
        return false;
    }
    if (elpassword.value === "" || elpassword.value.length < 8) {
        elpassword.classList.add('is-invalid')
        return false;
    }

    if (!file) {
        elImage.classList.add('is-invalid')
        return false;
    } else {
        const fileType = file.type;
        if (!fileType.startsWith('image/')) {
            elImage.classList.add('is-invalid')
            elImage.value = '';
            return false;
        }
    }
    if (!elAgreeTerms.checked) {
        elAgreeTerms.classList.add('is-invalid')
        return false;
    }
    return true
}


async function createBlob(file) {
    const url = URL.createObjectURL(file);
    // On crée un élément image avec cette URL comme source
    const img = document.createElement('img');
    img.src = url;
    // On attend la réponse de fetch
    const res = await fetch(url);
    // Renvoie le blob de la réponse
    return res.blob();
}

function handleMessage(message, className) {
    elAlert.classList.remove('d-none')
    elAlert.classList.add(className)
    elAlert.textContent = message
    setTimeout(() => {
        elAlert.classList.add('d-none')
        elAlert.classList.remove(className)
        elAlert.textContent = "";

    }, 4000);
}