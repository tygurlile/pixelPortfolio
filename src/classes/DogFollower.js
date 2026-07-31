// Hubble's movement, following behavior, roaming, 
// obstacle avoidance, and sitting animations.

class DogFollower extends Sprite {
	constructor({
		position,
		images,
		frames = {
			max: 4,
			hold: 7
		}
	}) {
		super({
			position,
			image: images.down,
			frames,
			sprites: images
		})

		this.images = images
		this.walkFrames = frames.max

		this.facing = 'down'
		this.state = 'sitting'

		this.target = {x: position.x, y: position.y}

		// position relative to the player.
		this.offset = {x: 0, y: 0}

		this.preferredSide = 'right'

		// randomly choose an initial direction for moving around obstacles
		this.detourSide = Math.random() < 0.5 ? -1 : 1

		// movement speed and timing information.
		this.speed = 1.6
		this.waitUntil = 0
		this.idleStartedAt = null
		this.lastUpdateAt = null
		this.wasPlayerMoving = false

		// track whether Hubble is blocked or no longer getting closer
		this.blockedFrames = 0
		this.noProgressFrames = 0
		this.lastDistance = Infinity

		// record users path so hubble can follow around obstacles
		this.playerTrail = []
		this.trailSpacing = 10
		this.trailReachDistance = 13
		this.maximumTrailPoints = 420

		this.sitDelayMilliseconds = 2000

		// distances used to control catch-up and return behavior
		this.catchUpDistance = 280
		this.catchUpFinishedDistance = 115
		this.heelApproachDistance = 105

		// range hubble can wander from the player
		this.roamMinimumDistance = 40
		this.roamMaximumDistance = 220

		this.roamMinimumSpeed = 1.2
		this.roamMaximumSpeed = 2

		// faster speeds used when Hubble needs to return
		this.catchUpSpeed = 3.6
		this.returnToSitSpeed = 2.5

		this.showSitImage()
	}


	random(minimum, maximum) {return (minimum +Math.random() * (maximum - minimum))}

	getWidth() {return this.width || 34}
	getHeight() {return this.height || 34}

	getImageSize(
		image,
		frameCount = 1
	) {
		return {
			width:
				image?.naturalWidth
					? image.naturalWidth /
						frameCount
					: this.getWidth(),

			height:
				image?.naturalHeight ||
				this.getHeight()
		}
	}


	// change hubbles's current image and update its frame dimensions
	useImage(
		image,
		frameCount,
		animate = false
	) {
		// reset animation frames if images or # of frames has changed
		if (
			this.image !== image ||
			this.frames.max !== frameCount
		) {
			this.image = image
			this.frames.max = frameCount
			this.frames.val = 0
			this.frames.elapsed = 0
			this.frames.lastUpdatedAt = null

			const resize = () => {
				// ignore a late load from an imagie hube is no longer using
				if (this.image !== image) return

				const size = this.getImageSize(image, frameCount)

				this.sourceWidth = size.width
				this.sourceHeight = size.height

				this.width = size.width * this.scale
				this.height = size.height * this.scale
			}

			if (
				image.complete &&image.naturalWidth
			) {
				resize()
			} else {
				image.addEventListener('load', resize, {once: true})
			}
		}
		this.animate = animate
	}


	// face a direction and maybe play the walking animation.
	face(
		direction,
		animate = false
	) {
		this.facing =
			this.images[direction]
				? direction
				: 'down'

		this.useImage(
			this.images[this.facing],
			this.walkFrames,
			animate
		)
	}

	// switch to hubble's sitting image.
	showSitImage() {
		this.facing = 'down'

		this.useImage(
			this.images.sit ||
				this.images.down,
			1,
			false
		)
	}

	// hubble is not a movable object 
	getMovableAnchors() {
		return []
	}

	setTarget(position) {
		this.target.x = position.x
		this.target.y = position.y

		this.resetObstacleTracking()
	}

	resetObstacleTracking() {
		this.blockedFrames = 0
		this.noProgressFrames = 0
		this.lastDistance = Infinity
	}

	getPlayerSize(player) {
		return {
			width: player.width || 48,
			height: player.height || 68
		}
	}

	getDistanceBetween(
		first,
		second
	) {
		return Math.hypot(first.x - second.x,first.y - second.y)
	}


