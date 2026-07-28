// Handles battle scene fades and result sound timing.

const transitionGsap = window.gsap
const overlaySelector = '#overlappingDiv'

// tracks the current battle so delayed audio from an older battle
// cannot affect the new scene
let battleAudioSequence = 0

// cancels the current victory or defeat sound when a new transition starts.
let cancelActiveResultSound = null

const RESULT_SOUND_LIMITS = {victory: 2400, defeat: 1800}
const RESULT_SOUND_FADE_DURATION = 300

function cancelBattleResultSound() {
	if (!cancelActiveResultSound) return
	cancelActiveResultSound()
	cancelActiveResultSound = null
}


// fade from the map into a battle.
function transitionIntoBattle({
	onCovered
}) {
	// mark any older audio callbacks as outdated
	battleAudioSequence += 1

	cancelBattleResultSound()
	audioManager.pauseAllMusic()
	audioManager.stopAllBattleSounds()

	audioManager.playEffect(audio.initBattleSound)

	transitionGsap.to(overlaySelector, {
		opacity: 1,
		repeat: 4,
		yoyo: true,
		duration: 0.4,
		ease: 'none',

		onComplete: () => {
			onCovered()

			transitionGsap.to(overlaySelector, {
				opacity: 0,
				duration: 0.18,
				ease: 'none',

				onComplete: () => {
					// Start the battle music once the battle is visible.
					audioManager.playBattleMusic()
				}
			})
		}
	})
}


function getBattleResultSound(result) {
	if (result === 'victory') {
		return audio.victorySound
	}

	if (result === 'defeat') {
		return audio.defeatSound
	}
	return null
}


function playBattleResultSound(result) {
	const resultSound = getBattleResultSound(result)

	// running away does not have a result sound.
	if (!resultSound) {return Promise.resolve()}

	return new Promise((resolve) => {
		let hasFinished = false
		let stopTimer = null
		let fadeTimer = null
		let playbackId = null

		const finish = ({ stopSound = false } = {}) => {
			if (hasFinished) return

			hasFinished = true

			window.clearTimeout(stopTimer)
			window.clearTimeout(fadeTimer)

			resultSound.off('end', handleEnd, playbackId)
			resultSound.off('loaderror', handleError, playbackId)
			resultSound.off('playerror', handleError, playbackId)

			if (stopSound && playbackId !== null) {
				resultSound.stop(playbackId)
			}

			if (cancelActiveResultSound === cancel) {
				cancelActiveResultSound = null
			}
			resolve()
		}

		const handleEnd = () => finish()
		const handleError = () => {
			finish({
				stopSound: true
			})
		}
		const cancel = () => {
			finish({
				stopSound: true
			})
		}

		// save the playback id so only this sound instance is changed
		playbackId = audioManager.playEffect(resultSound)

		resultSound.once('end', handleEnd, playbackId)
		resultSound.once('loaderror', handleError, playbackId)
		resultSound.once('playerror', handleError, playbackId)

		cancelActiveResultSound = cancel

		const maximumDuration = RESULT_SOUND_LIMITS[result] || 2000
		const fadeStart = Math.max(0, maximumDuration - RESULT_SOUND_FADE_DURATION)

		fadeTimer = window.setTimeout(() => {
			if (
				hasFinished ||
				playbackId === null
			) {
				return
			}

			resultSound.fade(
				resultSound.volume(),
				0,
				RESULT_SOUND_FADE_DURATION,
				playbackId
			)
		}, fadeStart)

		stopTimer = window.setTimeout(() => {
			finish({
				stopSound: true
			})
		}, maximumDuration)
	})
}

// fade out of the battle and return to the map.
function transitionOutOfBattle({
	result,
	onCovered
}) {
	const currentAudioSequence = ++battleAudioSequence

	audioManager.pauseAllMusic()
	audioManager.stopBattleSoundEffects()
	cancelBattleResultSound()
	audioManager.stopBattleResultSounds()

	const resultSoundFinished = playBattleResultSound(result)

	transitionGsap.to(overlaySelector, {
		opacity: 1,
		duration: 0.4,

		onComplete: () => {
			onCovered()

			// reveal map while the result sound finishes
			transitionGsap.to(overlaySelector, {
				opacity: 0,
				duration: 0.4
			})

			resultSoundFinished.then(() => {
				// dont restart map music if another battle has already started
				if (
					currentAudioSequence !== battleAudioSequence ||
					gameState.currentScene !== 'world' ||
					gameState.battle.active
				) {
					return
				}
				audioManager.playMapMusic()
			})
		}
	})
}