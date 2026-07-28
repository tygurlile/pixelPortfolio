// interaction promt elements that can be rused
const interactionPromptUI = {
	container: document.querySelector('#interactionPrompt'),
	text: document.querySelector('#interactionPromptText')
}

// adjust  prompt text based on keyboard or touch 
function getDisplayedInteractionPrompt(message) {
	const touchControlsAreEnabled =
		typeof window.areTouchControlsEnabled === 'function' &&
		window.areTouchControlsEnabled()

	if (!touchControlsAreEnabled) {
		return message
	}

	return message.replace('[E / Space]', 'Tap A to')
}

function showInteractionPrompt(message) {
	interactionPromptUI.text.textContent = getDisplayedInteractionPrompt(message)
	interactionPromptUI.container.classList.remove('is-hidden')
}

function hideInteractionPrompt() {
	interactionPromptUI.container.classList.add('is-hidden')
}