	// Calculate the distance between the centers of Hubble and the player.
	getDistanceToPlayer(player) {
		const playerSize =
			this.getPlayerSize(player)

		const dogCenter = {
			x: this.position.x + this.getWidth() / 2,
			y: this.position.y + this.getHeight() / 2
		}

		const playerCenter = {
			x: player.position.x + playerSize.width / 2,
			y: player.position.y + playerSize.height / 2
		}

		return this.getDistanceBetween(
			dogCenter,
			playerCenter
		)
	}


	// create a slightly smaller collision box around Hubble.
	getCollisionRectangle(
		position = this.position,
		size = null
	) {
		const inset = 3

		const width = size?.width || this.getWidth()
		const height = size?.height || this.getHeight()

		return {
			position: {
				x: position.x + inset,
				y: position.y + inset
			},
			width: Math.max(1, width - inset * 2),
			height: Math.max(1, height - inset * 2)
		}
	}


	// check whether Hubble would overlap any collision boundary
	isBlocked(
		position,
		boundaries = [],
		size = null
	) {
		const rectangle =
			this.getCollisionRectangle(
				position,
				size
			)

		return boundaries.some(
			(boundary) => {
				return rectangularCollision({
					rectangle1: rectangle,
					rectangle2: boundary
				})
			}
		)
	}


	// check whether hubbles's next position would overlap the player.
	overlapsPlayer(
		position,
		player,
		size = null
	) {
		const playerSize = this.getPlayerSize(player)

		return rectangularCollision({
			rectangle1: this.getCollisionRectangle(position, size),

			rectangle2: {
				position: {
					x: player.position.x - 4,
					y: player.position.y - 4
				},
				width: playerSize.width + 8,
				height: playerSize.height + 8
			}
		})
	}


	// test several points between two positions to make sure
	// hubble can move there without crossing a boundary
	isPathClear(
		start,
		target,
		boundaries = [],
		size = null
	) {
		const deltaX = target.x - start.x
		const deltaY = target.y - start.y
		const distance = Math.hypot( deltaX, deltaY)

		if (distance <= 1) {return true}

		const stepCount = Math.max(1, Math.ceil(distance / 6))

		for (
			let index = 1;
			index <= stepCount;
			index += 1
		) {
			const progress = index / stepCount

			const position = {
				x: start.x + deltaX * progress,
				y: start.y + deltaY * progress
			}

			if (
				this.isBlocked(position, boundaries, size)
			) {
				return false
			}
		}
		return true
	}


	// recprd a trail  near the player's feet
	getPlayerTrailPoint(player) {
		const playerSize = this.getPlayerSize(player)

		return {
			x: player.position.x + playerSize.width / 2 - this.getWidth() / 2,
			y: player.position.y + playerSize.height - this.getHeight()
		}
	}


	// restart the trail using Hubble's current position
	// and the player's current position
	resetPlayerTrail(player) {
		this.playerTrail = [
			{
				x: this.position.x,
				y: this.position.y
			}
		]

		const playerPoint = this.getPlayerTrailPoint(player)

		if (
			this.getDistanceBetween(
				this.playerTrail[0],
				playerPoint
			) >= this.trailSpacing
		) {
			this.playerTrail.push(
				playerPoint
			)
		}
	}


	// move hubble, his target, and recorded trail points
	// by the same amount as the scene camera
	applyCameraMovement(cameraMovement) {
		const movement = {
			x: Number(cameraMovement?.x) || 0,

			y: Number(cameraMovement?.y) || 0
		}

		if (
			movement.x === 0 && movement.y === 0
		) {
			return
		}

		this.position.x += movement.x
		this.position.y += movement.y

		this.target.x += movement.x
		this.target.y += movement.y

		this.playerTrail.forEach(
			(point) => {
				point.x += movement.x
				point.y += movement.y
			}
		)
	}


	// add a new trail point after the player has moved far enough.
	recordPlayerTrail(
		player,
		playerMoved
	) {
		if (!playerMoved) {return}

		const point = this.getPlayerTrailPoint(player)

		const lastPoint = this.playerTrail[this.playerTrail.length - 1]

		if (
			!lastPoint || this.getDistanceBetween(
				lastPoint,
				point
			) >= this.trailSpacing
		) {
			this.playerTrail.push(point)
		}

		// remove old trail points once the maximum size is reached.
		if (
			this.playerTrail.length > this.maximumTrailPoints
		) {
			this.playerTrail.splice(0, this.playerTrail.length - this.maximumTrailPoints)
		}
	}


