//  movement speed used for all four directions.
const movementSpeed = 5


// sprite and movement values for each direction.
const directionSettings = {
	up: {
		sprite: 'up',
		playerMovement: {
			x: 0,
			y: -movementSpeed
		}
	},

	left: {
		sprite: 'left',
		playerMovement: {
			x: -movementSpeed,
			y: 0
		}
	},

	down: {
		sprite: 'down',
		playerMovement: {
			x: 0,
			y: movementSpeed
		}
	},

	right: {
		sprite: 'right',
		playerMovement: {
			x: movementSpeed,
			y: 0
		}
	}
}

function clampMovementValue(
	value,
	minimum,
	maximum
) {
	return Math.max(minimum,Math.min(maximum, value))
}


// calculate how far the camera can move along one axis
function getCameraAxisLimits(
	contentSize,
	viewportSize
) {

	// if the map is smaller than the viewpoint, keep the map centered instead of scrolling
	if (contentSize <= viewportSize) {
		const centeredPosition = (viewportSize - contentSize) / 2
		return {
			minimum: centeredPosition,
			maximum: centeredPosition
		}
	}

	return {
		minimum: viewportSize - contentSize,
		maximum: 0
	}
}


// divide movement between the player and camera along one axis.
function splitAxisMovement({
	playerPosition,
	anchorPosition,
	requestedPlayerMovement,
	cameraPosition,
	cameraMinimum,
	cameraMaximum
}) {
	let playerMovement = 0
	let remainingMovement = requestedPlayerMovement


	// if player moved away from normal screen near map edge, move back before scrolling
	if (
		remainingMovement > 0 && playerPosition < anchorPosition
	) {
		const movementToAnchor = Math.min(
			remainingMovement, 
			anchorPosition - playerPosition
		)

		playerMovement += movementToAnchor
		remainingMovement -= movementToAnchor
	} else if (
		remainingMovement < 0 && playerPosition > anchorPosition
	) {
		const movementToAnchor = Math.max(
			remainingMovement, 
			anchorPosition - playerPosition
		)

		playerMovement += movementToAnchor
		remainingMovement -= movementToAnchor
	}

	// move camera as far as possible without passing map limits
	const nextCameraPosition = clampMovementValue(
			cameraPosition - remainingMovement,
			cameraMinimum,
			cameraMaximum
		)

	const cameraMovement = nextCameraPosition - cameraPosition
	const movementHandledByCamera = -cameraMovement

	// any movement the camera cannot handle is applied to player
	remainingMovement -= movementHandledByCamera
	playerMovement += remainingMovement

	return {
		playerMovement,
		cameraMovement
	}
}


// adjust player movement so the sprite stays inside the visible map area
function keepPlayerInsideVisibleMap({
	player,
	cameraTarget,
	cameraMovement,
	playerMovement
}) {
	const nextMapPosition = {
		x: cameraTarget.position.x + cameraMovement.x,
		y: cameraTarget.position.y + cameraMovement.y
	}

	// find section of the map that will remain visible after movement
	const visibleLeft = Math.max(0, nextMapPosition.x)
	const visibleRight = Math.min(GAME_WIDTH, nextMapPosition.x + cameraTarget.width)
	const visibleTop = Math.max(0, nextMapPosition.y)
	const visibleBottom = Math.min(GAME_HEIGHT, nextMapPosition.y + cameraTarget.height)

	// look for the player's size when finding the usable area
	const maximumPlayerX = Math.max(visibleLeft, visibleRight - player.width)
	const maximumPlayerY = Math.max(visibleTop, visibleBottom - player.height)

	const nextPlayerX = clampMovementValue(
		player.position.x + playerMovement.x,
		visibleLeft,
		maximumPlayerX
	)

	const nextPlayerY = clampMovementValue(
		player.position.y + playerMovement.y,
		visibleTop,
		maximumPlayerY
	)

	// return the corrected amount the player should move
	return {
		x: nextPlayerX - player.position.x,
		y: nextPlayerY - player.position.y
	}
}

function createMovementResult({
	moved = false,
	blocked = false,
	direction = null,
	cameraMovement = {
		x: 0,
		y: 0
	},
	playerMovement = {
		x: 0,
		y: 0
	}
} = {}) {
	return {
		moved,
		blocked,
		direction,
		cameraMovement,
		playerMovement
	}
}

