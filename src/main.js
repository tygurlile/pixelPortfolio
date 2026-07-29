// startup screen elements
const startupUI = {
	overlay: document.querySelector('#startupOverlay'),
	devicePanel: document.querySelector('#devicePanel'),
	laptopPanel: document.querySelector('#laptopPanel'),
	introPanel: document.querySelector('#introPanel'),
	settingsPanel: document.querySelector('#settingsPanel'),
	phoneButton: document.querySelector('#phoneButton'),
	laptopButton: document.querySelector('#laptopButton'),
	playGameButton: document.querySelector('#playGameButton'),
	startupQuickInfoButton: document.querySelector('#startupQuickInfoButton'),
	continueButton: document.querySelector('#continueButton'),
	battlesToggle: document.querySelector('#battlesToggle'),
	musicToggle: document.querySelector('#musicToggle'),
	musicVolume: document.querySelector('#musicVolume'),
	volumeValue: document.querySelector('#volumeValue'),
	startGameButton: document.querySelector('#startGameButton')
}

// controls used in in-game settings 
const inGameSettingsUI = {
	button: document.querySelector('#settingsButton'),
	overlay: document.querySelector('#inGameSettingsOverlay'),
	closeButton: document.querySelector('#closeSettingsButton'),
	battlesToggle: document.querySelector('#inGameBattlesToggle'),
	musicToggle: document.querySelector('#inGameMusicToggle'),
	musicVolume: document.querySelector('#inGameMusicVolume'),
	volumeValue: document.querySelector('#inGameVolumeValue')
}

// displays the map as a background befoe the website starts
const startupMapPreview = document.querySelector('#startupMapPreview')

// tracks when the quick info menu is opened
const quickInfoState = {
	active: false,
	returnScene: null,
	viewingInformation: false
}

// begin loading images while the visitor moves through the startup menus
const imagePreloadStartedAt = performance.now()

let imagePreloadFailure = null
let preloadedImageCount = 0

const gameImagePreloadPromise =
	preloadGameImages()
		.then((imageCount) => {
			preloadedImageCount = imageCount
		})
		.catch((error) => {
			imagePreloadFailure = error
		})

const startupPanels = [
	startupUI.devicePanel,
	startupUI.laptopPanel,
	startupUI.introPanel,
	startupUI.settingsPanel
]

// Shows one startup panel and hide the others.
function showStartupPanel(panelToShow) {
	startupPanels.forEach((panel) => {
		panel.classList.toggle(
			'is-hidden',
			panel !== panelToShow
		)
	})
}

// syncs all the settings controls (from the main menu and in-game settings)
function syncSettingsControls() {
	const volumePercentage = Math.round(
		gameState.settings.musicVolume * 100
	)

	// the main menu
	startupUI.battlesToggle.checked = gameState.settings.battlesEnabled
	startupUI.musicToggle.checked = gameState.settings.musicEnabled
	startupUI.musicVolume.value = volumePercentage
	startupUI.volumeValue.textContent = `${volumePercentage}%`
	startupUI.musicVolume.disabled = !gameState.settings.musicEnabled

	// the in-game settings menu.
	inGameSettingsUI.battlesToggle.checked = gameState.settings.battlesEnabled
	inGameSettingsUI.musicToggle.checked = gameState.settings.musicEnabled
	inGameSettingsUI.musicVolume.value = volumePercentage
	inGameSettingsUI.volumeValue.textContent = `${volumePercentage}%`
	inGameSettingsUI.musicVolume.disabled = !gameState.settings.musicEnabled
}

// controls if battles are on or off
function setBattlesEnabled(enabled) {
	gameState.settings.battlesEnabled = Boolean(enabled)
	syncSettingsControls()
}

// controls if music is enabled or not
function setMusicEnabled(enabled) {
	audioManager.setMusicEnabled(Boolean(enabled))
	syncSettingsControls()
}

// converts the slider value into something the audio manager can read 
function setMusicVolumeFromPercentage(percentage) {
	const numericPercentage = Number(percentage)

	if (!Number.isFinite(numericPercentage)) {return}
	const limitedPercentage = Math.max(0, Math.min(100, numericPercentage))

	audioManager.setMusicVolume(limitedPercentage / 100)
	syncSettingsControls()
}