	// remove trail points that are already behind hubble.
	trimTrailToNearestPoint() {
		if (this.playerTrail.length <= 1) {return}

		let nearestIndex = 0
		let nearestDistance = Infinity

		this.playerTrail.forEach(
			(point, index) => {
				const distance = this.getDistanceBetween(this.position, point)

				if (distance < nearestDistance) {
					nearestDistance = distance
					nearestIndex = index
				}
			}
		)

		if (nearestIndex > 0) {
			this.playerTrail.splice(0, nearestIndex)
		}
	}


	// Select the next useful point from the player's recorded path
	getTrailTarget(boundaries) {
		// remove trail points Hubble has already reached.
		while (
			this.playerTrail.length > 1 &&
			this.getDistanceBetween(
				this.position,
				this.playerTrail[0]
			) <= this.trailReachDistance
		) {
			this.playerTrail.shift()
		}

		if (this.playerTrail.length === 0) {return null}

		
		// keeps Hubble following the player's route around
		// walls instead of aiming directly through them.
		const maximumSkipIndex = Math.min(this.playerTrail.length - 1, 8)

		for (
			let index = maximumSkipIndex;
			index > 0;
			index -= 1
		) {
			if (
				this.isPathClear(this.position, this.playerTrail[index], boundaries)
			) {
				this.playerTrail.splice(0, index)
				break
			}
		}
		return this.playerTrail[0]
	}


	// possible left- and right-side positions beside the player
	getSideOffsets(
		player,
		sitting = false
	) {
		const playerSize = this.getPlayerSize(player)

		const dogSize = sitting
			? this.getImageSize(
				this.images.sit || this.images.down
			)
			: {
				width: this.getWidth(),
				height: this.getHeight()
			}

		const sideY = playerSize.height - dogSize.height + 2
		const gap = sitting ? 2 : 18

		return {
			dogSize,
			right: {
				x: playerSize.width + gap,
				y: sideY
			},

			left: {
				x: -dogSize.width - gap,
				y: sideY
			}
		}
	}


	// find an open position beside the player.
	chooseNearbyOffset(
		player,
		boundaries,
		sitting = false,
		requireClearPath = false
	) {
		const sideData = this.getSideOffsets(player, sitting)

		const sideOrder =
			this.preferredSide === 'left'
				? ['left', 'right']
				: ['right','left']

		for (const side of sideOrder) {
			const offset = sideData[side]

			const position = {
				x: player.position.x + offset.x,
				y: player.position.y + offset.y
			}

			if (
				this.isBlocked(position, boundaries, sideData.dogSize) ||
				this.overlapsPlayer(position, player, sideData.dogSize)
			) {
				continue
			}

			if (
				requireClearPath &&
				!this.isPathClear(this.position, position, boundaries, sideData.dogSize)
			) {
				continue
			}

			this.preferredSide = side

			return {
				x: offset.x,
				y: offset.y
			}
		}
		return null
	}


	// Search for a random open location near the player.
	chooseOpenTarget(
		player,
		boundaries
	) {
		const playerSize = this.getPlayerSize(player)

		const center = {
			x: player.position.x + playerSize.width / 2,
			y: player.position.y + playerSize.height / 2
		}

		// try several random positions before giving up.
		for (
			let attempt = 0;
			attempt < 45;
			attempt += 1
		) {
			const angle = this.random(0,Math.PI * 2)
			const distance = this.random(this.roamMinimumDistance, this.roamMaximumDistance)

			const position = {
				x: center.x + Math.cos(angle) * distance - this.getWidth() / 2,                       
				y: center.y + Math.sin(angle) * distance - this.getHeight() / 2
			}

			if (
				!this.isBlocked(position, boundaries) &&
				!this.overlapsPlayer(position, player) &&
				this.isPathClear(this.position, position, boundaries)
			) {
				return position
			}
		}
		return null
	}


	// start either a short waiting period or a new roaming movement
	beginRoaming(
		player,
		boundaries,
		now
	) {
		this.resetObstacleTracking()

		// sometimes pause instead of immediately choosing a destination
		if (Math.random() < 0.2) {
			this.state = 'waiting'
			this.waitUntil = now + this.random(250, 1100)
			this.face(this.facing, false)
			return
		}

		const target = this.chooseOpenTarget(player, boundaries)

		// wait briefly when no reachable roaming target can be found.
		if (!target) {
			this.state = 'waiting'
			this.waitUntil = now + 400

			this.face(this.facing, false)
			return
		}

		this.state = 'roaming'
		this.speed = this.random(this.roamMinimumSpeed, this.roamMaximumSpeed)
		this.setTarget(target)
	}


