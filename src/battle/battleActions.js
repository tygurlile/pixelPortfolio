
// how one complete battle move works

let battleDialogueContinueResolver = null

// pause the current action until the dialogue box is clicked
function waitForBattleDialogueClick() {
	return new Promise((resolve) => {
		battleDialogueContinueResolver = resolve
	})
}


// continue the battle after the player clicks the dialogue box
function continueBattleDialogue() {
	if (!battleDialogueContinueResolver) return false

	const resolve = battleDialogueContinueResolver
	battleDialogueContinueResolver = null

	resolve()
	return true
}

function chooseRandomItem(items) {
	return items[
		Math.floor(Math.random() * items.length)
	]
}


// calculate damage for attacks whose value changes during battle
function getDynamicDamage({
	attack,
	recipient
}) {
	switch (attack.effect) {
		case 'low-health-scaling': {
			const healthPercentage =
				recipient.getHealthPercentage()

			if (healthPercentage <= 35) return 28
			if (healthPercentage <= 65) return 20
			return 12
		}

		case 'random-damage':
			return chooseRandomItem(
				attack.damageOptions
			)

		default:
			return attack.damage || 0
	}
}

function attackCanDealDamage(attack) {
	return [
		'damage',
		'dynamic-damage',
		'recoil'
	].includes(attack.type)
}

function applyStatusAttack({
	attack,
	attacker,
	recipient
}) {
	switch (attack.effect) {
		case 'weaken-next-attack':
			recipient.addNextDamageMultiplier(
				attack.multiplier
			)
			return `It weakens ${recipient.name}’s next damaging attack by 50%!`

		case 'boost-next-attack':
			attacker.addNextDamageMultiplier(
				attack.multiplier
			)
			return `It optimizes ${attacker.name}’s next damaging attack, increasing its damage by 50%!`

		case 'force-repeat':
			// The effect cannot work before the opponent has used a move.
			if (!recipient.lastAttack) {
				return `It tries to trap ${recipient.name}, but there is no previous move to repeat!`
			}

			recipient.status.forcedAttack = recipient.lastAttack
			return `It traps ${recipient.name} into repeating ${recipient.lastAttack.name} on the next turn!`

		case 'reduce-next-incoming-damage':
			attacker.addNextIncomingDamageMultiplier(attack.multiplier)

			return `${attacker.name} protects itself while evaluating uncertain outcomes. The opponent’s next damaging attack will deal 50% less damage!`

		default:
			return `${attack.name} takes effect!`
	}
}

function getHealingMessage({
	attack,
	attacker,
	healedAmount
}) {
	if (healedAmount <= 0) {
		return `${attacker.name} is already at full health!`
	}

	switch (attack.id) {
		case 'good-boy':
			return `${attacker.name} feels encouraged and restores ${healedAmount} health!`

		case 'accretion-disk':
			return `It surrounds ${attacker.name} with matter and restores ${healedAmount} health!`

		case 'base-case':
			return `It reaches the Base Case and restores ${healedAmount} health!`

		default:
			return `${attacker.name} restores ${healedAmount} health!`
	}
}

function getDamageMessage({
	attack,
	attacker,
	recipient,
	totalDamage,
	completedHits,
	resolvedDamage,
	healedAmount
}) {
	switch (attack.id) {
		case 'pounce':
			return `${attacker.name} leaps onto ${recipient.name} and deals ${totalDamage} damage!`

		case 'howl':
			return `${attacker.name}’s sound waves hit ${recipient.name} for ${totalDamage} damage!`

		case 'zoomies':
			return `${attacker.name} dashes into ${recipient.name} ${completedHits} times for ${totalDamage} total damage!`

		case 'light-beam':
			return `The powerful beam hits ${recipient.name} for ${totalDamage} damage!`

		case 'jet':
			return `The cosmic jet strikes ${recipient.name} for ${totalDamage} damage!`

		case 'recursive-call':
			return `It repeats with decreasing power, hitting ${recipient.name} ${completedHits} times for ${totalDamage} total damage!`

		case 'binary-search':
			if (healedAmount > 0) {
				return `It deals ${totalDamage} damage based on Hubble's remaining health and restores ${healedAmount} health to ${attacker.name}!`
			}

			return `It deals ${totalDamage} damage! ${attacker.name} is already at full health.`

		case 'runtime-analysis':
			return `No runtime errors found, it deals ${totalDamage} damage!`

		case 'explore':
			return `${attacker.name} tests a new strategy and deals ${totalDamage} damage!`

		case 'lucky-draw':
			return `It randomly draws ${resolvedDamage} damage!`

		default:
			if ((attack.hits || 1) > 1) {
				return `${attack.name} hits ${completedHits} times for ${totalDamage} total damage!`
			}

			return `${attack.name} deals ${totalDamage} damage!`
	}
}

