// manages battle initialization, turn order, 
// queued actions, fainting logic, and battle completion.


const battleBackgroundImage = new Image()
battleBackgroundImage.src = './images/battle.png'

const battleBackground = new Sprite({
	position: {	x: 0, y: 0},
	image: battleBackgroundImage
})


// battle system reports outcomes w/o managing transition 
let battleEndHandler = () => {}

let enemyIdleTween = null

// idle animation for optune
function startEnemyIdleAnimation(enemy) {
	if (enemyIdleTween) {
		enemyIdleTween.kill()
		enemyIdleTween = null
	}

	if (enemy.name !== 'Optune') return

	const startingY = enemy.position.y

	enemy.idleStartingY = startingY
	enemy.stretchX = 1
	enemy.stretchY = 1
	enemy.frames.val = 0

	const motion = {
		phase: 0
	}

	enemyIdleTween = gsap.to(motion, {
		phase: 1,
		duration: 2.7,
		ease: 'none',
		repeat: -1,

		onUpdate: () => {
			const phase = motion.phase

			// moves smoothly from: bottom -> top -> bottom
			const lift = (1 - Math.cos(phase * Math.PI * 2)) / 2
			enemy.position.y = startingY - 7 * lift
			enemy.stretchX = 1 - 0.12 * lift
			enemy.stretchY = 1 + 0.08 * lift

			// match each frame to one part of the floating motion.
			if (phase >= 0.08 && phase < 0.58) {
				enemy.frames.val = 0
			} else {
				enemy.frames.val = 1
			}
		}
	})
}


function initializeBattle({
	enemyData = chooseRandomEnemy(),
	onBattleEnd
}) {
	battleEndHandler = onBattleEnd

	const battle = gameState.battle

	battle.active = true
	battle.phase = 'choosing-action'
	battle.queue = []

	// enemy data is sampled before initialization
	// Hubble's current level is taken from player progression.
	battle.enemy = new Monster(enemyData)
	battle.player = new Monster({
		...monsters.hubble,
		level: gameState.playerProgress.level
	})

	battle.renderedSprites = [battle.enemy, battle.player]
	startEnemyIdleAnimation(battle.enemy)
	gameState.currentScene = 'battle'

	// synchronizing ui 
	battleUI.show()
	battleUI.reset()
	battleUI.setMonsterNames({
		enemy: battle.enemy,
		player: battle.player
	})
	battleUI.renderAttackButtons(
		battle.player.attacks,
		handlePlayerAttack,
		battle.player
	)

	battleUI.showChoiceMenu({
		onFight: handleFightChoice,
		onRun: handleRunChoice
	})
}

function startBattleAnimation() {
	if (gameState.battle.animationId !== null) return

	gameState.battle.animationId = window.requestAnimationFrame(
		animateBattle
	)
}


function stopBattleAnimation() {
	const battle = gameState.battle

	if (battle.animationId === null) return

	window.cancelAnimationFrame(battle.animationId)
	battle.animationId = null
}

// clears battle-specific state after an encounter ends.
// hubbles level is saved in gameState.playerProgress.
function resetBattle() {
	const battle = gameState.battle

	if (enemyIdleTween) {
		enemyIdleTween.kill()
		enemyIdleTween = null
	}

	if (battle.enemy) {
		battle.enemy.stretchX = 1
		battle.enemy.stretchY = 1

		if (
			Number.isFinite(battle.enemy.idleStartingY)
		) {
			battle.enemy.position.y = battle.enemy.idleStartingY
		}
	}

	battleUI.hide()
	battleUI.reset()

	battle.active = false
	battle.phase = 'idle'
	battle.enemy = null
	battle.player = null
	battle.renderedSprites = []
	battle.queue = []
}