	// switch to the faster trail-following state
	beginCatchUp() {
		this.state = 'catching-up'
		this.speed = this.catchUpSpeed

		this.trimTrailToNearestPoint()
		this.resetObstacleTracking()
	}

	beginReturningToSit(
		player,
		boundaries
	) {
		this.state = 'returning-to-sit'
		this.speed = this.returnToSitSpeed

		this.trimTrailToNearestPoint()

		this.offset =
			this.chooseNearbyOffset(player, boundaries, true, false) || 
			{x: 0, y: 0}

		this.resetObstacleTracking()
	}

	// rotate a movement
	rotate(vector, radians) {
		const cosine = Math.cos(radians)
		const sine = Math.sin(radians)

		return {
			x: vector.x * cosine - vector.y * sine,
			y: vector.x * sine + vector.y * cosine
		}
	}

	findOpenStep(
		desiredStep,
		target,
		boundaries
	) {

		// try turning to prefered detour then test opposite if needed
		const preferredAngles = [
			0,
			25 * this.detourSide,
			50 * this.detourSide,
			75 * this.detourSide,
			100 * this.detourSide,
			125 * this.detourSide
		]

		const oppositeAngles = [
			-25 * this.detourSide,
			-50 * this.detourSide,
			-75 * this.detourSide,
			-100 * this.detourSide,
			-125 * this.detourSide,
			180
		]

		const testAngles = [...preferredAngles, ...oppositeAngles]

		let bestCandidate = null
		let bestScore = Infinity

		for (const degrees of testAngles) {
			const candidate = this.rotate(desiredStep, degrees * Math.PI / 180)

			const position = {
				x: this.position.x + candidate.x,
				y: this.position.y + candidate.y
			}

			if (
				this.isBlocked(position, boundaries)
			) {
				continue
			}

			const remainingDistance = this.getDistanceBetween(position, target)

			// reward movement that gets closer to target without extra turns
			const score = remainingDistance + Math.abs(degrees) * 0.03

			if (score < bestScore) {
				bestScore = score
				bestCandidate = candidate
			}
		}
		return bestCandidate
	}

	// Move toward a target in small collision-checked steps.
	moveToward(
		target,
		speed,
		deltaFrames,
		boundaries
	) {
		if (!target) {
			this.face(this.facing, false)
			return false
		}

		let distance = this.getDistanceBetween(this.position, target)

		if (distance <= 1.5) {
			this.face(this.facing, false)
			return true
		}

		const startingPosition = {
			x: this.position.x,
			y: this.position.y
		}

		const totalMovement = Math.min(distance, speed * deltaFrames)

		
		// create smaller movements so hubble doesnt jump through some boundaries
		const stepCount = Math.max(1, Math.ceil(totalMovement / 2.5))

		let lastStep = null

		for (
			let index = 0;
			index < stepCount;
			index += 1
		) {
			const deltaX = target.x - this.position.x
			const deltaY = target.y - this.position.y
			distance = Math.hypot(deltaX, deltaY)

			if (distance <= 1.5) {break}

			const amount = Math.min(distance, totalMovement / stepCount)

			const desiredStep = {
				x: deltaX / distance * amount,
				y: deltaY / distance * amount
			}

			const step = this.findOpenStep(desiredStep, target, boundaries)

			if (!step) {
				this.blockedFrames += 1
				break
			}

			this.position.x += step.x
			this.position.y += step.y

			lastStep = step
			this.blockedFrames = 0
		}

		const remainingDistance = this.getDistanceBetween(this.position, target)
		const actualMovement = this.getDistanceBetween(this.position, startingPosition)

		// track whether hubble is making meaningful progress
		if (
			remainingDistance < this.lastDistance - 0.12 && actualMovement > 0.03
		) {
			this.noProgressFrames = 0
		} else {
			this.noProgressFrames += 1
		}

		this.lastDistance = remainingDistance

		if (lastStep) {
			const horizontal = Math.abs(lastStep.x) > Math.abs(lastStep.y)

			const direction = horizontal
				? (lastStep.x < 0 ? 'left' : 'right')
				: (lastStep.y < 0 ? 'up' : 'down')

			// use a faster animation rate during high-speed movement
			this.frames.hold = speed >= 5.5 ? 4 : 7
			this.face(direction,true)
		} else {
			this.face(this.facing, false)
		}
		return remainingDistance <= 1.5
	}

	hasBecomeStuck() {
		return (this.blockedFrames > 5 || this.noProgressFrames > 20)
	}

