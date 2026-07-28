// creates info zones from a flattened map layer
// the content id allows it to open the correct panel
function createInformationZones({
	data,
	columns,
	offset,
	marker,
	contentId,
	prompt = '[E / Space] Interact'
}) {

	const zones = createBoundariesFromLayer({data, columns, offset, marker})

	zones.forEach((zone) => {
		zone.contentId = contentId
		zone.prompt = prompt
	})
	return zones
}

// creates information zones from several map layers and combines them into one list
function createInformationZoneGroup({definitions, columns, offset, marker
}) {
	return definitions.flatMap(
		(definition) => {
			return createInformationZones({...definition, columns, offset, marker})
		}
	)
}

// returns info zone intersecting the player
function findInformationZone({player, zones}) {
	return findInteractionZone(player, zones)
}