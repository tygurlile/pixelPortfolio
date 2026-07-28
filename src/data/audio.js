
// audio setup for game
// background music uses web audio so slider works correctly
// sound effects use HTML5 audio which is better for delayed playback

const HowlConstructor = window.Howl
const HowlerController = window.Howler

// keeps the browser from pausing the audio system automatically
HowlerController.autoUnlock = true
HowlerController.autoSuspend = false


function createMusic(fileName) {
	return new HowlConstructor({
		src: [`./audio/${fileName}.mp3`],
		html5: false,
		preload: true,
		loop: true,
		volume: gameState.settings.musicVolume
	})
}

function createEffect(
	fileName,
	volume,
	useHtml5 = false,
	playbackRate = 1
) {
	return new HowlConstructor({
		src: [`./audio/${fileName}.mp3`],
		html5: useHtml5,
		preload: true,
		volume,
		rate: playbackRate
	})
}

const audio = {
	mapMusic: createMusic('jupiter'),
	battleMusic: createMusic('mars'),

	initBattleSound: createEffect('initBattle', 0.3),
	pounceSound: createEffect('pounce', 0.4),
	howlAttackSound: createEffect('howl', 0.18),
	zoomiesHitSound: createEffect('zoomies', 0.2),
	goodBoySound: createEffect('goodBoy', 0.18),
	lightBeamSound: createEffect('lightBeam', 0.16),
	jettSound: createEffect('jet', 0.2, false, 6),
	redshiftSound: createEffect('redshift', 0.6),
	accretionDiskSound: createEffect('accretionDisk', 0.15),

	recursiveCallSounds: [
		createEffect('recursiveCall1', 1),
		createEffect('recursiveCall2', 1),
		createEffect('recursiveCall3', 1)
	],

	baseCaseSound: createEffect('baseCase', 0.15),
	stackOverflowSound: createEffect('stackOverflow', 0.7),
	memorizeSound: createEffect('memorize', 0.15),
	binarySearchSound: createEffect('binarySearch', 0.17),
	optimizeSound: createEffect('optimize', 0.15),
	infiniteLoopSound: createEffect('infiniteLoop', 0.6),
	runtimeAnalysisSound: createEffect('runtimeError', 0.4),
	exploreSound: createEffect('explore', 0.25),
	exploitSound: createEffect('exploit', 0.15),
	luckyDrawSound: createEffect('luckyDraw', 0.4),
	confidenceBoundSound: createEffect('confidenceBound', 0.2),

	faintSound: createEffect('faint', 0.42),
	victorySound: createEffect('victory', 0.3),
	defeatSound: createEffect('defeat', 0.3)
}


const musicPlaybackState = {
	mapMusic: {
		id: null,
		position: 0
	},
	battleMusic: {
		id: null,
		position: 0
	}
}

const musicTracks = [
	audio.mapMusic,
	audio.battleMusic
]

const battleSoundEffects = [
	audio.initBattleSound,
	audio.pounceSound,
	audio.howlAttackSound,
	audio.zoomiesHitSound,
	audio.goodBoySound,
	audio.lightBeamSound,
	audio.jettSound,
	audio.redshiftSound,
	audio.accretionDiskSound,
	...audio.recursiveCallSounds,
	audio.baseCaseSound,
	audio.stackOverflowSound,
	audio.memorizeSound,
	audio.binarySearchSound,
	audio.optimizeSound,
	audio.infiniteLoopSound,
	audio.runtimeAnalysisSound,
	audio.exploreSound,
	audio.exploitSound,
	audio.luckyDrawSound,
	audio.confidenceBoundSound,
	audio.faintSound
]

const battleResultSounds = [
	audio.victorySound,
	audio.defeatSound
]