// makes the slider work on touch screens
function makeVolumeSliderTouchFriendly(slider) {
	let activePointerId = null

	const updateFromPointer = (event) => {
		const bounds = slider.getBoundingClientRect()
		if (!bounds.width) return

		const minimum = Number(slider.min) || 0
		const maximum = Number(slider.max) || 100
		const step = Number(slider.step) || 1
		const percentage = Math.max(
			0,
			Math.min(1, (event.clientX - bounds.left) / bounds.width)
		)

		const rawValue = minimum + percentage * (maximum - minimum)
		const steppedValue = Math.round(rawValue / step) * step

		slider.value = String(steppedValue)
		setMusicVolumeFromPercentage(steppedValue)
	}

	slider.addEventListener('pointerdown', (event) => {
		if (slider.disabled) return

		event.preventDefault()
		audioManager.unlockAudio()
		activePointerId = event.pointerId
		slider.setPointerCapture?.(event.pointerId)
		updateFromPointer(event)
	})

	slider.addEventListener('pointermove', (event) => {
		if (event.pointerId !== activePointerId) return
		event.preventDefault()
		updateFromPointer(event)
	})

	const finishDragging = (event) => {
		if (event.pointerId !== activePointerId) return
		activePointerId = null
	}

	slider.addEventListener('pointerup', finishDragging)
	slider.addEventListener('pointercancel', finishDragging)
	slider.addEventListener('lostpointercapture', finishDragging)
}

makeVolumeSliderTouchFriendly(startupUI.musicVolume)
makeVolumeSliderTouchFriendly(inGameSettingsUI.musicVolume)

// starts music after the main menu
const unlockBrowserAudioFromGesture = () => {audioManager.unlockAudio()}

window.addEventListener('pointerdown', unlockBrowserAudioFromGesture, {passive: true})
window.addEventListener('keydown', unlockBrowserAudioFromGesture, {passive: true})

initializeWorld({
	onBattleEncounter: beginBattle,
	onBuildingEntrance: beginBuildingEntry,
	onInformation: beginInformationInteraction
})

initializeInteriors({
	onExit: beginBuildingExit,
	onInformation: beginInformationInteraction
})

initializeInformationPopup({
	onClose: resumeAfterInformationPopup
})

initializeQuickInfoMenu({
	onOpen: openQuickInfo,
	onSelect: handleQuickInfoSelection,
	onClose: resumeAfterQuickInfoMenu
})

// =========================================================
// STARTUP EVENT HANDLERS
// =========================================================

startupUI.phoneButton.addEventListener(
	'click',
	() => {
		if (typeof window.activateTouchControls === 'function') {
			window.activateTouchControls()
		}
		showStartupPanel(startupUI.laptopPanel)
	}
)

startupUI.laptopButton.addEventListener(
	'click',
	() => {
		if (typeof window.deactivateTouchControls === 'function') {
			window.deactivateTouchControls()
		}
		showStartupPanel(startupUI.laptopPanel)
	}
)

startupUI.playGameButton.addEventListener(
	'click',
	() => {
		audioManager.unlockAudio()
		showStartupPanel(
			startupUI.introPanel
		)
	}
)

startupUI.startupQuickInfoButton.addEventListener(
	'click',
	openStartupQuickInfo
)

startupUI.continueButton.addEventListener(
	'click',
	() => {
		showStartupPanel(
			startupUI.settingsPanel
		)
	}
)

startupUI.battlesToggle.addEventListener(
	'change',
	(event) => {
		setBattlesEnabled(
			event.target.checked
		)
	}
)

startupUI.musicToggle.addEventListener(
	'change',
	(event) => {
		setMusicEnabled(
			event.target.checked
		)
	}
)

startupUI.musicVolume.addEventListener(
	'input',
	(event) => {
		setMusicVolumeFromPercentage(
			event.target.value
		)
	}
)

startupUI.startGameButton.addEventListener(
	'click',
	startGame
)

// =========================================================
// IN-GAME SETTINGS EVENT HANDLERS
// =========================================================

inGameSettingsUI.button.addEventListener(
	'click',
	openInGameSettings
)

