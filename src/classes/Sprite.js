// Base class for objects that are drawn using an image or sprite sheet.
class Sprite {
	constructor({
		position,
		image,
		frames = { max: 1, hold: 10 },
		sprites,
		animate = false,
		rotation = 0,
		scale = 1
	}) {
		this.position = { ...position }

		this.image = new Image()

		// tracks the current animation frame and how long each frame is shown
		this.frames = {
			...frames,
			val: 0,
			elapsed: 0,
			lastUpdatedAt: null
		}

		this.sourceWidth = 0
		this.sourceHeight = 0
		this.width = 0
		this.height = 0

		this.scale = scale
		this.animate = animate
		this.sprites = sprites
		this.opacity = 1
		this.rotation = rotation

		this.stretchX = 1
		this.stretchY = 1

		// calculate the size of one frame after the image finishes loading
		this.image.onload = () => {
			this.sourceWidth = this.image.width / this.frames.max
			this.sourceHeight = this.image.height

			this.width = this.sourceWidth * this.scale
			this.height = this.sourceHeight * this.scale
		}

		this.image.src = image.src
	}


	// draw the current frame 
	draw(context) {
		if (!this.width || !this.height) return

		context.save()

		const centerX = this.position.x + this.width / 2
		const centerY = this.position.y + this.height / 2

		context.translate(centerX, centerY)
		context.rotate(this.rotation)
		context.scale(this.stretchX, this.stretchY)
		context.translate(-centerX, -centerY)

		context.globalAlpha = this.opacity

		// only draw the current frame from the sprite sheet
		context.drawImage(
			this.image,
			this.frames.val * this.sourceWidth,
			0,
			this.sourceWidth,
			this.sourceHeight,
			this.position.x,
			this.position.y,
			this.width,
			this.height
		)

		context.restore()

		this.updateFrames()
	}


	// move to the next animation frame after the hold time is reached
	updateFrames() {
		const now = performance.now()

		if (!this.animate || this.frames.max <= 1) {
			this.frames.lastUpdatedAt = now
			return
		}

		const deltaFrames =
			this.frames.lastUpdatedAt === null
				? 1
				: Math.max(0.25,
						Math.min(2.5,
							(now - this.frames.lastUpdatedAt) / 16.67)
						)

		this.frames.lastUpdatedAt = now
		this.frames.elapsed += deltaFrames

		if (this.frames.elapsed < this.frames.hold) return

		const framesToAdvance = Math.floor(
			this.frames.elapsed / this.frames.hold
		)

		this.frames.elapsed %= this.frames.hold
		this.frames.val = (this.frames.val + framesToAdvance) % this.frames.max
	}
}
