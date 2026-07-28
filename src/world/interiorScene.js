// how the interiors are generated 

const INTERIOR_IMAGE_SIZE = 768

const INTERIOR_START_OFFSET = {
	x: (GAME_WIDTH - INTERIOR_IMAGE_SIZE) / 2,
	y: GAME_HEIGHT - INTERIOR_IMAGE_SIZE
}

// keep the player near the bottom-center of the screen while moving indoors
const INTERIOR_PLAYER_POSITION = {
	x: GAME_WIDTH / 2 - 192 / 4 / 2,
	y: GAME_HEIGHT - 150
}

// store the current animation frame and callbacks from the main game file
let interiorAnimationId = null
let lastInteriorFrameTime = null
let interiorExitHandler = () => {}
let interiorInformationHandler = () => {}

let activeInteriorDefinition = null

let interiorBackground = null
let interiorForeground = null
let interiorBoundaries = []
let interiorExitZones = []
let interiorInformationZones = []
let interiorMovables = []


function initializeInteriors({
	onExit,
	onInformation
}) {
	interiorExitHandler = onExit
	interiorInformationHandler = onInformation
}

function getInteriorMovementBoundaries() {
	return [...interiorBoundaries, ...interiorExitZones]
}


function createInteriorScene(definition) {
	const sceneOffset = {...INTERIOR_START_OFFSET}
	const backgroundImage = createImage(definition.backgroundSource)
	const foregroundImage = createImage(definition.foregroundSource)

	interiorBackground = new Sprite({
		position: sceneOffset,
		image: backgroundImage
	})

	interiorForeground = new Sprite({
		position: sceneOffset,
		image: foregroundImage
	})

	interiorBoundaries = createBoundariesFromLayer({
		data: definition.zones.collision,
		columns: definition.columns,
		offset: sceneOffset,
		marker: definition.marker
	})

	interiorExitZones = createBoundariesFromLayer({
		data: definition.zones.exit,
		columns: definition.columns,
		offset: sceneOffset,
		marker: definition.marker
	})

	interiorInformationZones = createInformationZoneGroup({
		definitions: definition.zones.information || [],
		columns: definition.columns,
		offset: sceneOffset,
		marker: definition.marker
	})

	interiorMovables = [
		interiorBackground,
		interiorForeground,
		...interiorBoundaries,
		...interiorExitZones,
		...interiorInformationZones
	]
}

function preparePlayerForInterior() {
	player.position.x = INTERIOR_PLAYER_POSITION.x
	player.position.y = INTERIOR_PLAYER_POSITION.y

	player.facing = 'up'
	player.image = player.sprites.up
	player.animate = false
	player.frames.val = 0
	player.frames.elapsed = 0

	dogFollower.placeNearPlayer(player, 'up', getInteriorMovementBoundaries())
}


function startInterior(interiorId) {
	if (interiorAnimationId !== null) {return}

	const definition = window.interiorDefinitions?.[interiorId]

	activeInteriorDefinition = definition
	gameState.interior.activeId = interiorId

	createInteriorScene(definition)
	preparePlayerForInterior()

	gameState.currentScene = 'interior'

	lastInteriorFrameTime = null
	interiorAnimationId = window.requestAnimationFrame(animateInterior)
}


function stopInterior() {
	resetInputState()
	hideInteractionPrompt()

	if (interiorAnimationId === null) {return}
	window.cancelAnimationFrame(interiorAnimationId)
	interiorAnimationId = null
	lastInteriorFrameTime = null
}

function pauseInterior() {
	stopInterior()
}


function resumeInterior() {
	if (!activeInteriorDefinition) {return}
	if (interiorAnimationId !== null) {return}

	gameState.currentScene = 'interior'
	lastInteriorFrameTime = null
	interiorAnimationId = window.requestAnimationFrame(animateInterior)
}

function resetInteriorScene() {
	stopInterior()

	activeInteriorDefinition = null
	interiorBackground = null
	interiorForeground = null
	interiorBoundaries = []
	interiorExitZones = []
	interiorInformationZones = []
	interiorMovables = []

	gameState.interior.activeId = null
	preparePlayerForWorld()
}

function drawInteriorFrame() {
	context.clearRect(0, 0, canvas.width, canvas.height)
	context.fillStyle = '#000'
	context.fillRect(0, 0, canvas.width, canvas.height)

	if (
		!interiorBackground || !interiorForeground
	) {
		return
	}

	interiorBackground.draw(context)

	interiorBoundaries.forEach(
		(boundary) => {
			boundary.draw(context)
		}
	)

	interiorExitZones.forEach(
		(exitZone) => {
			exitZone.draw(context)
		}
	)

	interiorInformationZones.forEach(
		(informationZone) => {
			informationZone.draw(context)
		}
	)

	drawExplorationActors()
	interiorForeground.draw(context)
}


function handleInteriorInteraction() {
	const exitZone = findInteractionZone(player, interiorExitZones)

	if (exitZone) {
		showInteractionPrompt('[E / Space] exit')

		// keep displaying the prompt until the player presses interact
		if (
			!consumeActionPress('interact')
		) {
			return false
		}

		const interiorId = gameState.interior.activeId

		hideInteractionPrompt()
		stopInterior()

		interiorExitHandler(interiorId)

		return true
	}

	const informationZone =
		findInformationZone({
			player,
			zones: interiorInformationZones
		})

	if (informationZone) {
		showInteractionPrompt(informationZone.prompt)

		if (
			!consumeActionPress('interact')
		) {
			return false
		}

		hideInteractionPrompt()
		pauseInterior()

		interiorInformationHandler(informationZone.contentId, 'interior')
		return true
	}

	hideInteractionPrompt() // when player is not near
	return false
}


// update movement, hubble, interactions, and drawing for each frame
function animateInterior(timestamp) {
	interiorAnimationId = window.requestAnimationFrame(animateInterior)

	const deltaFrames =
		lastInteriorFrameTime === null
			? 1
			: Math.max(0.25, Math.min(2.5, 
				(timestamp - lastInteriorFrameTime) / 16.67)
			)

	lastInteriorFrameTime = timestamp

	if (handleInteriorInteraction()) {return}

	const movementBoundaries = getInteriorMovementBoundaries()

	const movement = moveWorld({
		player,
		boundaries: movementBoundaries,
		movables: interiorMovables,
		cameraTarget: interiorBackground,
		playerAnchor: INTERIOR_PLAYER_POSITION,
		speedMultiplier: 1.4,
		deltaFrames
	})

	dogFollower.update({
		player,
		movement,
		boundaries: movementBoundaries,
		speedMultiplier: 1
	})

	drawInteriorFrame()
	clearActionPresses()
}