inGameSettingsUI.closeButton.addEventListener(
	'click',
	closeInGameSettings
)

inGameSettingsUI.battlesToggle.addEventListener(
	'change',
	(event) => {
		setBattlesEnabled(
			event.target.checked
		)
	}
)

inGameSettingsUI.musicToggle.addEventListener(
	'change',
	(event) => {
		setMusicEnabled(
			event.target.checked
		)
	}
)

inGameSettingsUI.musicVolume.addEventListener(
	'input',
	(event) => {
		setMusicVolumeFromPercentage(
			event.target.value
		)
	}
)


// use escape to open or close settings
window.addEventListener(
	'keydown',
	(event) => {

		if (event.key !== 'Escape') return
		if (event.repeat) return
		if (event.defaultPrevented) return

		if (
			gameState.currentScene === 'information' || 
			gameState.currentScene === 'quick-info'
		) {
			return
		}


		if (gameState.currentScene === 'settings') {
			event.preventDefault()
			closeInGameSettings()
			return
		}

		if (gameState.currentScene === 'world') {
			event.preventDefault()
			openInGameSettings()
		}
	}
)

syncSettingsControls()


// =========================================================
// GAME STARTUP AND WORLD PAUSING
// =========================================================

// scale and center the map inside the website window
function positionWholeMapPreview() {
	const mapWidth = startupMapPreview.naturalWidth

	const mapHeight = startupMapPreview.naturalHeight

	if (!mapWidth || !mapHeight) return

	const wholeMapScale = Math.min(
		GAME_WIDTH / mapWidth,
		GAME_HEIGHT / mapHeight
	)

	const centeredX =
		(
			GAME_WIDTH - mapWidth * wholeMapScale
		) / 2

	const centeredY =
		(
			GAME_HEIGHT - mapHeight * wholeMapScale
		) / 2

	window.gsap.set(
		startupMapPreview,
		{
			x: centeredX,
			y: centeredY,
			scale: wholeMapScale,
			opacity: 1
		}
	)
}


// startup map is positioned after browser knows image dimensions 
if (
	startupMapPreview.complete &&
	startupMapPreview.naturalWidth
) {
	positionWholeMapPreview()
} else {
	startupMapPreview.addEventListener(
		'load',
		positionWholeMapPreview,
		{
			once: true
		}
	)
}


async function startGame() {
	if (gameState.hasStarted) return

	startupUI.startGameButton.disabled = true
	startupUI.startGameButton.textContent = 'Loading...'

	// dont not begin the game until every required image is ready.
	await gameImagePreloadPromise

	if (imagePreloadFailure) {
		console.error(
			'The game could not start because an image failed to load:',
			imagePreloadFailure
		)

		startupUI.startGameButton.textContent = 'Loading Failed'
		return
	}

	const preloadSeconds = (
		(performance.now() - imagePreloadStartedAt) / 1000
	).toFixed(2)

	console.log(`${preloadedImageCount} images loaded in ${preloadSeconds} seconds`)

	gameState.hasStarted = true
	gameState.audioUnlocked = true

	startupUI.startGameButton.textContent = 'Start Game'

	drawWorldFrame()
	audioManager.playMapMusic()

	const worldStartView = getWorldStartView()

	const finishStartingGame = () => {
		startupUI.overlay.style.display = 'none'
		startupMapPreview.style.display = 'none'

		inGameSettingsUI.button.classList.remove('is-hidden')

		showQuickInfoButton()
		startWorld()
	}

	const startupTimeline =
		window.gsap.timeline({
			onComplete:
				finishStartingGame
		})

	startupTimeline.to(
		startupUI.settingsPanel,
		{
			opacity: 0,
			duration: 0.25,
			pointerEvents: 'none'
		}
	)

	// zoom the map background into the starting camera position.
	startupTimeline.to(
		startupMapPreview,
		{
			x: worldStartView.x,
			y: worldStartView.y,
			scale: 1,
			duration: 1.8,
			ease: 'power2.inOut'
		},
		0.1
	)

	startupTimeline.to(
		startupUI.overlay,
		{
			backgroundColor:
				'rgba(0, 0, 0, 0)',

			duration: 1.4,
			ease: 'power1.out'
		},
		0.1
	)

	startupTimeline.to(
		startupMapPreview,
		{
			opacity: 0,
			duration: 0.18
		},
		1.72
	)
}

