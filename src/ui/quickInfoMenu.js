// the "expore" button
 const quickInfoUI = {
	button: document.querySelector('#quickInfoButton'),
	overlay: document.querySelector('#quickInfoOverlay'),
	closeButton: document.querySelector('#closeQuickInfoButton'),
	options: Array.from(document.querySelectorAll('[data-information-id]')
	)
}

// callbacks provided by the main game file
let quickInfoOpenHandler = () => {}
let quickInfoCloseHandler = () => {}
let quickInfoSelectHandler = () => {}

let quickInfoMenuInitialized = false

function initializeQuickInfoMenu({
	onOpen,
	onClose,
	onSelect
} = {}) {
	if (typeof onOpen === 'function') {quickInfoOpenHandler = onOpen}
	if (typeof onClose === 'function') {quickInfoCloseHandler = onClose}
	if (typeof onSelect === 'function') {quickInfoSelectHandler = onSelect}

	if (quickInfoMenuInitialized) {return}
	quickInfoMenuInitialized = true

	quickInfoUI.button.addEventListener(
		'click',
		() => {
			quickInfoOpenHandler()
		}
	)

	quickInfoUI.closeButton.addEventListener(
		'click',
		() => {
			quickInfoCloseHandler()
		}
	)

	// close menu when the user clicks outside the main panel
	quickInfoUI.overlay.addEventListener(
		'click',
		(event) => {
			if (
				event.target ===
				quickInfoUI.overlay
			) {
				quickInfoCloseHandler()
			}
		}
	)

	// open info page connected to each option button
	quickInfoUI.options.forEach(
		(optionButton) => {
			optionButton.addEventListener(
				'click',
				() => {
					const contentId = optionButton.dataset.informationId
					if (!contentId) {return}
					quickInfoSelectHandler(contentId)
				}
			)
		}
	)

	// let escape close the menu while it is open
	window.addEventListener(
		'keydown',
		(event) => {
			if (event.key !== 'Escape') {return}
			if (event.repeat) {return}

			// if info popup already handled escape, dont close quick info
			if (event.defaultPrevented) {return}
			if (!isQuickInfoMenuOpen()) {return}

			event.preventDefault()
			event.stopPropagation()

			quickInfoCloseHandler()
		},
		true
	)
}

function showQuickInfoMenu() {
	quickInfoUI.overlay.classList.remove('is-hidden')
	quickInfoUI.closeButton.focus()
}

function hideQuickInfoMenu() {
	quickInfoUI.overlay.classList.add('is-hidden')
}

function isQuickInfoMenuOpen() {
	return !quickInfoUI.overlay.classList.contains('is-hidden')
}

function showQuickInfoButton() {
	if (!quickInfoUI.button) {return}
	quickInfoUI.button.classList.remove('is-hidden')
}

function hideQuickInfoButton() {
	if (!quickInfoUI.button) {return}
	quickInfoUI.button.classList.add('is-hidden')
}