// each frame clears canvas, redraws, and draws all sprites on top
function animateBattle(timestamp) {
	const battle = gameState.battle

	battle.animationId = window.requestAnimationFrame(animateBattle)

	context.clearRect(0, 0, canvas.width, canvas.height)
	context.fillStyle = 'black'
	context.fillRect(0, 0, canvas.width, canvas.height)

	battleBackground.draw(context)

	battle.renderedSprites.forEach((sprite) => {
		// foreground effects are drawn in a separate pass below
		if (sprite.drawInFront) return

		const shouldBob =
			sprite === battle.enemy &&
			sprite.name === 'Algorythm' &&
			battle.phase !== 'animating'

		if (!shouldBob) {
			sprite.draw(context)
			return
		}

		const restingY = sprite.position.y
		const bobOffset = Math.sin(timestamp / 420) * 6

		sprite.position.y = restingY + bobOffset
		sprite.draw(context)
		sprite.position.y = restingY
	})

	// draw foreground effects over both battle sprites
	battle.renderedSprites.forEach((sprite) => {
		if (!sprite.drawInFront) return

		sprite.draw(context)
	})
}


function chooseWeightedAttack(availableAttacks) {
	const totalWeight = availableAttacks.reduce(
		(total, attack) => total + (attack.selectionWeight || 1),0
	)

	let roll = Math.random() * totalWeight

	for (const attack of availableAttacks) {
		roll -= attack.selectionWeight || 1

		if (roll < 0) return attack
	}
	return availableAttacks[availableAttacks.length - 1]
}

function handleFightChoice() {
	const battle = gameState.battle

	if (battle.phase !== 'choosing-action') return

	battle.phase = 'choosing-attack'
	battleUI.showAttackMenu()
}

// if player runs return to world
function handleRunChoice() {
	const battle = gameState.battle

	if (battle.phase !== 'choosing-action') return

	battle.phase = 'ending'
	battleUI.setChoiceButtonsDisabled(true)
	battleEndHandler('ran')
}


async function handlePlayerAttack(attack, {forced = false, consumeUse = true} = {}) {
	const battle = gameState.battle

	// normal attacks begin on click selection
	// forced attacks begin after explanatory dialogue
	const validPhase = forced
		? battle.phase === 'awaiting-dialogue'
		: battle.phase === 'choosing-attack'

	if (!validPhase) return

	// can't attack if available-use count has been exhausted.
	if (consumeUse && !battle.player.canUseAttack(attack)) {
		battle.queue = []
		battleUI.showDialogue(
			`${battle.player.name} can’t use ${attack.name} anymore!`
		)
		queueAction(beginPlayerTurn)
		battle.phase = 'awaiting-dialogue'
		return
	}

	battle.phase = 'animating'
	battleUI.setAttackButtonsDisabled(true)

	if (consumeUse) {
		battle.player.useAttack(attack)
		battleUI.updateAttackButton(attack, battle.player)
	}

	await performAttack({
		attacker: battle.player,
		recipient: battle.enemy,
		attack,
		renderedSprites: battle.renderedSprites
	})

	// determine the next state after all attack effects have finished
	if (battle.enemy.isFainted) {
		queueAction(() => handleFaint(battle.enemy, 'victory'))
	} else if (!battle.player.hasUsableAttacks()) {
		queueAction(handleEnergyFaint)
	} else {
		queueAction(handleEnemyTurn)
	}

	battle.phase = 'awaiting-dialogue'
}


async function handleEnergyFaint() {
	const battle = gameState.battle
	battle.phase = 'animating'

	battle.player.takeDamage(battle.player.health)
	battleUI.updateHealth(battle.player)

	await playFaintAnimation(battle.player)
	battleUI.showDialogue(
		`${battle.player.name} ran out of energy. He fainted!`
	)

	queueAction(() => finishBattle('defeat'))
	battle.phase = 'awaiting-dialogue'
}