// process player movement, camera scrolling, and collision checks
function moveWorld({
	player,
	boundaries,
	movables,
	cameraTarget,
	playerAnchor,
	speedMultiplier = 1,
	deltaFrames = 1
}) {
	player.animate = false
	const activeDirection = getActiveMovementDirection()

	if (!activeDirection) {
		return createMovementResult()
	}

	const direction = directionSettings[activeDirection]

	if (!direction) {
		return createMovementResult()
	}

	player.facing = activeDirection
	player.image = player.sprites[direction.sprite]

	if (
		!player.width ||
		!player.height ||
		!cameraTarget?.width ||
		!cameraTarget?.height
	) {
		return createMovementResult({
			direction: activeDirection
		})
	}

	// apply the scene-specific speed multiplier to the movement.

	const frameScale = Math.max(0.25, Math.min(2.5, deltaFrames))
	const requestedPlayerMovement = {
		x: direction.playerMovement.x * speedMultiplier * frameScale,
		y: direction.playerMovement.y * speedMultiplier * frameScale
	}

	const horizontalCameraLimits = getCameraAxisLimits(cameraTarget.width, GAME_WIDTH)
	const verticalCameraLimits = getCameraAxisLimits(cameraTarget.height, GAME_HEIGHT)

	// decide how horizontal movement should be split between player and camera
	const horizontalMovement =
		splitAxisMovement({
			playerPosition: player.position.x,
			anchorPosition: playerAnchor.x,
			requestedPlayerMovement: requestedPlayerMovement.x,

			cameraPosition: cameraTarget.position.x,
			cameraMinimum: horizontalCameraLimits.minimum,
			cameraMaximum: horizontalCameraLimits.maximum
		})

	// decide how vertical movement should be split between player and camera
	const verticalMovement =
		splitAxisMovement({
			playerPosition: player.position.y,
			anchorPosition: playerAnchor.y,
			requestedPlayerMovement: requestedPlayerMovement.y,

			cameraPosition: cameraTarget.position.y,
			cameraMinimum: verticalCameraLimits.minimum,
			cameraMaximum: verticalCameraLimits.maximum
		})

	const cameraMovement = {
		x: horizontalMovement.cameraMovement,
		y: verticalMovement.cameraMovement
	}

	let playerMovement = {
		x: horizontalMovement.playerMovement,
		y: verticalMovement.playerMovement
	}

	// prevent player from moving outside the visible part of the map
	playerMovement = keepPlayerInsideVisibleMap({
			player,
			cameraTarget,
			cameraMovement,
			playerMovement
		})

	// check players next position against boundaries 
	const movementBlocked =
		boundaries.some((boundary) => {
			return rectangularCollision({
				rectangle1: {
					position: {
						x: player.position.x + playerMovement.x,
						y: player.position.y + playerMovement.y
					},
					width: player.width,
					height: player.height
				},

				rectangle2: {
					position: {
						x: boundary.position.x + cameraMovement.x,
						y: boundary.position.y + cameraMovement.y
					},
					width: boundary.width,
					height: boundary.height
				}
			})
		})

	// cancel movement if next position would cause a collision
	if (movementBlocked) {
		return createMovementResult({
			blocked: true,
			direction: activeDirection
		})
	}

	const worldActuallyMoved = cameraMovement.x !== 0 || cameraMovement.y !== 0
	const playerActuallyMoved = playerMovement.x !== 0 || playerMovement.y !== 0

	// return without animating if neither the map nor player can move
	if (
		!worldActuallyMoved && !playerActuallyMoved
	) {
		return createMovementResult({direction: activeDirection})
	}

	// apply camera movement to every object connected to the map
	movables.forEach((movable) => {
		movable.position.x += cameraMovement.x
		movable.position.y += cameraMovement.y
	})

	// apply any remaining movement directly to player
	player.position.x += playerMovement.x
	player.position.y += playerMovement.y
	player.animate = true

	return createMovementResult({
		moved: true,
		direction: activeDirection,
		cameraMovement,
		playerMovement
	})
}