// open the settings menu when player is in the main world
function openInGameSettings() {
	if (gameState.currentScene !== 'world') {
		return
	}

	stopWorld()

	gameState.currentScene = 'settings'

	syncSettingsControls()
	hideQuickInfoButton()

	inGameSettingsUI.overlay.classList.remove('is-hidden')
}

function closeInGameSettings() {
	const settingsAreAlreadyClosed =
		inGameSettingsUI.overlay.classList.contains('is-hidden')

	if (settingsAreAlreadyClosed) return

	inGameSettingsUI.overlay.classList.add('is-hidden')

	startWorld()
	showQuickInfoButton()

	audioManager.playCurrentSceneMusic()
}


// =========================================================
// BUILDING SCENE CONNECTIONS
// =========================================================

// transition from main world to building
function beginBuildingEntry(interiorId) {
	if (
		gameState.information.active || quickInfoState.active
	) {
		return
	}

	const definition = window.interiorDefinitions?.[interiorId]

	gameState.currentScene = 'transition'
	inGameSettingsUI.button.classList.add('is-hidden')

	hideQuickInfoButton()
	audioManager.stopMapMusic()

	const transitionStarted =
		transitionBetweenExplorationScenes({
			onCovered: () => {
				startInterior(interiorId)
				showQuickInfoButton()
			}
		})

}

// transition from building to main world
function beginBuildingExit() {
	if (quickInfoState.active) {
		return
	}

	gameState.currentScene = 'transition'
	hideQuickInfoButton()

	const transitionStarted =
		transitionBetweenExplorationScenes({
			onCovered: () => {
				resetInteriorScene()
				startWorld()

				inGameSettingsUI.button.classList.remove('is-hidden')

				showQuickInfoButton()
				audioManager.playMapMusic()
			}
		})
}


// =========================================================
// BATTLE SCENE CONNECTIONS
// =========================================================


function beginBattle() {
	if (
		gameState.information.active || quickInfoState.active
	) {
		return
	}

	if (!gameState.settings.battlesEnabled) {
		gameState.battle.active = false
		startWorld()
		return
	}

	gameState.currentScene = 'transition'
	inGameSettingsUI.button.classList.add('is-hidden')

	hideQuickInfoButton()
	stopWorld()

	transitionIntoBattle({
		onCovered: () => {
			initializeBattle({
				enemyData: chooseRandomEnemy(),
				onBattleEnd: endBattle
			})
			startBattleAnimation()
		}
	})
}



function endBattle(result) {
	gameState.currentScene = 'transition'

	transitionOutOfBattle({
		result,

		onCovered: () => {
			stopBattleAnimation()
			resetBattle()
			gameState.world.battleCooldownUntil = Date.now() + 2000
			
			player.facing = 'down'
			player.image = player.sprites.down
			player.animate = false
			player.frames.val = 0
			player.frames.elapsed = 0

			dogFollower.forceSitBeside(
				player,
				boundaries
			)

			startWorld()
			inGameSettingsUI.button.classList.remove(
				'is-hidden'
			)
			showQuickInfoButton()
		}
	})
}


// =========================================================
// QUICK INFORMATION MENU
// =========================================================


function openStartupQuickInfo() {
	if (
		quickInfoState.active || gameState.information.active
	) {
		return
	}

	//position the map preview before showing the menu.
	startupMapPreview.style.display = 'block'
	positionWholeMapPreview()

	startupUI.overlay.style.display = 'none'

	quickInfoState.active = true
	quickInfoState.returnScene = 'startup'
	quickInfoState.viewingInformation = false

	gameState.currentScene = 'quick-info'

	clearExplorationInput()
	hideInteractionPrompt()

	inGameSettingsUI.button.classList.add('is-hidden')

	hideQuickInfoButton()
	audioManager.pauseAllMusic()
	showQuickInfoMenu()
}