// manage audio unlocking, music playback, volume, and sound cleanup
const audioManager = {
	resumeBrowserAudio() {
		const context = HowlerController?.ctx

		if (!context || context.state === 'running') {
			return Promise.resolve()
		}

		const resumeResult = context.resume()

		// if resuming the audio fails, ignore it and try again on the next interaction
		if (resumeResult?.catch) {
			return resumeResult.catch(() => {
			})
		}

		return Promise.resolve()
	},

	unlockAudio() {
		gameState.audioUnlocked = true
		return this.resumeBrowserAudio()
	},

	setMusicEnabled(enabled) {
		gameState.settings.musicEnabled = Boolean(enabled)

		if (!gameState.settings.musicEnabled) {
			this.pauseAllMusic()
			return
		}

		if (!gameState.hasStarted) {return}
		this.playCurrentSceneMusic()
	},

	setMusicVolume(volume) {
		const numericVolume = Number(volume)

		if (!Number.isFinite(numericVolume)) {return}

		const limitedVolume = Math.max(0, Math.min(1, numericVolume))
		gameState.settings.musicVolume = limitedVolume

		musicTracks.forEach((track) => {
			track.volume(limitedVolume)
		})

		// let volume changes apply immediately 
		Object.entries(musicPlaybackState).forEach(([
			trackName,
			state
		]) => {
			if (state.id === null) return
			audio[trackName].volume(limitedVolume,state.id)
		})
	},

	canPlayMusic() {
		return (
			gameState.audioUnlocked && gameState.settings.musicEnabled
		)
	},


	playCurrentSceneMusic() {
		if (!this.canPlayMusic()) return

		if (
			gameState.currentScene === 'world' || gameState.currentScene === 'settings'
		) {
			this.playMapMusic()
			return
		}

		if (gameState.currentScene === 'battle') {
			this.playBattleMusic()
		}
	},

	// save the current position of music before pausing it
	captureMusicPosition(trackName, track) {
		const state = musicPlaybackState[trackName]

		if (!state || state.id === null) return

		const currentPosition = track.seek(undefined, state.id)

		if (typeof currentPosition === 'number') {
			state.position = currentPosition
		}
	},

	// continue music from its previously saved position
	resumeMusicTrack(trackName, track) {
		const state = musicPlaybackState[trackName]

		if (!state) return

		// dont start another copy if this track is already playing
		if (state.id !== null && track.playing(state.id)) {return}

		if (state.id === null) {
			state.id = track.play()
		} else {
			track.play(state.id)
		}

		const playbackId = state.id

		const restorePosition = () => {
			if (
				playbackId === null ||
				state.position <= 0
			) {
				return
			}

			track.seek(state.position, playbackId)
		}

		// restore the saved position now or wait until the track is ready
		if (track.state() === 'loaded') {
			restorePosition()
		} else {
			track.once('play', restorePosition, playbackId)
		}
	},

	pauseMusicTrack(trackName, track) {
		const state = musicPlaybackState[trackName]

		if (!state || state.id === null) return

		this.captureMusicPosition(trackName, track)

		if (track.playing(state.id)) {
			track.pause(state.id)
		}
	},

	playMapMusic() {
		if (!this.canPlayMusic()) return
		this.pauseBattleMusic()
		this.resumeMusicTrack('mapMusic', audio.mapMusic)
	},

	pauseMapMusic() {
		this.pauseMusicTrack('mapMusic', audio.mapMusic)
	},

	stopMapMusic() {
		this.pauseMapMusic()
	},

	playBattleMusic() {
		if (!this.canPlayMusic()) return

		this.pauseMapMusic()
		this.resumeMusicTrack('battleMusic', audio.battleMusic)
	},

	pauseBattleMusic() {
		this.pauseMusicTrack('battleMusic', audio.battleMusic)
	},

	stopBattleMusic() {
		this.pauseBattleMusic()
	},

	pauseAllMusic() {
		this.pauseMapMusic()
		this.pauseBattleMusic()
	},


	playEffect(sound, { restart = true } = {}) {
		if (!sound || typeof sound.play !== 'function') {
			return null
		}

		this.unlockAudio()

		if (restart) {sound.stop()}

		const playbackId = sound.play()

		// for phone audio errors, try again
		sound.once(
			'playerror',
			() => {
				this.resumeBrowserAudio().then(() => {
					if (!sound.playing(playbackId)) {
						sound.play(playbackId)
					}
				})
			},
			playbackId
		)
		return playbackId
	},

	stopBattleSoundEffects() {
		battleSoundEffects.forEach((sound) => {
			sound.stop()
		})
	},

	stopBattleResultSounds() {
		battleResultSounds.forEach((sound) => {
			sound.stop()
		})
	},

	stopAllBattleSounds() {
		this.stopBattleSoundEffects()
		this.stopBattleResultSounds()
	},

	stopAllMusic() {
		this.pauseAllMusic()
	}
}

audioManager.setMusicVolume(
	gameState.settings.musicVolume
)
