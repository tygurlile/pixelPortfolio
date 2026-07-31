// Handles the battle menus, buttons, health bars, and text.

const elements = {
	container: document.querySelector('#userInterface'),
	choiceMenu: document.querySelector('#battleChoiceMenu'),
	attackMenu: document.querySelector('#battleAttackMenu'),
	fightButton: document.querySelector('#fightButton'),
	runButton: document.querySelector('#runButton'),
	dialogueBox: document.querySelector('#dialogueBox'),
	enemyHealthBar: document.querySelector('#enemyHealthBar'),
	playerHealthBar: document.querySelector('#playerHealthBar'),
	enemyHealthText: document.querySelector('#enemyHealthText'),
	playerHealthText: document.querySelector('#playerHealthText'),
	enemyLevel: document.querySelector('#enemyLevel'),
	playerLevel: document.querySelector('#playerLevel'),
	attacksBox: document.querySelector('#attacksBox'),
	attackDescription: document.querySelector('#attackDescription'),
	enemyName: document.querySelector('#enemyName'),
	playerName: document.querySelector('#playerName')
}

let attackMenuAcceptsInput = false
let attackMenuUnlockTimer = null
let previewedAttackId = null

function lockAttackMenuBriefly() {
	attackMenuAcceptsInput = false
	elements.attacksBox.style.pointerEvents = 'none'

	window.clearTimeout(attackMenuUnlockTimer)

	attackMenuUnlockTimer = window.setTimeout(() => {
		attackMenuAcceptsInput = true
		elements.attacksBox.style.pointerEvents = 'auto'
	}, 200)
}

const dialogueBox = elements.dialogueBox

const defaultAttackDescription = 'Hover to preview. On phone, tap once to preview and again to use.'

const choiceCallbacks = {fight: null, run: null}

// ignore the extra click that touchscreens sometimes generate
let lastTouchChoiceTime = -Infinity



function triggerBattleChoice(choiceName) {
	const button = choiceName === 'fight'
		? elements.fightButton
		: elements.runButton

	const callback = choiceCallbacks[choiceName]

	if (
		button.disabled ||
		typeof callback !== 'function'
	) {
		return
	}
	callback()
}

// let the choice buttons work with mouse, keyboard, and touch input.
function bindBattleChoiceButton(button, choiceName) {
	button.addEventListener('pointerup', (event) => {
		// Mouse input is handled by the click event below.
		if (event.pointerType === 'mouse') {
			return
		}

		event.preventDefault()
		lastTouchChoiceTime = performance.now()
		triggerBattleChoice(choiceName)
	})

	button.addEventListener('click', (event) => {
		// ignore duplicate click created after a touch.
		if (
			performance.now() - lastTouchChoiceTime < 700
		) {
			event.preventDefault()
			return
		}
		triggerBattleChoice(choiceName)
	})
}

bindBattleChoiceButton(elements.fightButton, 'fight')
bindBattleChoiceButton(elements.runButton, 'run')

function getDisplayedAttackDescription(
	attack,
	attacker
) {
	// use original description if scaling is not available.
	if (
		!attacker ||
		typeof attacker.getScaledAttackValue !==
			'function'
	) {
		return (
			attack.description ||
			defaultAttackDescription
		)
	}

	switch (attack.id) {
		case 'pounce':
			return `Leap onto the enemy and deal ${attacker.getScaledAttackValue(attack.damage)} damage.`

		case 'howl':
			return `Blast the enemy with sound waves for ${attacker.getScaledAttackValue(attack.damage)} damage.`

		case 'zoomies':
			return `Dash into the enemy twice for ${attacker.getScaledAttackValue(attack.damage)} damage per hit.`

		case 'good-boy':
			return `Restore up to ${attacker.getScaledAttackValue(attack.healing)} of Hubble’s health.`

		default:
			return (
				attack.description ||
				defaultAttackDescription
			)
	}
}