// repeats opponent's previous move.
async function performCopiedAttack({
	attacker,
	recipient,
	attack,
	renderedSprites
}) {
	await playAttackAnimation({
		attack,
		attacker,
		recipient,
		renderedSprites
	})

	await waitForBattleDialogueClick()

	let copiedAttack = recipient.lastAttack


	// a copied move cannot copy another copying effect
	if (
		!copiedAttack ||
		[
			'copy-last-move',
			'exploit'
		].includes(copiedAttack.effect)
	) {
		copiedAttack = attacks.RecursiveCall
	}

	battleUI.showDialogue(
		`It remembers ${recipient.name}’s previous move, ${copiedAttack.name}, and uses it!`
	)

	// gets rid of original attack dialogue
	return performAttack({
		attacker,
		recipient,
		attack: copiedAttack,
		renderedSprites,
		announce: false
	})
}

// repeat the attack that previously dealt the most damage.
async function performExploitAttack({
	attacker,
	recipient,
	attack,
	renderedSprites
}) {
	await playAttackAnimation({
		attack,
		attacker,
		recipient,
		renderedSprites
	})
	await waitForBattleDialogueClick()

	let selectedAttack = attacker.bestDamageAttack
	let selectedDamage = attacker.bestDamageAmount

	// use explore (attack move) if there is no previous damage record 
	// or if saved move is another copy 
	if (
		!selectedAttack ||
		[
			'exploit',
			'copy-last-move'
		].includes(selectedAttack.effect)
	) {
		selectedAttack = attacks.Explore

		selectedDamage =
			attacker.getScaledAttackValue(
				attacks.Explore.damage
			)
	}

	battleUI.showDialogue(
		`${attacker.name} repeats ${selectedAttack.name} for ${selectedDamage} damage, the most damage it has achieved so far!`
	)

	return performAttack({
		attacker,
		recipient,
		attack: selectedAttack,
		renderedSprites,
		announce: false,
		damageOverride: selectedDamage,
		suppressResultDialogue: true
	})
}

