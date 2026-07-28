// creating the world 

const MAP_COLUMNS = 70
const BATTLE_ENCOUNTER_RATE = 0.02

const offset = {
	x: -800,
	y: -600
}

// keep the player near the center of the screen while exploring
const WORLD_PLAYER_POSITION = {
	x: GAME_WIDTH / 2 - 192 / 4 / 2,
	y: GAME_HEIGHT / 2 - 68 / 2
}

function createImage(source) {
	const image = new Image()
	image.src = source
	return image
}

const mapImage = createImage('./images/basemap.png')
const foregroundImage = createImage('./images/foreground.png')
const playerUpImage = createImage('./characters/me/lily_up.png')
const playerDownImage = createImage('./characters/me/lily_down.png')
const playerLeftImage = createImage('./characters/me/lily_left.png')
const playerRightImage = createImage('./characters/me/lily_right.png')

const dogUpImage = createImage('./characters/hubble/hubbleUp.png')
const dogDownImage = createImage('./characters/hubble/hubbleDown.png')
const dogLeftImage = createImage('./characters/hubble/hubbleLeft.png')
const dogRightImage = createImage('./characters/hubble/hubbleRight.png')
const dogSitImage = createImage('./characters/hubble/hubbleSit.png')

const boundaries = createBoundariesFromLayer({
	data: collisions,
	columns: MAP_COLUMNS,
	offset
})

const battleZones = createBoundariesFromLayer({
	data: battleData,
	columns: MAP_COLUMNS,
	offset
})


const buildingEntranceZones = Object.entries(
	worldZones.buildingEntrances
).flatMap(([buildingId, layerData]) => {
	return createBoundariesFromLayer({
		data: layerData,
		columns: MAP_COLUMNS,
		offset,
		marker: 4816,
		metadata: {
			buildingId
		}
	})
})


const outdoorInformationZones = createInformationZoneGroup({
	definitions: [
		{
			data: worldZones.informationInteractions.signs.personal,
			contentId: 'personal-sign',
			prompt: '[E / Space] Read'
		},
		{
			data: worldZones.informationInteractions.signs.work,
			contentId: 'work-sign',
			prompt: '[E / Space] Read'
		},
		{
			data: worldZones.informationInteractions.signs.volunteer,
			contentId: 'volunteer-sign',
			prompt: '[E / Space] Read'
		},
		{
			data: worldZones.informationInteractions.volunteerBuildings,
			contentId: 'volunteer-overview',
			prompt: '[E / Space] View Info'
		}
	],
	columns: MAP_COLUMNS,
	offset,
	marker: 4816
})


const background = new Sprite({
	position: offset,
	image: mapImage
})

const foreground = new Sprite({
	position: offset,
	image: foregroundImage
})

const player = new Sprite({
	position: WORLD_PLAYER_POSITION,
	image: playerDownImage,
	frames: {
		max: 4,
		hold: 10
	},
	sprites: {
		up: playerUpImage,
		down: playerDownImage,
		left: playerLeftImage,
		right: playerRightImage
	}
})

player.facing = 'down'

const dogFollower = new DogFollower({
	position: {
		x: WORLD_PLAYER_POSITION.x + 60,
		y: WORLD_PLAYER_POSITION.y + 34
	},
	images: {
		up: dogUpImage,
		down: dogDownImage,
		left: dogLeftImage,
		right: dogRightImage,
		sit: dogSitImage
	}
})

dogFollower.forceSitBeside(player, boundaries)


function drawExplorationActors() {
	const actors = [player, dogFollower]

	actors
		.slice()
		.sort((firstActor, secondActor) => {
			return (
				firstActor.position.y + firstActor.height -
				(secondActor.position.y + secondActor.height)
			)
		})
		.forEach((actor) => {
			actor.draw(context)
		})
}

const movables = [
	background,
	foreground,
	...boundaries,
	...battleZones,
	...buildingEntranceZones,
	...outdoorInformationZones
]

// animation frames and callbacks provided by the main game file
let animationId = null
let lastWorldFrameTime = null
let encounterHandler = () => {}
let buildingEntranceHandler = () => {}
let informationHandler = () => {}

function initializeWorld({
	onBattleEncounter,
	onBuildingEntrance,
	onInformation
}) {
	encounterHandler = onBattleEncounter
	buildingEntranceHandler = onBuildingEntrance
	informationHandler = onInformation
}

function getWorldStartView() {
	return {
		x: background.position.x,
		y: background.position.y
	}
}