	recoverFromObstacle(
		player,
		boundaries,
		now
	) {
		this.resetObstacleTracking()

		if (this.state === 'roaming') {
			this.state = 'waiting'
			this.waitUntil = now + 350
			this.face(this.facing, false)
			return
		}

		if (this.state === 'catching-up') {
	
			// get rid of the part causing trouble and continue on the rest of the path
			if (this.playerTrail.length > 1) {this.playerTrail.shift()}

			this.detourSide *= -1
			return
		}

		if (this.state === 'returning-to-sit') {
			// Try sitting on the opposite side of the player.
			const alternateSide =
				this.preferredSide === 'left' ? 'right' : 'left'
			this.preferredSide = alternateSide

			const newOffset = this.chooseNearbyOffset(player, boundaries, true, true)

			if (newOffset) {
				this.offset = newOffset
				return
			}

			// if you cant reach any side, wait instead of moving along barrier
			this.state = 'waiting'
			this.waitUntil = now + 600
			this.face(this.facing,false)
		}
	}


	placeNearPlayer(
		player,
		facing = player.facing,
		boundaries = []
	) {
		player.facing = facing

		const offset = this.chooseNearbyOffset(player, boundaries, false, false) || 
			{
				x: this.getPlayerSize(player).width + 18,
				y: 0
			}

		this.offset = offset
		this.position.x = player.position.x + offset.x
		this.position.y = player.position.y + offset.y

		this.setTarget(this.position)

		this.state = 'waiting'
		this.waitUntil = 0
		this.idleStartedAt = null
		this.lastUpdateAt = null
		this.wasPlayerMoving = false

		this.resetPlayerTrail(player)
		this.face('down', false)
	}

	forceSitBeside(
		player,
		boundaries = []
	) {
		const offset = this.chooseNearbyOffset(player, boundaries, true, false) || 
			{
				x: this.getPlayerSize(player).width + 2,
				y: 0
			}

		this.offset = offset
		this.position.x = player.position.x + offset.x
		this.position.y = player.position.y + offset.y

		this.setTarget(this.position)

		this.state = 'sitting'
		this.idleStartedAt = null
		this.lastUpdateAt = null
		this.wasPlayerMoving = false

		this.resetPlayerTrail(player)
		this.showSitImage()
	}


	// follow the player's  path until hubble is close enough again
	updateCatchUp({
		player,
		boundaries,
		deltaFrames,
		speedMultiplier,
		now
	}) {
		if (
			this.getDistanceToPlayer(player) <= this.catchUpFinishedDistance
		) {
			this.state = 'waiting'
			this.waitUntil = now + 150
			this.resetObstacleTracking()
			this.face(this.facing,false)

			return
		}

		const target = this.getTrailTarget(boundaries)

		if (!target) {
			this.state = 'waiting'
			this.waitUntil = now + 250
			return
		}

		const reached = this.moveToward(
				target, 
				this.catchUpSpeed * speedMultiplier,
				deltaFrames,
				boundaries
			)

		if (
			reached && this.playerTrail.length > 1
		) {
			this.playerTrail.shift()
			this.resetObstacleTracking()
		}

		if (this.hasBecomeStuck()) {
			this.recoverFromObstacle(player, boundaries, now)
		}
	}

	updateReturnToSit({
		player,
		boundaries,
		deltaFrames,
		speedMultiplier,
		now
	}) {

		// if hubble is far away follow player trail before sitting
		if (
			this.getDistanceToPlayer(player) > this.heelApproachDistance
		) {
			const trailTarget = this.getTrailTarget(boundaries)

			if (trailTarget) {
				const reachedTrailPoint = this.moveToward(
						trailTarget,
						this.returnToSitSpeed * speedMultiplier,
						deltaFrames,
						boundaries
					)

				if (
					reachedTrailPoint && this.playerTrail.length > 1
				) {
					this.playerTrail.shift()
					this.resetObstacleTracking()
				}

				if (this.hasBecomeStuck()) {
					this.recoverFromObstacle(player, boundaries, now)
				}
				return
			}
		}

		// Find a reachable sitting position beside the player.
		const offset = this.chooseNearbyOffset(player, boundaries, true, true)

		if (!offset) {
			this.state = 'waiting'
			this.waitUntil = now + 500
			this.face(this.facing, false)
			return
		}

		this.offset = offset

		const target = {
			x: player.position.x + this.offset.x,
			y: player.position.y + this.offset.y
		}

		const reached = this.moveToward(
				target,
				this.returnToSitSpeed * speedMultiplier,
				deltaFrames,
				boundaries
			)

		if (this.hasBecomeStuck()) {
			this.recoverFromObstacle(player, boundaries, now)

			return
		}

		if (!reached) {return}

		// closing pixel gap
		this.position.x = target.x
		this.position.y = target.y

		this.setTarget(this.position)
		this.state = 'sitting'

		this.resetPlayerTrail(player)
		this.showSitImage()
	}

