// creating the interiors of the buildings

window.interiorDefinitions = {
	personal: {
		id: 'personal',
		name: 'Personal Building',

		backgroundSource:
			'./images/personalBuilding.png',

		foregroundSource:
			'./images/personalBuildingForeground.png',

		columns: 16,
		marker: 3329,
		zones: interiorZones.personal
	},

	work: {
		id: 'work',
		name: 'Work Building',

		backgroundSource:
			'./images/workBuilding.png',

		foregroundSource:
			'./images/workBuildingForeground.png',

		columns: 16,
		marker: 2049,
		zones: interiorZones.work
	}
}