function openQuickInfo() {
	const returnScene =
		gameState.currentScene

	if (
		returnScene !== 'world' && returnScene !== 'interior'
	) {
		return
	}

	if (
		quickInfoState.active ||
		gameState.information.active ||
		gameState.battle.active ||
		gameState.transition.active
	) {
		return
	}

	if (returnScene === 'interior') {
		pauseInterior()
	} else {
		stopWorld()
	}

	quickInfoState.active = true
	quickInfoState.returnScene = returnScene
	quickInfoState.viewingInformation = false

	gameState.currentScene = 'quick-info'

	clearExplorationInput()
	hideInteractionPrompt()

	inGameSettingsUI.button.classList.add('is-hidden')
	hideQuickInfoButton()

	audioManager.pauseAllMusic()
	showQuickInfoMenu()
}


// opening the page after quick info is selected
function handleQuickInfoSelection(contentId) {
	if (!quickInfoState.active) {return}

	hideQuickInfoMenu()

	quickInfoState.viewingInformation = true
	gameState.information.active = true
	gameState.information.contentId = contentId
	gameState.information.returnScene = quickInfoState.returnScene
	gameState.currentScene = 'information'

	const popupOpened = openInformationPopup(contentId)

	if (popupOpened) {return}

	// if the content cannot open, return to the quick info menu.
	gameState.information.active = false
	gameState.information.contentId = null
	gameState.information.returnScene = null
	quickInfoState.viewingInformation = false
	gameState.currentScene = 'quick-info'
	showQuickInfoMenu()
}


// return to the original scene before menu was oepend
function resumeAfterQuickInfoMenu() {
	if (!quickInfoState.active) {return}

	// don't close menu if a page is still open
	if (
		quickInfoState.viewingInformation
	) {
		return
	}

	const returnScene = quickInfoState.returnScene
	hideQuickInfoMenu()

	quickInfoState.active = false
	quickInfoState.returnScene = null
	quickInfoState.viewingInformation = false

	clearExplorationInput()

	// if the menu was opened before gameplay, return to the experience selection screen.
	if (returnScene === 'startup') {
		gameState.currentScene = 'startup'
		startupUI.overlay.style.display = 'flex'
		startupMapPreview.style.display = 'block'

		positionWholeMapPreview()
		showStartupPanel(startupUI.laptopPanel)

		return
	}
	resumeExplorationScene(returnScene)
}

// =========================================================
// INFORMATION POPUP CONNECTIONS
// =========================================================

// read info
function beginInformationInteraction(
	contentId,
	returnScene = gameState.currentScene
) {
	if (
		gameState.information.active || quickInfoState.active
	) {
		return
	}

	gameState.information.active = true
	gameState.information.contentId = contentId
	gameState.information.returnScene = returnScene
	gameState.currentScene = 'information'

	clearExplorationInput()
	hideInteractionPrompt()

	inGameSettingsUI.button.classList.add('is-hidden')
	hideQuickInfoButton()

	const popupOpened = openInformationPopup(contentId)

	if (!popupOpened) {
		gameState.information.active = false
		gameState.information.contentId = null
		gameState.information.returnScene = null

		resumeExplorationScene(returnScene)
	}
}

// close info popup
function resumeAfterInformationPopup() {
	if (!gameState.information.active) {return}

	const returnScene = gameState.information.returnScene

	gameState.information.active = false
	gameState.information.contentId = null
	gameState.information.returnScene = null

	clearExplorationInput()

	// if the page is from quick info, reopen the quick info menu
	if (
		quickInfoState.active && quickInfoState.viewingInformation
	) {
		quickInfoState.viewingInformation = false
		gameState.currentScene = 'quick-info'
		showQuickInfoMenu()
		return
	}
	resumeExplorationScene(returnScene)
}

// used after info is read and battles are finished
function resumeExplorationScene(
	sceneName
) {
	if (sceneName === 'interior') {
		gameState.currentScene ='interior'
		showQuickInfoButton()
		resumeInterior()
		return
	}

	gameState.currentScene = 'world'
	startWorld()

	// Restart the outdoor map music after returning to the world.
	audioManager.playMapMusic()
	inGameSettingsUI.button.classList.remove('is-hidden')
	showQuickInfoButton()
}