// Represent one collision tile on the map.
class Boundary {
	static width = 48
	static height = 48

	constructor({ position }) {
		this.position = { ...position }

		this.width = Boundary.width
		this.height = Boundary.height
	}

	// draw the boundary rectangle for collision debugging
	draw(context) {
		context.fillStyle = 'rgba(255, 0, 0, 0)'

		context.fillRect(
			this.position.x,
			this.position.y,
			this.width,
			this.height
		)
	}
}

