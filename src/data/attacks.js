// every attack contains the information used by battle logic and animation.

const attacks = {

	Pounce: {
		id: 'pounce',
		name: 'Pounce',
		maxUses: 15,
		damage: 20,
		type: 'damage',
		description: 'Leap onto the enemy and deal 20 damage.',
		animation: 'Pounce'
	},

	Howl: {
		id: 'howl',
		name: 'Howl',
		maxUses: 10,
		damage: 16,
		type: 'damage',
		description: 'Blast the enemy with sound waves for 16 damage.',
		animation: 'Howl'
	},

	Zoomies: {
		id: 'zoomies',
		name: 'Zoomies',
		maxUses: 10,
		damage: 9,
		hits: 2,
		type: 'damage',
		description: 'Dash into the enemy twice for 9 damage per hit.',
		animation: 'Zoomies'
	},

	GoodBoy: {
		id: 'good-boy',
		name: 'Good Boy',
		maxUses: 7,
		healing: 25,
		type: 'heal',
		description: 'Restore up to 25 of Hubble’s health.',
		animation: 'GoodBoy'
	},

	// Quasaur
	LightBeam: {
		id: 'light-beam',
		name: 'Light Beam',
		damage: 25,
		type: 'damage',
		description: 'Fire a powerful beam that deals 25 damage.',
		animation: 'LightBeam',
		selectionWeight: 35
	},

	jet: {
		id: 'jet',
		name: 'Cosmic Jet',
		damage: 15,
		type: 'damage',
		description: 'Launch a fast cosmic jet that deals 15 damage.',
		animation: 'Jett',
		selectionWeight: 30
	},

	Redshift: {
		id: 'redshift',
		name: 'Redshift',
		type: 'status',
		effect: 'weaken-next-attack',
		multiplier: 0.5,
		description: 'Cut the power of the opponent’s next damaging attack in half.',
		animation: 'Redshift',
		selectionWeight: 15
	},

	AccretionDisk: {
		id: 'accretion-disk',
		name: 'Accretion Disk',
		healing: 24,
		type: 'heal',
		description: 'Gather surrounding matter and restore up to 24 health.',
		animation: 'AccretionDisk',
		selectionWeight: 20
	},

	// Recursaur
	RecursiveCall: {
		id: 'recursive-call',
		name: 'Recursion',
		type: 'damage',
		damageSequence: [13, 7, 4],
		hits: 3,
		description: 'Repeat the attack three times with decreasing power.',
		animation: 'RecursiveCall',
		selectionWeight: 35
	},

	BaseCase: {
		id: 'base-case',
		name: 'Base Case',
		healing: 22,
		type: 'heal',
		description: 'End the recursion and restore up to 22 health.',
		animation: 'BaseCase',
		selectionWeight: 20
	},

	StackOverflow: {
		id: 'stack-overflow',
		name: 'Stack Overflow',
		damage: 30,
		recoil: 10,
		type: 'recoil',
		description: 'Deal 30 damage, but take 10 recoil damage.',
		animation: 'StackOverflow',
		selectionWeight: 20
	},

	Memorize: {
		id: 'memorize',
		name: 'Memorize',
		type: 'copy',
		effect: 'copy-last-move',
		description: 'Remember the opponent’s previous move and use it.',
		animation: 'Memorize',
		selectionWeight: 25
	},

	// Algorythm
	BinarySearch: {
		id: 'binary-search',
		name: 'Binary Search',
		type: 'dynamic-damage',
		effect: 'low-health-scaling',
		description: 'Deals 12, 20, or 28 damage as the opponent’s health gets lower, then heals the user by the damage dealt.',
		animation: 'BinarySearch',
		selectionWeight: 35
	},

	Optimize: {
		id: 'optimize',
		name: 'Optimize',
		type: 'status',
		effect: 'boost-next-attack',
		multiplier: 1.5,
		description: 'Increase the damage of the user’s next damaging attack by 50%.',
		animation: 'Optimize',
		selectionWeight: 20
	},

	InfiniteLoop: {
		id: 'infinite-loop',
		name: 'Infinite Loop',
		type: 'status',
		effect: 'force-repeat',
		description: 'Force the opponent to repeat its previous move next turn.',
		animation: 'InfiniteLoop',
		selectionWeight: 20
	},

	RuntimeAnalysis: {
		id: 'runtime-analysis',
		name: 'Runtime Analysis',
		damage: 35,
		failureChance: 0.7,
		type: 'damage',
		effect: 'may-fail',
		description: 'Analyze the opponent at runtime. Deal 35 damage, but there is a 70% chance of a runtime error.',
		animation: 'RuntimeAnalysis',
		selectionWeight: 25
	},

	// Optune
	Explore: {
		id: 'explore',
		name: 'Explore',
		damage: 15,
		type: 'damage',
		description: 'Test an uncertain strategy and deal a reliable 15 damage.',
		animation: 'Explore',
		selectionWeight: 30
	},

	Exploit: {
		id: 'exploit',
		name: 'Exploit',
		type: 'special',
		effect: 'exploit',
		description: 'Repeat the Optune attack that has dealt the most damage so far.',
		animation: 'Exploit',
		selectionWeight: 20
	},

	LuckyDraw: {
		id: 'lucky-draw',
		name: 'Lucky Draw',
		type: 'dynamic-damage',
		effect: 'random-damage',
		damageOptions: [10, 20, 30],
		description: 'Randomly deal 10, 20, or 30 damage.',
		animation: 'LuckyDraw',
		selectionWeight: 30
	},

	ConfidenceBound: {
		id: 'confidence-bound',
		name: 'Confidence Bound',
		type: 'status',
		effect: 'reduce-next-incoming-damage',
		multiplier: 0.5,
		description: 'Protect Optune while it evaluates uncertain outcomes. The opponent’s next damaging attack deals 50% less damage.',
		animation: 'ConfidenceBound',
		selectionWeight: 20
	}
}
