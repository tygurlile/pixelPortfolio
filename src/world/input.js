
// shared input state used by keyboard and virtual controls
// movement and action values are inputs currently being held
const inputState = {
	movement: {
		up: false,
		down: false,
		left: false,
		right: false
	},
	actions: {
		interact: false
	},
	// stores inputs that should only be handled once
	actionPresses: {
		interact: false
	}
}

// tracks order in which movement directions were pressed, with most recent as priority
let movementPressOrder = [] 

const keyboardBindings = {
	KeyW: {type: 'movement', name: 'up'},
	ArrowUp: {type: 'movement', name: 'up'},

	KeyA: {type: 'movement', name: 'left'},
	ArrowLeft: {type: 'movement', name: 'left'},

	KeyS: {type: 'movement', name: 'down'},
	ArrowDown: {type: 'movement', name: 'down'},

	KeyD: {type: 'movement', name: 'right'},
	ArrowRight: {type: 'movement', name: 'right'},

	KeyE: {type: 'action', name: 'interact'},
	Space: {type: 'action', name: 'interact'}
}

function canAcceptGameplayInput() {
	return (
		gameState.currentScene === 'world' ||
		gameState.currentScene === 'interior'
	)
}

function setMovementInput(direction, isPressed) {
	if (
		!Object.prototype.hasOwnProperty.call(
			inputState.movement,
			direction
		)
	) {
		return
	}

	const pressed = Boolean(isPressed)
	inputState.movement[direction] = pressed

	// remove previous entry before optionally restoring it as most recent
	movementPressOrder =
		movementPressOrder.filter(
			(savedDirection) =>
				savedDirection !== direction
		)
	if (pressed) {movementPressOrder.push(direction)}
}

// tracks held buttons and only triggers an action when the button is first pressed
function setActionInput(action, isPressed) {
	if (
		!Object.prototype.hasOwnProperty.call(
			inputState.actions,
			action
		)
	) {
		return
	}

	const pressed = Boolean(isPressed)
	const wasAlreadyPressed = inputState.actions[action]

	inputState.actions[action] = pressed

	// register only the transition from released to pressed.
	if (pressed && !wasAlreadyPressed) {
		inputState.actionPresses[action] = true
	}
}


// returns the most recently pressed movement direction that remains held
function getActiveMovementDirection() {
	for (
		let index = movementPressOrder.length - 1;
		index >= 0;
		index -= 1
	) {
		const direction = movementPressOrder[index]

		if (inputState.movement[direction]) {
			return direction
		}
	}
	return null
}

function isMovementInputPressed() {
	return Object.values(
		inputState.movement
	).some(Boolean)
}

function isActionInputPressed(action) {
	return Boolean(
		inputState.actions[action]
	)
}

function consumeActionPress(action) {
	if (!inputState.actionPresses[action]) {
		return false
	}

	inputState.actionPresses[action] = false
	return true
}

function clearActionPresses() {
	Object.keys(inputState.actionPresses).forEach((action) => {
		inputState.actionPresses[action] = false
	})
}

function resetInputState() {
	Object.keys(inputState.movement).forEach((direction) => {
		inputState.movement[direction] = false
	})

	Object.keys(inputState.actions).forEach((action) => {
		inputState.actions[action] = false
	})
	clearActionPresses()
	movementPressOrder = []

	if (typeof window.resetVirtualControls === 'function') {
		window.resetVirtualControls()
	}
}

function handleKeyboardInput(event, isPressed) {
	const binding = keyboardBindings[event.code]

	if (!binding) return

	// ignore new input while menus, battles, or other scenes own the controls
	if (isPressed && !canAcceptGameplayInput()) {return}

	// prevent movement keys and space from scrolling the browser page
	event.preventDefault()

	if (binding.type === 'movement') {
		setMovementInput(binding.name, isPressed)
		return
	}

	if (binding.type === 'action') {
		setActionInput(binding.name, isPressed)
	}
}

window.addEventListener('keydown', (event) => {handleKeyboardInput(event, true)})
window.addEventListener('keyup', (event) => {handleKeyboardInput(event, false)})
window.addEventListener('blur',resetInputState)

// release active inputs when the page moves into the background.
document.addEventListener(
	'visibilitychange',
	() => {
		if (document.hidden) {
			resetInputState()
		}
	}
)

// clears exploration controls during scene or gameplay-state transitions.
function clearExplorationInput() {
	resetInputState()
}
