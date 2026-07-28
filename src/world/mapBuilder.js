// split a 1d tiled player into rows that match # of columns used by map
function chunkLayer(data, columns) {
	const rows = []

	for (let index = 0; index < data.length; index += columns) {
		rows.push(data.slice(index, index + columns))
	}

	return rows
}

// convert marked tiles from a map layer into boundary objects
function createBoundariesFromLayer({
	data,
	columns,
	offset,
	marker = 4816,
	metadata = {}
}) {
	const rows = chunkLayer(data, columns)
	const boundaries = []

	// check each tile and create a boundary wherever the marker appears
	rows.forEach((row, rowIndex) => {
		row.forEach((symbol, columnIndex) => {
			if (symbol !== marker) return

			const boundary = new Boundary({
				position: {
					x: columnIndex * Boundary.width + offset.x,
					y: rowIndex * Boundary.height + offset.y
				}
			})

			Object.assign(boundary, metadata)
			boundaries.push(boundary)
		})
	})
	return boundaries
}