async function handleEnemyTurn() {
	const battle = gameState.battle
	battle.phase = 'animating'

	let availableAttacks = battle.enemy.attacks

	// algorythm cannot select optimize twice consecutively.
	if (
		battle.enemy.name === 'Algorythm' &&
		battle.enemy.lastAttack?.id === 'optimize'
	) {
		availableAttacks = availableAttacks.filter(
				(attack) => attack.id !== 'optimize'
			)
	}

	const randomAttack = chooseWeightedAttack(availableAttacks)

	await performAttack({
		attacker: battle.enemy,
		recipient: battle.player,
		attack: randomAttack,
		renderedSprites: battle.renderedSprites
	})

	if (battle.player.isFainted) {
		queueAction(() => handleFaint(battle.player, 'defeat'))
	} else if (battle.enemy.isFainted) {
		// stack overflow can knock out its own user through recoil.
		queueAction(() => handleFaint(battle.enemy, 'victory'))
	} else {
		queueAction(beginPlayerTurn)
	}
	battle.phase = 'awaiting-dialogue'
}


async function handleFaint(monster, result) {
	const battle = gameState.battle
	battle.phase = 'animating'

	if (
		monster === battle.enemy && enemyIdleTween
	) {
		enemyIdleTween.kill()
		enemyIdleTween = null

		monster.stretchX = 1
		monster.stretchY = 1

		if (Number.isFinite(monster.idleStartingY)) {
			monster.position.y = monster.idleStartingY
		}
	}

	await playFaintAnimation(monster)
	battleUI.showDialogue(`${monster.name} fainted!`)

	if (result === 'victory') {
		queueAction(handleVictoryLevelUp)
	} else {
		queueAction(() => finishBattle(result))
	}

	battle.phase = 'awaiting-dialogue'
}

// if hubble wins he levels up
function handleVictoryLevelUp() {
	const battle = gameState.battle
	const progress = gameState.playerProgress

	// battles end normally once hubble is max level
	if (progress.level >= progress.maxLevel) {
		finishBattle('victory')
		return
	}

	progress.level += 1

	// recompute level-dependent attributes and immediately synchronize interface values
	battle.player.setLevel(progress.level)
	battleUI.updateLevel(battle.player)
	battleUI.updateHealth(battle.player)
	battleUI.showDialogue(
		`${battle.player.name} grew to Lv. ${battle.player.level}! Maximum HP and attack power increased!`
	)

	queueAction(() => finishBattle('victory'))
	battle.phase = 'awaiting-dialogue'
}


function beginPlayerTurn() {
	const battle = gameState.battle
	const forcedAttack = battle.player.status.forcedAttack

	battleUI.hideDialogue()

	// check the move inventory before enabling the attack menu
	if (!forcedAttack && !battle.player.hasUsableAttacks()) {
		handleEnergyFaint().catch((error) => {
			console.error('Hubble energy faint failed:', error)
		})
		return
	}

	// infinite loop temporarily replaces normal player choice with
	// the stored attack from the previous turn
	if (forcedAttack) {
		battle.player.status.forcedAttack = null
		battleUI.setAttackButtonsDisabled(true)
		battleUI.showDialogue(
			`${battle.player.name} is caught in an Infinite Loop and repeats ${forcedAttack.name}!`
		)
		queueAction(() => handlePlayerAttack(
			forcedAttack,
			{ 
				forced: true,
				consumeUse: false
			}
		))
		battle.phase = 'awaiting-dialogue'
		return
	}

	battleUI.setAttackButtonsDisabled(false)
	battle.phase = 'choosing-attack'
}

function finishTurn() {
	beginPlayerTurn()
}

function finishBattle(result) {
	gameState.battle.phase = 'ending'
	battleEndHandler(result)
}

// Adds action to the end of the battle queue
// so it runs after the current actions finish
function queueAction(action) {
	gameState.battle.queue.push(action)
}

function advanceDialogue() {
	const battle = gameState.battle

	if (battle.phase !== 'awaiting-dialogue') return

	// first in first out
	const nextAction = battle.queue.shift()

	if (!nextAction) {
		beginPlayerTurn()
		return
	}

	// runs next queued action and catches errors whether sync or async
	Promise.resolve(nextAction()).catch((error) => {
		console.error('The next battle action failed:', error)
	})
}

// Continues the current attack sequence when needed
// otherwise, moves to the next battle message.
dialogueBox.addEventListener('click', () => {
	if (continueBattleDialogue()) return

	advanceDialogue()
})