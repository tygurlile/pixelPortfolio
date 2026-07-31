// how the mobile controls work

const mobileControlsUI = {
	container: document.querySelector('#mobileControls'),
	joystick: document.querySelector('#virtualJoystick'),
	knob: document.querySelector('#joystickKnob'),
	interactButton: document.querySelector('#mobileInteractButton')
}

const touchControlState = {
	enabled: false,
	joystickPointerId: null,
	interactPointerId: null,
	direction: null
}

// check whether the current device uses a touchscreen
function deviceProbablyUsesTouch() {
	return (
		navigator.maxTouchPoints > 0 ||
		window.matchMedia('(pointer: coarse)').matches ||
		window.matchMedia('(any-pointer: coarse)').matches
	)
}

function activateTouchControls() {
	touchControlState.enabled = true
	document.body.classList.add('touch-controls-enabled')
}

function deactivateTouchControls() {
	touchControlState.enabled = false
	document.body.classList.remove('touch-controls-enabled')
	resetVirtualControls()
}

function areTouchControlsEnabled() {
	return touchControlState.enabled
}

window.activateTouchControls = activateTouchControls
window.deactivateTouchControls = deactivateTouchControls
window.areTouchControlsEnabled = areTouchControlsEnabled

// automatically enable touch controls on devices that appear to need them.
if (deviceProbablyUsesTouch()) {
	activateTouchControls()
}


// stop current movement direction from the joystick
function releaseTouchDirection() {
	if (touchControlState.direction) {
		setMovementInput(touchControlState.direction, false)
	}

	touchControlState.direction = null
}


// change active joystick direction without leaving previous input pressed.
function setTouchDirection(nextDirection) {
	if (nextDirection === touchControlState.direction) {
		return
	}
	releaseTouchDirection()
	if (nextDirection) {
		setMovementInput(nextDirection, true)
		touchControlState.direction = nextDirection
	}
}

function centerJoystickKnob() {
	mobileControlsUI.knob.style.transform =
		'translate(-50%, -50%)'
}

function resetVirtualControls() {
	releaseTouchDirection()
	setActionInput('interact', false)

	touchControlState.joystickPointerId = null
	touchControlState.interactPointerId = null

	centerJoystickKnob()

	mobileControlsUI.interactButton.classList.remove('is-pressed')
}

window.resetVirtualControls = resetVirtualControls


// update the joystick position and convert it into a movement direction
function updateJoystick(pointerEvent) {
	const bounds = mobileControlsUI.joystick.getBoundingClientRect()

	const centerX = bounds.left + bounds.width / 2
	const centerY = bounds.top + bounds.height / 2

	const gameScale = Number(
		getComputedStyle(gameContainer).getPropertyValue('--game-scale')
	) || 1


	// joystick uses original coord system. pointer coords use screen pixels
	const rawX = (pointerEvent.clientX - centerX) / gameScale
	const rawY = (pointerEvent.clientY - centerY) / gameScale
	const distance = Math.hypot(rawX, rawY)

	// limit how far the knob can move and ignore small movements near center
	const maximumDistance = mobileControlsUI.joystick.offsetWidth * 0.29
	const deadZone = mobileControlsUI.joystick.offsetWidth * 0.10
	const limitedDistance = Math.min(distance, maximumDistance)

	const angle = Math.atan2(rawY, rawX)
	const knobX = Math.cos(angle) * limitedDistance
	const knobY = Math.sin(angle) * limitedDistance

	mobileControlsUI.knob.style.transform =
		`translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`

	// stop movement when the pointer returns to joystick's center
	if (distance < deadZone) {
		setTouchDirection(null)
		return
	}

	// use whichever axis has the larger movement to choose direction
	if (Math.abs(rawX) > Math.abs(rawY)) {
		setTouchDirection(rawX > 0 ? 'right' : 'left')
		return
	}
	setTouchDirection(rawY > 0 ? 'down' : 'up')
}


