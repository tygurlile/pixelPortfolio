// extend sprite with battle stats, level scaling, attack limits,
// health updates, and temporary status effects.
class Monster extends Sprite {
	constructor({
		position,
		image,
		frames = { max: 1, hold: 10 },
		sprites,
		animate = false,
		rotation = 0,
		scale = 1,
		isEnemy = false,
		name,
		level = 1,
		baseLevel = level,
		maxHealth = 100,
		healthPerLevel = 5,
		attackScalePerLevel = 0.05,
		attacks = []
	}) {
		super({
			position,
			image,
			frames,
			sprites,
			animate,
			rotation,
			scale
		})

		// main battle information.
		this.isEnemy = isEnemy
		this.name = name
		this.level = this.normalizeLevel(level)
		this.baseLevel = this.normalizeLevel(baseLevel)

		this.baseMaxHealth = Math.max(1, Math.round(Number(maxHealth) || 100))
		this.healthPerLevel = Math.max(0, Math.round(Number(healthPerLevel) || 0))
		this.attackScalePerLevel = Math.max(0, Number(attackScalePerLevel) || 0)

		this.maxHealth = this.calculateMaxHealth()
		this.health = this.maxHealth
		this.attacks = attacks
		this.attackUses = new Map()

		this.attacks.forEach((attack) => {
			const configuredMaxUses = Number(attack.maxUses)

			const hasLimitedUses = (
				Number.isFinite(configuredMaxUses) &&
				configuredMaxUses >= 0
			)

			const maxUses = hasLimitedUses
				? Math.floor(configuredMaxUses)
				: Infinity

			this.attackUses.set(attack.id, {
				max: maxUses,
				remaining: maxUses
			})
		})

		// temporary effects that apply to a future battle action
		this.status = {
			nextDamageMultiplier: 1,
			nextIncomingDamageMultiplier: 1,
			forcedAttack: null
		}

		// keep a record of recent attacks and the strongest result so far
		this.lastAttack = null
		this.lastDamageDealt = null
		this.bestDamageAttack = null
		this.bestDamageAmount = 0
	}

	normalizeLevel(level) {
		const numericLevel = Math.round(Number(level) || 1)
		return Math.max(1, numericLevel)
	}

	calculateMaxHealth(level = this.level) {
		const levelDifference = this.normalizeLevel(level) - this.baseLevel
		return Math.max(1, this.baseMaxHealth + levelDifference * this.healthPerLevel)
	}

	// calculate attack multiplier for selected level
	getAttackScale(level = this.level) {
		const levelDifference = this.normalizeLevel(level) - this.baseLevel
		return Math.max(0.25, 1 + levelDifference * this.attackScalePerLevel)
	}

	// apply current level scaling
	getScaledAttackValue(value) {
		const safeValue = Math.max(0, Number(value) || 0)

		if (safeValue === 0) return 0

		return Math.max(1, Math.round(safeValue * this.getAttackScale()))
	}

	getAttackUseState(attack) {
		return this.attackUses.get(attack.id) || {max: Infinity, remaining: Infinity}
	}

	getAttackUsesRemaining(attack) {
		return this.getAttackUseState(attack).remaining
	}

	getAttackMaxUses(attack) {
		return this.getAttackUseState(attack).max
	}

	canUseAttack(attack) {
		return this.getAttackUsesRemaining(attack) > 0
	}

	// for tracking limited # of attacks
	useAttack(attack) {
		const useState = this.getAttackUseState(attack)

		if (!Number.isFinite(useState.remaining)) return true
		if (useState.remaining <= 0) return false

		useState.remaining -= 1
		return true
	}

	hasUsableAttacks() {
		return this.attacks.some(
			(attack) => this.canUseAttack(attack)
		)
	}

	setLevel(level, { addMaxHealthIncrease = true } = {}) {
		const nextLevel = this.normalizeLevel(level)
		const previousMaxHealth = this.maxHealth

		this.level = nextLevel
		this.maxHealth = this.calculateMaxHealth()

		if (addMaxHealthIncrease) {
			const maxHealthIncrease = this.maxHealth - previousMaxHealth

			this.health = Math.min(
				this.maxHealth, 
				this.health + Math.max(0, maxHealthIncrease)
			)
		} else {
			this.health = Math.min(this.health, this.maxHealth)
		}
		return this.level
	}

	takeDamage(amount) {
		const safeAmount = Math.max(0, Math.round(Number(amount) || 0))
		const previousHealth = this.health
		this.health = Math.max(0, this.health - safeAmount)
		return previousHealth - this.health
	}

	heal(amount) {
		const safeAmount = Math.max(0, Math.round(Number(amount) || 0))
		const previousHealth = this.health
		this.health = Math.min(this.maxHealth, this.health + safeAmount)
		return this.health - previousHealth
	}

	addNextDamageMultiplier(multiplier) {
		const safeMultiplier = Number(multiplier)

		if (!Number.isFinite(safeMultiplier) || safeMultiplier < 0
		) {
			return
		}

		this.status.nextDamageMultiplier = safeMultiplier
	}

	consumeNextDamageMultiplier() {
		const multiplier = this.status.nextDamageMultiplier
		this.status.nextDamageMultiplier = 1
		return multiplier
	}

	addNextIncomingDamageMultiplier(multiplier) {
		const safeMultiplier = Number(multiplier)

		if (!Number.isFinite(safeMultiplier) || safeMultiplier < 0
		) {
			return
		}
		this.status.nextIncomingDamageMultiplier = safeMultiplier
	}

	consumeNextIncomingDamageMultiplier() {
		const multiplier = this.status.nextIncomingDamageMultiplier
		this.status.nextIncomingDamageMultiplier = 1
		return multiplier
	}


	recordAttackResult(
		attack,
		damageDealt,
		{ damaging = false } = {}
	) {
		this.lastAttack = attack

		if (damaging) {this.lastDamageDealt = damageDealt}

		if (
			damaging && damageDealt >= this.bestDamageAmount
		) {
			this.bestDamageAmount = damageDealt
			this.bestDamageAttack = attack
		}
	}

	getHealthPercentage() {
		return (this.health / this.maxHealth) * 100
	}

	get isFainted() {
		return this.health <= 0
	}
}