async function performAttack({
	attacker,
	recipient,
	attack,
	renderedSprites,
	announce = true,
	damageOverride = null,
	suppressResultDialogue = false
}) {
	if (announce) {
		battleUI.showDialogue(
			`${attacker.name} used ${attack.name}!`
		)
	}

	// memorize uses its own two-part attack sequence
	if (attack.effect === 'copy-last-move') {
		return performCopiedAttack({
			attacker,
			recipient,
			attack,
			renderedSprites
		})
	}

	// exploit repeats the attacker's strongest previous result
	if (attack.effect === 'exploit') {
		return performExploitAttack({
			attacker,
			recipient,
			attack,
			renderedSprites
		})
	}

	// decide whether an attack with a failure chance succeeds
	const failed = (
		attack.effect === 'may-fail' &&
		Math.random() < attack.failureChance
	)
	const hasDamageOverride = Number.isFinite(damageOverride)

	// use supplied damage when repeating a saved result. else use the normal damage
	const baseResolvedDamage =
		hasDamageOverride
			? damageOverride
			: getDynamicDamage({
				attack,
				recipient
			})

	const resolvedDamage =
		hasDamageOverride
			? baseResolvedDamage
			: attacker.getScaledAttackValue(
				baseResolvedDamage
			)

	// for writing the battle message
	let completedHits = 0
	let totalDamage = 0
	let healedAmount = 0
	let recoilDamage = 0
	let statusMessage = ''
	let attackDamageMultiplier = null

	// confidence bound applies to one damage move, not to each
	const incomingDamageMultiplier =
		attackCanDealDamage(attack)
			? recipient
				.consumeNextIncomingDamageMultiplier()
			: 1

	const getAttackDamageMultiplier = () => {
		if (attackDamageMultiplier === null) {
			attackDamageMultiplier =
				attacker.consumeNextDamageMultiplier()
		}
		return attackDamageMultiplier
	}

	const applyHit = (
		baseDamage = baseResolvedDamage
	) => {
		if (recipient.isFainted) return false

		const levelScaledDamage =
			hasDamageOverride
				? baseDamage
				: attacker.getScaledAttackValue(
					baseDamage
				)

		const adjustedDamage = Math.max(
			0,
			Math.round(
				levelScaledDamage *
					getAttackDamageMultiplier() *
					incomingDamageMultiplier
			)
		)

		const damageDealt =
			recipient.takeDamage(
				adjustedDamage
			)

		if (damageDealt <= 0) return false

		completedHits += 1
		totalDamage += damageDealt
		battleUI.updateHealth(recipient)
		return true
	}

	const applyHealing = () => {
		healedAmount = attacker.heal(
			attacker.getScaledAttackValue(
				attack.healing
			)
		)
		battleUI.updateHealth(attacker)
		return healedAmount
	}

	const applySelfDamage = () => {
		recoilDamage = attacker.takeDamage(
			attacker.getScaledAttackValue(
				attack.recoil
			)
		)
		battleUI.updateHealth(attacker)
		return recoilDamage
	}

	const applyEffect = () => {
		statusMessage = applyStatusAttack({
			attack,
			attacker,
			recipient
		})
	}

	// failed damange still consumes the status if there is one
	if (failed) {attacker.consumeNextDamageMultiplier()}

	await playAttackAnimation({
		attack,
		attacker,
		recipient,
		renderedSprites,
		onHit:
			failed
				? () => false
				: applyHit,
		onHeal: applyHealing,
		onSelfHit: applySelfDamage,
		onEffect: applyEffect,
		resolvedDamage,
		failed
	})

	// restores health equal to damage dealt. this includes shield and boosts
	if (
		attack.id === 'binary-search' &&
		totalDamage > 0
	) {
		healedAmount = attacker.heal(totalDamage)
		battleUI.updateHealth(attacker)
	}

	const damagingAttempt = attackCanDealDamage(attack)

	// save the move and its result for later battle effects
	attacker.recordAttackResult(
		attack,
		totalDamage,
		{
			damaging: damagingAttempt
		}
	)

	await waitForBattleDialogueClick()

	if (suppressResultDialogue) return

	if (failed) {
		battleUI.showDialogue(
			attack.id === 'runtime-analysis'
				? 'There was a Runtime Error! Runtime Analysis failed.'
				: `${attack.name} failed!`
		)
		return
	}

	if (attack.type === 'heal') {
		battleUI.showDialogue(
			getHealingMessage({
				attack,
				attacker,
				healedAmount
			})
		)
		return
	}

	if (attack.type === 'status') {
		battleUI.showDialogue(
			statusMessage
		)
		return
	}

	if (attack.type === 'recoil') {
		battleUI.showDialogue(
			`It deals ${totalDamage} damage to ${recipient.name}, but ${attacker.name} takes ${recoilDamage} recoil damage!`
		)
		return
	}

	battleUI.showDialogue(
		getDamageMessage({
			attack,
			attacker,
			recipient,
			totalDamage,
			completedHits,
			resolvedDamage,
			healedAmount
		})
	)
}

