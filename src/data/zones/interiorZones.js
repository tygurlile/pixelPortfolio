// Interior zone arrays grouped by building.

const interiorZones = {
	personal: {
		collision: personalBuildingCollision,
		exit: personalBuildingExit,
		information: [
			{
				data: personalBuildingInteraction,
				contentId: 'personal-overview',
				prompt: '[E / Space] View info'
			}
		]
	},

	work: {
		collision: workBuildingCollision,
		exit: workBuildingExit,
		information: [
			{
				data: workBuildingInteraction,
				contentId: 'work-overview',
				prompt: '[E / Space] View info'
			}
		]
	}
}
