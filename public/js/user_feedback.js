const userFeedbackContainer = document.getElementById("user-feedback-container");

const userFeedbackLoadingAnimation = document.getElementById("loading-animation");
const userFeedbackSuccessIcon = document.getElementById("success-icon");
const userFeedbackErrorIcon = document.getElementById("error-icon");

const userFeedbackTitle = document.getElementById("user-feedback-title");
const userFeedbackText = document.getElementById("user-feedback-text");

let hideNotification = undefined

// Show a snackbar looking feedback message. Standard message type is an error, unless told otherwise
function setUserFeedback(messageTitle, messageText = "", feedbackType) {
    console.log("setUserFeedback", feedbackType, messageTitle, messageText);

    // If notification is for loading, set timer for as long as possible
    const feedbackDuration = feedbackType === 'loading' ? 99999999 : 3500

    // Removes the old timeout from firing if the notification is still showing.
    if (hideNotification)
        clearTimeout(hideNotification);

    resetFeedback();

    showFeedback(messageTitle, messageText, feedbackType);

    // Put the notification container in it's original position
    hideNotification = setTimeout(function () {
        hideNotification = undefined;

        // Remove all css classes from the container
        userFeedbackContainer.classList.remove("show-user-feedback");
        userFeedbackContainer.removeAttribute("style");
    }, feedbackDuration);
}


function showFeedback(messageTitle, messageText = "", feedbackType) {
    const containerColor = getContainerColor(feedbackType)
    const showRelevantIcon = setRelevantIcon(feedbackType)

    // Set the text title and description
    userFeedbackTitle.innerHTML = messageTitle;
    userFeedbackText.innerHTML = messageText;

    userFeedbackContainer.style.maxHeight = getMaxHeight(messageTitle, messageText);
    userFeedbackContainer.classList.add(containerColor);
    userFeedbackContainer.classList.add("show-user-feedback");
}

function getContainerColor(feedbackType) {
    // Set the background color of container
    if (feedbackType === 'success') {
        return "success-color"
    } else if (feedbackType === 'error') {
        return "error-color"
    } else if (feedbackType === 'loading') {
        return "loading-color"
    }
}

function setRelevantIcon(feedbackType) {
    // Set the background color of container
    if (feedbackType === 'success') {
        userFeedbackSuccessIcon.classList.remove("hidden");
    } else if (feedbackType === 'error') {
        userFeedbackErrorIcon.classList.remove("hidden");
    } else if (feedbackType === 'loading') {
        userFeedbackLoadingAnimation.classList.remove("hidden");
    }
}

function getMaxHeight(messageTitle, messageText) {
    const charactersPerLine = 40

    // The standard height is always 64px
    let maxHeight = 64;
    // Get the width of the text container;
    // const containerWidth = document.getElementById("user-feedback-text-container").clientWidth;

    // Determine the width of the strings
    // const widthOfMessageTitle = getTextWidth(messageTitle, "700 16px") * 1.06
    // const widthOfMessageText = getTextWidth(messageText, "700 16px") * 1.06

    // Determine how many extra lines are present (there is always room for 1 line. If there are 2 lines,
    // then there is 1 extra line)
    // const extraLinesMessageTitle = (Math.ceil(widthOfMessageTitle / containerWidth) - 1);
    // const extraLinesMessageText = (Math.ceil(widthOfMessageText / containerWidth) - 1);
    const extraLinesMessageTitle = (Math.ceil(messageTitle.length / charactersPerLine) - 1);
    const extraLinesMessageText = (Math.ceil(messageText.length / charactersPerLine) - 1);

    const totalExtraLines = (extraLinesMessageTitle + extraLinesMessageText);

    for (let i = 0; i < totalExtraLines; i++) {
        maxHeight += 20
    }

    return maxHeight + 'px'
}

function resetFeedback() {
    userFeedbackTitle.innerHTML = "";
    userFeedbackText.innerHTML = "";

    // Hide all the icons in the notification bar
    userFeedbackLoadingAnimation.classList.add("hidden");
    userFeedbackSuccessIcon.classList.add("hidden");
    userFeedbackErrorIcon.classList.add("hidden");
    userFeedbackContainer.removeAttribute("style")

    // Remove all css classes from the container
    userFeedbackContainer.classList.remove(
        "error-color",
        "success-color",
        "loading-color",
        "show-user-feedback",
        "start-loading",
        "loading-complete");
}

export {setUserFeedback};