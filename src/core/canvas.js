// the display
const GAME_WIDTH = 1024
const GAME_HEIGHT = 576

const gameContainer = document.querySelector('#gameContainer')
const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')

canvas.width = GAME_WIDTH
canvas.height = GAME_HEIGHT

// keep pixel-art sprites sharp when they are scaled
context.imageSmoothingEnabled = false

// scaling full game to fit in avaliable screen
// visualViewport helps the calculation on mobile devices
function resizeGame() {
	const viewport = window.visualViewport

	const availableWidth =
		viewport?.width ||
		document.documentElement.clientWidth ||
		window.innerWidth

	const availableHeight =
		viewport?.height ||
		document.documentElement.clientHeight ||
		window.innerHeight

	const horizontalScale = availableWidth / GAME_WIDTH
	const verticalScale = availableHeight / GAME_HEIGHT
	const scale = Math.max(0.1, Math.min(horizontalScale, verticalScale))

	gameContainer.style.transform = `scale(${scale})`
	gameContainer.style.setProperty('--game-scale', scale)
}

// recalculate scale when the browser or device layout changes
window.addEventListener('resize', resizeGame)
window.addEventListener('orientationchange', resizeGame)
window.visualViewport?.addEventListener('resize', resizeGame)

resizeGame()
