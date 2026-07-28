// collision used by movement, interaction, battle systems

// determines whether two rectangular areas touch or overlap
function rectangularCollision({ rectangle1, rectangle2 }) {
	return (
		rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
		rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
		rectangle1.position.y <= rectangle2.position.y + rectangle2.height &&
		rectangle1.position.y + rectangle1.height >= rectangle2.position.y
	)
}

// returns 0 when the rectangles do not overlap
// systems compare returned value against other values to keep edge contact from triggering events
function calculateOverlapArea(rectangle1, rectangle2) {
	const overlapWidth =
		Math.min(
			rectangle1.position.x + rectangle1.width,
			rectangle2.position.x + rectangle2.width
		) -
		Math.max(rectangle1.position.x, rectangle2.position.x)

	const overlapHeight =
		Math.min(
			rectangle1.position.y + rectangle1.height,
			rectangle2.position.y + rectangle2.height
		) -
		Math.max(rectangle1.position.y, rectangle2.position.y)

	return Math.max(0, overlapWidth) * Math.max(0, overlapHeight)
}
