// Loads game images before the player starts exploring.

const imagePreloadCache = new Map()

const fixedGameImageSources = [
	// Outdoor world
	'./images/basemap.png',
	'./images/foreground.png',

	// Battle background
	'./images/battle.png',

	// Lily
	'./characters/me/lily_up.png',
	'./characters/me/lily_down.png',
	'./characters/me/lily_left.png',
	'./characters/me/lily_right.png',

	// Hubble in the world
	'./characters/hubble/hubbleUp.png',
	'./characters/hubble/hubbleDown.png',
	'./characters/hubble/hubbleLeft.png',
	'./characters/hubble/hubbleRight.png',
	'./characters/hubble/hubbleSit.png',

	// hubble photos 
	'./images/hubble/lookingup.png',
	'./images/hubble/sleeping.png',
	'./images/hubble/waffle.png',
	'./images/hubble/walking.png'
]

const battleEffectImageSources = [
	'./attacks/lightBeam.png',
	'./attacks/cosmicJet.png',
	'./attacks/redshift.png',
	'./attacks/accretionDisk.png',

	'./attacks/recursion.png',
	'./attacks/baseCase.png',
	'./attacks/stackOverflow.png',
	'./attacks/memorize.png',

	'./attacks/optimize.png',
	'./attacks/infiniteLoop.png',
	'./attacks/runtimeError.png',
	'./attacks/runtimeSuccess.png',

	'./attacks/explore.png',
	'./attacks/hit.png',
	'./attacks/shield.png'
]

function isImageSource(value) {
	return (
		typeof value === 'string' &&
		/\.(png|jpg|jpeg|gif|webp)(?:[?#].*)?$/i.test(value)
	)
}

// Finds image paths stored inside nested data objects.
function collectImageSources(value, collectedSources = []) {
	if (Array.isArray(value)) {
		value.forEach((item) => {
			collectImageSources(
				item,
				collectedSources
			)
		})
		return collectedSources
	}

	if (
		!value || typeof value !== 'object'
	) {
		return collectedSources
	}

	Object.entries(value).forEach(
		([propertyName, propertyValue]) => {
			if (
				propertyName === 'src' &&
				isImageSource(propertyValue)
			) {
				collectedSources.push(
					propertyValue
				)
				return
			}
			collectImageSources(propertyValue,collectedSources)
		}
	)
	return collectedSources
}

function getInteriorImageSources() {
	return Object.values(
		window.interiorDefinitions || {}
	).flatMap((definition) => {
		return [
			definition.backgroundSource,
			definition.foregroundSource
		]
	})
}

function getMonsterImageSources() {
	if (typeof monsters === 'undefined') {
		return []
	}

	return collectImageSources(monsters)
}

function getPortfolioImageSources() {
	if (
		typeof informationContent ===
		'undefined'
	) {
		return []
	}

	return collectImageSources(
		informationContent
	)
}

function preloadImageSource(source) {
	if (!source) {
		return Promise.resolve(null)
	}

	if (imagePreloadCache.has(source)) {
		return imagePreloadCache.get(source)
	}

	const imagePromise = new Promise(
		(resolve, reject) => {
			const image = new Image()

			image.onload = async () => {

				// wait until browser has decoded image before ready
				if (
					typeof image.decode ===
					'function'
				) {
					try {
						await image.decode()
					} catch {
						// The normal load event is still enough.
					}
				}

				resolve(image)
			}

			image.onerror = () => {
				imagePreloadCache.delete(source)

				reject(
					new Error(
						`Could not preload image: ${source}`
					)
				)
			}

			image.src = source
		}
	)

	imagePreloadCache.set(
		source,
		imagePromise
	)

	return imagePromise
}

async function preloadGameImages() {
	const imageSources = [
		...fixedGameImageSources,
		...battleEffectImageSources,
		...getInteriorImageSources(),
		...getMonsterImageSources(),
		...getPortfolioImageSources()
	]

	// Prevent the same path from loading twice.
	const uniqueImageSources = [
		...new Set(
			imageSources.filter(Boolean)
		)
	]

	await Promise.all(
		uniqueImageSources.map(
			preloadImageSource
		)
	)

	return uniqueImageSources.length
}