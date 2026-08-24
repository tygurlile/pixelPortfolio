// every monster that can appear in battle

const monsters = {
	hubble: {
		position: {
			x: 280,
			y: 280
		},
		image: {
			src: './characters/hubble/hubbleBattle.png'
		},
		frames: {
			max: 4,
			hold: 60
		},
		animate: true,
		isEnemy: false,
		name: 'Hubble',
		level: 6,
		baseLevel: 6,
		maxHealth: 100,
		healthPerLevel: 8,
		attackScalePerLevel: 0.10,
		attacks: [
			attacks.Pounce,
			attacks.Howl,
			attacks.Zoomies,
			attacks.GoodBoy
		]
	},

	quasaur: {
		position: {
			x: 720,
			y: 40
		},
		image: {
			src: './characters/quasaur.png'
		},
		frames: {
			max: 4,
			hold: 24
		},
		scale: 1.45,
		animate: true,
		isEnemy: true,
		name: 'Quasaur',
		level: 8,
		baseLevel: 8,
		maxHealth: 120,
		healthPerLevel: 8,
		attackScalePerLevel: 0.10,
		encounterChance: 30,
		attacks: [
			attacks.LightBeam,
			attacks.jet,
			attacks.Redshift,
			attacks.AccretionDisk
		]
	},

	recursaur: {
		position: {
			x: 740,
			y: 25
		},
		image: {
			src: './characters/recursaur.png'
		},
		frames: {
			max: 4,
			hold: 10
		},
		scale: 1.5,
		animate: true,
		isEnemy: true,
		name: 'Recursaur',
		level: 8,
		baseLevel: 8,
		maxHealth: 110,
		healthPerLevel: 8,
		attackScalePerLevel: 0.10,
		encounterChance: 25,
		attacks: [
			attacks.RecursiveCall,
			attacks.BaseCase,
			attacks.StackOverflow,
			attacks.Memorize
		]
	},

	algorythm: {
		position: {
			x: 792,
			y: 25
		},
		image: {
			src: './characters/algorythm.png'
		},
		frames: {
			max: 4,
			hold: 5
		},
		scale: 1,
		animate: true,
		isEnemy: true,
		name: 'Algorythm',
		level: 8,
		baseLevel: 8,
		maxHealth: 100,
		healthPerLevel: 8,
		attackScalePerLevel: 0.10,
		encounterChance: 25,
		attacks: [
			attacks.BinarySearch,
			attacks.Optimize,
			attacks.InfiniteLoop,
			attacks.RuntimeAnalysis
		]
	},

	optune: {
		position: {
			x: 750,
			y: 15
		},
		image: {
			src: './characters/optune.png'
		},
		frames: {
			max: 4,
			hold: 60
		},
		scale: 1.5,
		animate: false,
		isEnemy: true,
		name: 'Optune',
		level: 8,
		baseLevel: 8,
		maxHealth: 100,
		healthPerLevel: 8,
		attackScalePerLevel: 0.10,
		encounterChance: 20,
		attacks: [
			attacks.Explore,
			attacks.Exploit,
			attacks.LuckyDraw,
			attacks.ConfidenceBound
		]
	}
}

const randomEnemyPool = [
	//monsters.quasaur,
	monsters.recursaur
	//monsters.algorythm,
	//monsters.optune
]

let isFirstEnemyEncounter = true

function getRandomEnemyLevel() {
	const minimumLevel = 6
	const maximumLevel = isFirstEnemyEncounter ? 7 : 12

	const selectedLevel = Math.floor(
		Math.random() * (maximumLevel - minimumLevel + 1)
	) + minimumLevel

	// only first enemy encountered is limited to level 6 or 7
	isFirstEnemyEncounter = false
	return selectedLevel
}

function chooseRandomEnemy() {
	const totalChance = randomEnemyPool.reduce(
		(total, monster) => total + monster.encounterChance,
		0
	)

	let roll = Math.random() * totalChance
	let selectedMonster = randomEnemyPool[randomEnemyPool.length - 1]

	for (const monster of randomEnemyPool) {
		roll -= monster.encounterChance

		if (roll < 0) {
			selectedMonster = monster
			break
		}
	}

	return {
		...selectedMonster,
		level: getRandomEnemyLevel()
	}
}
