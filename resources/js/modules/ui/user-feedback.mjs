const userFeedbackContainer = document.getElementById("user-feedback-container");

const userFeedbackLoadingAnimation = document.getElementById("loading-animation");
const userFeedbackSuccessIcon = document.getElementById("success-icon");
const userFeedbackErrorIcon = document.getElementById("error-icon");

const userFeedbackTitle = document.getElementById("user-feedback-title");
const userFeedbackText = document.getElementById("user-feedback-text");

// Show a snackbar looking feedback message. Standard message type is an error, unless told otherwise
function setUserFeedback(messageTitle, messageText = "", isError = true) {
    console.log("Feedback", messageTitle, messageText);

    resetFeedback();

    // Setting a timeout is needed for the classes to be actually removed
    setTimeout(function () {
        if (isError) {
            messageTitle = messageTitle && messageTitle.length ? messageTitle : "Oops, something went wrong!";
            showFeedbackError(messageTitle, messageText);
        } else {
            messageTitle = messageTitle && messageTitle.length ? messageTitle : "Success!";
            showFeedbackSuccess(messageTitle, messageText);
        }
    }, 1);
}

function startLoadingFeedback() {
    resetFeedback();

    // Setting a timeout is needed for the classes to be actually removed
    setTimeout(function () {
        userFeedbackLoadingAnimation.classList.remove("hidden");
        userFeedbackContainer.classList.add("start-loading");
    }, 1);
}

function stopLoadingFeedback(messageTitle, messageText, error = false) {
    resetFeedback();

    setTimeout(function () {
        userFeedbackContainer.classList.remove("start-loading");
        userFeedbackContainer.classList.add("loading-complete");

        error ?
            showFeedbackError(messageTitle, messageText) :
            showFeedbackSuccess(messageTitle, messageText);
    }, 1);
}

function setLoadingFeedbackTitle(title) {
    userFeedbackTitle.innerHTML = title + "...";
}

function setLoadingFeedbackText(text) {
    userFeedbackText.innerHTML = text;
}

function resetFeedback() {
    userFeedbackTitle.innerHTML = "";
    userFeedbackText.innerHTML = "";

    userFeedbackContainer.classList.remove("error-color");
    userFeedbackContainer.classList.remove("success-color");
    userFeedbackContainer.classList.remove("show-user-feedback");
    userFeedbackContainer.classList.remove("start-loading");
    userFeedbackContainer.classList.remove("loading-complete");

    userFeedbackLoadingAnimation.classList.add("hidden");
    userFeedbackSuccessIcon.classList.add("hidden");
    userFeedbackErrorIcon.classList.add("hidden");
}

function showFeedbackSuccess(messageTitle, messageText = "") {
    userFeedbackTitle.innerHTML = messageTitle;
    userFeedbackText.innerHTML = messageText;

    userFeedbackSuccessIcon.classList.remove("hidden");
    userFeedbackContainer.classList.add("success-color");
    userFeedbackContainer.classList.add("show-user-feedback");
}

function showFeedbackError(messageTitle, messageText = "") {
    userFeedbackTitle.innerHTML = messageTitle;
    userFeedbackText.innerHTML = messageText;

    userFeedbackErrorIcon.classList.remove("hidden");
    userFeedbackContainer.classList.add("error-color");
    userFeedbackContainer.classList.add("show-user-feedback");
}

module.exports = {
    setUserFeedback, startLoadingFeedback, stopLoadingFeedback, setLoadingFeedbackTitle, setLoadingFeedbackText
};