// begin tracking the pointer controlling the joystick.
function startJoystick(pointerEvent) {
	if (!canAcceptGameplayInput()) return

	pointerEvent.preventDefault()
	audioManager.unlockAudio()

	touchControlState.joystickPointerId = pointerEvent.pointerId
	mobileControlsUI.joystick.setPointerCapture(pointerEvent.pointerId)
	updateJoystick(pointerEvent)
}


function moveJoystick(pointerEvent) {
	if (
		pointerEvent.pointerId !== touchControlState.joystickPointerId
	) {
		return
	}

	pointerEvent.preventDefault()
	updateJoystick(pointerEvent)
}

function stopJoystick(pointerEvent) {
	if (
		pointerEvent.pointerId !== touchControlState.joystickPointerId
	) {
		return
	}

	pointerEvent.preventDefault()

	releaseTouchDirection()
	touchControlState.joystickPointerId = null
	centerJoystickKnob()
}


function pressInteract(pointerEvent) {
	if (!canAcceptGameplayInput()) return

	pointerEvent.preventDefault()
	audioManager.unlockAudio()

	touchControlState.interactPointerId = pointerEvent.pointerId

	// Continue tracking the press even if the pointer moves off the button.
	mobileControlsUI.interactButton.setPointerCapture(pointerEvent.pointerId)

	mobileControlsUI.interactButton.classList.add('is-pressed')
}


function releaseInteract(pointerEvent) {
	if (
		pointerEvent.pointerId !== touchControlState.interactPointerId
	) {
		return
	}

	pointerEvent.preventDefault()

	touchControlState.interactPointerId = null
	mobileControlsUI.interactButton.classList.remove('is-pressed')

	// register one complete interaction after the finger is released
	setActionInput('interact', true)
	setActionInput('interact', false)
}

function cancelInteract(pointerEvent) {
	if (
		pointerEvent.pointerId !== touchControlState.interactPointerId
	) {
		return
	}

	pointerEvent.preventDefault()

	touchControlState.interactPointerId = null
	mobileControlsUI.interactButton.classList.remove('is-pressed')

	setActionInput('interact', false)
}


// register joystick pointer events for pressing, dragging, and releasing.
mobileControlsUI.joystick.addEventListener('pointerdown', startJoystick)
mobileControlsUI.joystick.addEventListener('pointermove', moveJoystick)
mobileControlsUI.joystick.addEventListener('pointerup', stopJoystick)
mobileControlsUI.joystick.addEventListener('pointercancel', stopJoystick)
mobileControlsUI.joystick.addEventListener('lostpointercapture', stopJoystick)


// register pointer events for the mobile interaction button
mobileControlsUI.interactButton.addEventListener('pointerdown', pressInteract)
mobileControlsUI.interactButton.addEventListener('pointerup', releaseInteract)
mobileControlsUI.interactButton.addEventListener('pointercancel', cancelInteract)
mobileControlsUI.interactButton.addEventListener('lostpointercapture', cancelInteract)

mobileControlsUI.interactButton.addEventListener(
	'click',
	(event) => {
		// prevent a second synthetic phone click
		event.preventDefault()
		event.stopPropagation()
	}
)

// prevent a long press from opening the browser context menu.
mobileControlsUI.container.addEventListener(
	'contextmenu',
	(event) => {
		event.preventDefault()
	}
)


// show the mobile controls only during active exploration 
function syncTouchControlVisibility() {
	const explorationSceneIsActive =
		gameState.currentScene === 'world' || gameState.currentScene === 'interior'

	const shouldShow =
		touchControlState.enabled &&
		gameState.hasStarted &&
		explorationSceneIsActive

	mobileControlsUI.container.classList.toggle('is-hidden',!shouldShow)

	// stop active movement when controls are hidden
	if (!shouldShow && touchControlState.direction) {
		releaseTouchDirection()
		centerJoystickKnob()
	}
	window.requestAnimationFrame(syncTouchControlVisibility)
}

centerJoystickKnob()
syncTouchControlVisibility()