	updateRoaming({
		player,
		boundaries,
		deltaFrames,
		speedMultiplier,
		now
	}) {
		if (this.state === 'waiting') {
			if (now < this.waitUntil) {
				this.face(this.facing, false)
				return
			}

			this.beginRoaming(player, boundaries, now)

			if (this.state === 'waiting') {return}
		}

		// Start roaming when Hubble is not already in that state.
		if (this.state !== 'roaming') {
			this.beginRoaming(player, boundaries, now)

			if (this.state === 'waiting') {return}
		}

		const reached = this.moveToward(
				this.target,
				this.speed * speedMultiplier,
				deltaFrames,
				boundaries
			)

		// pause briefly after reaching  roaming destination
		if (reached) {
			this.state = 'waiting'
			this.waitUntil = now + this.random(200, 1000)
			this.face(this.facing, false)
			return
		}

		if (this.hasBecomeStuck()) {
			this.recoverFromObstacle(player, boundaries, now)
		}
	}

	// updating behavior
	update({
		player,
		movement = null,
		playerMoving = null,
		boundaries = [],
		speedMultiplier = 1,
		now = performance.now()
	}) {

		const normalizedMovement = movement &&
			typeof movement === 'object'
				? movement
				: {
					moved: Boolean(playerMoving),
					cameraMovement: {
						x: 0,
						y: 0
					}
				}

		// keep hubble and his path aligned with the moving map
		this.applyCameraMovement(normalizedMovement.cameraMovement)
		const playerActuallyMoved = Boolean(normalizedMovement.moved)
		this.recordPlayerTrail(player, playerActuallyMoved)

		// convert elapsed time into number of frames
		const deltaFrames =
			this.lastUpdateAt === null
				? 1
				: Math.max(0.25,
					Math.min(2.5, (now - this.lastUpdateAt) / 16.67)
				)

		this.lastUpdateAt = now
		this.animate = false

		const playerJustStarted = playerActuallyMoved && !this.wasPlayerMoving
		const playerJustStopped = !playerActuallyMoved && this.wasPlayerMoving

		this.wasPlayerMoving = playerActuallyMoved

		// leave the sitting state when the player begins moving
		if (playerJustStarted) {
			this.idleStartedAt = null

			if (
				this.state === 'sitting' || this.state === 'returning-to-sit'
			) {
				this.state = 'waiting'
				this.waitUntil = now + 100

				this.face(player.facing || this.facing, false)
			}
		}

		// track how long the player has remained still
		if (playerActuallyMoved) {
			this.idleStartedAt = null
		} else if (
			playerJustStopped || this.idleStartedAt === null
		) {
			this.idleStartedAt = now
		}

		// stay seated while both hubble and the player are idle
		if (
			!playerActuallyMoved && this.state === 'sitting'
		) {
			this.showSitImage()
			return
		}

		const shouldSit = !playerActuallyMoved &&
			this.idleStartedAt !== null &&
			now - this.idleStartedAt >= this.sitDelayMilliseconds

		if (shouldSit) {
			if (
				this.state !== 'returning-to-sit'
			) {
				this.beginReturningToSit(player, boundaries)
			}

			this.updateReturnToSit({player, boundaries, deltaFrames, speedMultiplier, now})
			return
		}

		// cancel the return-to-sit state when the player moves again
		if (
			this.state === 'returning-to-sit'
		) {
			this.state = 'waiting'
			this.waitUntil = now
			this.resetObstacleTracking()
		}

		// catch up when hubble falls too far behind the player
		if (
			this.getDistanceToPlayer(player) > this.catchUpDistance || this.state === 'catching-up'
		) {
			if (this.state !== 'catching-up') {this.beginCatchUp()}

			this.updateCatchUp({player, boundaries, deltaFrames, speedMultiplier, now})
			return
		}

		// otherwise, continue normal roaming behavior near the player
		this.updateRoaming({player, boundaries, deltaFrames, speedMultiplier, now})
	}
}