// funcs used by the rest of the battle system to update the UI.
const battleUI = {
	show() {elements.container.style.display = 'block'},
	hide() {elements.container.style.display = 'none'},

	showChoiceMenu({
		onFight,
		onRun
	}) {
		elements.choiceMenu.classList.remove('is-hidden')
		elements.attackMenu.classList.add('is-hidden')

		elements.fightButton.disabled = false
		elements.runButton.disabled = false

		choiceCallbacks.fight = onFight
		choiceCallbacks.run = onRun
	},

	showAttackMenu() {
		previewedAttackId = null

		elements.attacksBox
			.querySelectorAll('button')
			.forEach((button) => {
				button.classList.remove('is-previewed')
			})

		elements.attackDescription.textContent = defaultAttackDescription
		lockAttackMenuBriefly()

		elements.choiceMenu.classList.add('is-hidden')
		elements.attackMenu.classList.remove('is-hidden')
	},

	setChoiceButtonsDisabled(disabled) {
		elements.fightButton.disabled = disabled
		elements.runButton.disabled = disabled
	},

	// return the battle interface to its starting state.
	reset() {
		this.hideDialogue()

		window.clearTimeout(attackMenuUnlockTimer)
		attackMenuAcceptsInput = false
		previewedAttackId = null
		elements.attacksBox.style.pointerEvents = 'none'

		elements.choiceMenu.classList.remove('is-hidden')
		elements.attackMenu.classList.add('is-hidden')

		elements.enemyHealthBar.style.width = '100%'
		elements.playerHealthBar.style.width = '100%'

		elements.enemyHealthText.textContent = '100/100 HP'
		elements.playerHealthText.textContent = '100/100 HP'

		elements.enemyLevel.textContent = 'Lv. 8'
		elements.playerLevel.textContent = 'Lv. 6'

		elements.attacksBox.replaceChildren()

		elements.attackDescription.textContent = defaultAttackDescription

		elements.fightButton.disabled = false
		elements.runButton.disabled = false

		choiceCallbacks.fight = null
		choiceCallbacks.run = null
	},

	setMonsterNames({
		enemy,
		player
	}) {
		elements.enemyName.textContent = enemy.name
		elements.playerName.textContent = player.name

		this.updateLevel(enemy)
		this.updateLevel(player)
		this.updateHealth(enemy)
		this.updateHealth(player)
	},

	showDialogue(message) {
		elements.dialogueBox.textContent = message
		elements.dialogueBox.style.display = 'block'
	},

	hideDialogue() {
		elements.dialogueBox.style.display = 'none'
	},

	updateLevel(monster) {
		const levelText = monster.isEnemy
			? elements.enemyLevel
			: elements.playerLevel

		levelText.textContent = `Lv. ${monster.level}`
	},

	updateHealth(monster) {
		const healthBar = monster.isEnemy
			? elements.enemyHealthBar
			: elements.playerHealthBar

		const healthText = monster.isEnemy
			? elements.enemyHealthText
			: elements.playerHealthText

		// Keep the health bar between 0% and 100%.
		const healthPercentage = Math.max(
			0, Math.min(100, monster.getHealthPercentage()
			)
		)

		healthBar.style.width = `${healthPercentage}%`
		healthText.textContent = `${monster.health}/${monster.maxHealth} HP`
	},

	showAttackDescription(
		attack,
		attacker
	) {
		elements.attackDescription.textContent =
			getDisplayedAttackDescription(attack, attacker)
	},

	updateAttackButton(
		attack,
		attacker
	) {
		const button =
			elements.attacksBox.querySelector(
				`button[data-attack-id="${attack.id}"]`
			)

		// The button may not be on screen yet.
		if (!button) return

		const usesText = button.querySelector('.attack-button-uses')
		const maxUses = attacker.getAttackMaxUses(attack)
		const remainingUses = attacker.getAttackUsesRemaining(attack)
		const hasLimitedUses = Number.isFinite(maxUses)

		const isExhausted = hasLimitedUses && remainingUses <= 0

		if (usesText) {
			usesText.textContent =
				hasLimitedUses
					? `${remainingUses}/${maxUses} attacks left`
					: 'Unlimited attacks'
		}

		// show when a move is empty.
		button.classList.toggle('is-exhausted', isExhausted)
		button.setAttribute('aria-disabled', String(isExhausted))
	},

	updateAllAttackButtons(
		attacks,
		attacker
	) {
		attacks.forEach((attack) => {
			this.updateAttackButton(
				attack,
				attacker
			)
		})
	},

	// Create the attack buttons for the current battle.
	renderAttackButtons(
		attacks,
		onAttackSelected,
		attacker
	) {
		// removes the previous battle's buttons.
		elements.attacksBox.replaceChildren()

		attacks.forEach((attack) => {
			const button = document.createElement('button')
			const attackName = document.createElement('span')
			const attackUses = document.createElement('span')

			button.type = 'button'
			button.dataset.attackId = attack.id

			attackName.className = 'attack-button-name'
			attackName.textContent = attack.name
			attackUses.className = 'attack-button-uses'

			button.append(attackName, attackUses)

			// Preview attacks on touchscreens before selecting them.
			button.addEventListener(
				'click',
				(event) => {
					event.preventDefault()
					event.stopPropagation()

					// Ignore the leftover click from tapping Fight on a phone.
					if (!attackMenuAcceptsInput) return

					const usesTouchPreview = window.matchMedia('(hover: none)').matches

					this.showAttackDescription(attack, attacker)

					if (
						usesTouchPreview && previewedAttackId !== attack.id
					) {
						previewedAttackId = attack.id

						elements.attacksBox
							.querySelectorAll('button')
							.forEach((attackButton) => {
								attackButton.classList.toggle(
									'is-previewed',
									attackButton === button
								)
							})

						elements.attackDescription.textContent =
							`${getDisplayedAttackDescription(attack, attacker
							)} Tap again to use ${attack.name}.`

						return
					}

					// prevents another attack from being selected during this turn.
					attackMenuAcceptsInput = false
					previewedAttackId = null

					onAttackSelected(attack)
				}
			)

			// preview attack with mouse
			button.addEventListener(
				'mouseenter',
				() => {
					this.showAttackDescription(attack, attacker)
				}
			)

			// show the same preview when using a keyboard.
			button.addEventListener(
				'focus',
				() => {
					this.showAttackDescription(attack, attacker)
				}
			)
			elements.attacksBox.append(button)
			this.updateAttackButton(attack, attacker)
		})
	},

	// disable attack buttons while an attack or message is active.
	setAttackButtonsDisabled(disabled) {
		elements.attacksBox
			.querySelectorAll('button')
			.forEach((button) => {
				button.disabled = disabled
			})

		if (disabled) {
			attackMenuAcceptsInput = false
			elements.attacksBox.style.pointerEvents = 'none'
		} else {
			attackMenuAcceptsInput = true
			elements.attacksBox.style.pointerEvents = 'auto'

			// reset the attack preview for the next turn.
			previewedAttackId = null

			elements.attacksBox
				.querySelectorAll('button')
				.forEach((button) => {
					button.classList.remove('is-previewed')
				})

			elements.attackDescription.textContent = defaultAttackDescription
		}
	}
}