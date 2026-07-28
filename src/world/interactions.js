// interaction area in front of player based on direction theyre facing
function getPlayerInteractionRectangle(player) {
	const facing = player.facing || 'down'

	const horizontalInset = Math.max(6, player.width * 0.2)
	const verticalInset = Math.max(8, player.height * 0.28)
	const interactionDepth = 48

	if (facing === 'up') {
		return {
			position: {
				x: player.position.x + horizontalInset,
				y: player.position.y - interactionDepth + 10
			},
			width: player.width - horizontalInset * 2,
			height: interactionDepth
		}
	}

	if (facing === 'down') {
		return {
			position: {
				x: player.position.x + horizontalInset,
				y: player.position.y + player.height - 10
			},
			width: player.width - horizontalInset * 2,
			height: interactionDepth
		}
	}

	if (facing === 'left') {
		return {
			position: {
				x: player.position.x - interactionDepth + 10,
				y: player.position.y + verticalInset
			},
			width: interactionDepth,
			height: player.height - verticalInset * 2
		}
	}

	return {
		position: {
			x: player.position.x + player.width - 10,
			y: player.position.y + verticalInset
		},
		width: interactionDepth,
		height: player.height - verticalInset * 2
	}
}


function findInteractionZone(player, zones) {

	if (!player.width || !player.height) {
		return null
	}

	const interactionRectangle = getPlayerInteractionRectangle(player)

	// return first zone that overlaps the player's interaction area
	return (
		zones.find((zone) => {
			return rectangularCollision({
				rectangle1: interactionRectangle,
				rectangle2: zone
			})
		}) || null
	)
}