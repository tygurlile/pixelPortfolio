// shared state used across the game's different scenes and systems
const gameState = {
	// which part of the game is currently active.
	currentScene: 'startup',

	hasStarted: false,
	audioUnlocked: false,

	settings: {
		battlesEnabled: true,
		musicEnabled: true,
		musicVolume: 0.10
	},

	// hubbles level
	playerProgress: {
		level: 6,
		startingLevel: 6,
		maxLevel: 12
	},

	world: {
		entranceLocked: false,
		battleCooldownUntil: 0
	},

	interior: {
		// id of building being explored
		activeId: null
	},

	transition: {
		active: false
	},

	battle: {
		active: false,
		phase: 'idle', // others include choosing, animating, dialogue, ending

		enemy: null,
		player: null,

		renderedSprites: [],
		queue: [],

		animationId: null
	},

	information: {
		active: false,
		contentId: null,
		returnScene: null
	}
}