function startWorld() {
	if (animationId !== null) return
	gameState.currentScene = 'world'
	lastWorldFrameTime = null
	animationId = window.requestAnimationFrame(animateWorld)
}

function stopWorld() {
	resetInputState()
	hideInteractionPrompt()

	if (animationId === null) return

	window.cancelAnimationFrame(animationId)
	animationId = null
	lastWorldFrameTime = null
}


// reset player and hubble before returning to the outdoor world
function preparePlayerForWorld() {
	player.position.x = WORLD_PLAYER_POSITION.x
	player.position.y = WORLD_PLAYER_POSITION.y
	player.facing = 'down'
	player.image = player.sprites.down
	player.animate = false

	dogFollower.placeNearPlayer(player, 'down', boundaries)
}


function drawWorldFrame() {
	context.clearRect(0, 0, canvas.width, canvas.height)
	context.fillStyle = '#000'
	context.fillRect(0, 0, canvas.width, canvas.height)

	background.draw(context)

	boundaries.forEach((boundary) => {
		boundary.draw(context)
	})

	battleZones.forEach((battleZone) => {
		battleZone.draw(context)
	})

	buildingEntranceZones.forEach((entranceZone) => {
		entranceZone.draw(context)
	})

	outdoorInformationZones.forEach((informationZone) => {
		informationZone.draw(context)
	})

	drawExplorationActors()
	foreground.draw(context)
}


// return true only when the interaction opens a new scene or popup
function handleWorldInteraction() {
	const entranceZone = findInteractionZone(player, buildingEntranceZones)

	// prevents same doorway from triggering again immediately
	if (gameState.world.entranceLocked) {
		if (!entranceZone) {gameState.world.entranceLocked = false}

		hideInteractionPrompt()
		return false
	}

	if (entranceZone) {
		showInteractionPrompt('[E / Space] Enter')

		if (!consumeActionPress('interact')) {
			return false
		}

		gameState.world.entranceLocked = true
		hideInteractionPrompt()
		stopWorld()
		buildingEntranceHandler(entranceZone.buildingId)
		return true
	}

	const informationZone = findInformationZone({player, zones: outdoorInformationZones})

	if (informationZone) {
		showInteractionPrompt(informationZone.prompt)

		if (!consumeActionPress('interact')) {
			return false
		}
		hideInteractionPrompt()
		stopWorld()
		informationHandler(informationZone.contentId, 'world')
		return true
	}
	hideInteractionPrompt()
	return false
}


function animateWorld(timestamp) {
	animationId = window.requestAnimationFrame(animateWorld)

	const deltaFrames =
		lastWorldFrameTime === null
			? 1
			: Math.max(
					0.25,
					Math.min(
						2.5,
						(timestamp - lastWorldFrameTime) / 16.67
					)
				)

	lastWorldFrameTime = timestamp

	drawWorldFrame()

	if (gameState.battle.active) {
		clearActionPresses()
		return
	}
	if (handleWorldInteraction()) return

	if (shouldStartBattle(deltaFrames)) {
		gameState.battle.active = true
		stopWorld()
		encounterHandler()
		return
	}

	const movement = moveWorld({
		player,
		boundaries,
		movables,
		cameraTarget: background,
		playerAnchor: WORLD_PLAYER_POSITION,
		deltaFrames
	})

	dogFollower.update({
		player,
		movement,
		boundaries,
		speedMultiplier: 1
	})

	clearActionPresses()
}

function shouldStartBattle(deltaFrames = 1) {
	if (!gameState.settings.battlesEnabled) return false

	if (Date.now() < gameState.world.battleCooldownUntil) {
		return false
	}

	if (!isMovementInputPressed()) return false
	if (!player.width || !player.height) return false

	const encounterProbability = 1 - Math.pow(1 - BATTLE_ENCOUNTER_RATE, deltaFrames)
	return battleZones.some((battleZone) => {
		const playerTouchesBattleZone = rectangularCollision({
			rectangle1: player,
			rectangle2: battleZone
		})

		if (!playerTouchesBattleZone) return false

		const overlappingArea = calculateOverlapArea(player, battleZone)

		// require at least half of the player sprite to be inside the zone.
		const minimumArea = (player.width * player.height) / 2
		const enoughOverlap = overlappingArea > minimumArea

		const randomEncounterOccurred = Math.random() < encounterProbability
		return enoughOverlap && randomEncounterOccurred
	})
}
