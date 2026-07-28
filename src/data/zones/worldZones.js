// Outdoor zone arrays grouped by how the player uses them.

const worldZones = {
	buildingEntrances: {
		personal: enterPersonalBuilding,
		work: enterWorkBuilding
	},

	informationInteractions: {
		volunteerBuildings: volunteerBuildingsInteraction,

		signs: {
			personal: personalSign,
			volunteer: volunteerSign,
			work: workSign
		}
	}
}
