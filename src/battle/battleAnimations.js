// visual effects, movement, and sound timing of each attack

const gsap = window.gsap

function playSound(sound) {
	return audioManager.playEffect(sound)
}

function wait(milliseconds) {
	return new Promise((resolve) => {
		window.setTimeout(resolve, milliseconds)
	})
}


// wait until the previous animation finishes before starting the next one
function tween(target, options) {
	return new Promise((resolve) => {
		gsap.to(target, {
			...options,
			onComplete: resolve
		})
	})
}

function removeRenderedEffect(renderedSprites, effect) {
	const effectIndex = renderedSprites.indexOf(effect)

	if (effectIndex !== -1) {
		renderedSprites.splice(effectIndex, 1)
	}
}

function insertEffectBehindSprite(renderedSprites, effect, sprite) {
	const spriteIndex = renderedSprites.indexOf(sprite)

	if (spriteIndex === -1) {
		renderedSprites.push(effect)
		return
	}
	renderedSprites.splice(spriteIndex, 0, effect)
}

function insertEffectBetweenSprites(
	renderedSprites,
	effect,
	firstSprite,
	secondSprite
) {
	const firstIndex = renderedSprites.indexOf(firstSprite)
	const secondIndex = renderedSprites.indexOf(secondSprite)

	if (firstIndex === -1 || secondIndex === -1) {
		renderedSprites.push(effect)
		return
	}

	const laterSpriteIndex = Math.max(firstIndex, secondIndex)

	renderedSprites.splice(
		laterSpriteIndex,
		0,
		effect
	)
}

function getSpriteCenter(sprite) {
	return {
		x: sprite.position.x + sprite.width / 2,
		y: sprite.position.y + sprite.height / 2
	}
}

function getDirectionBetweenSprites(attacker, recipient) {
	const attackerCenter = getSpriteCenter(attacker)
	const recipientCenter = getSpriteCenter(recipient)

	const differenceX = recipientCenter.x - attackerCenter.x
	const differenceY = recipientCenter.y - attackerCenter.y
	const distance = Math.hypot(differenceX, differenceY) || 1

	return {
		x: differenceX / distance,
		y: differenceY / distance
	}
}


// find position close to opponent for attacks like pounce
function getApproachPosition(
	attacker,
	recipient,
	gap = 82
) {
	const recipientCenter = getSpriteCenter(recipient)
	const direction = getDirectionBetweenSprites(attacker, recipient)

	return {
		x: recipientCenter.x -
			direction.x * gap -
			attacker.width / 2,
		y:
			recipientCenter.y -
			direction.y * gap -
			attacker.height / 2
	}
}


// point where a directional effect should leave the attacker
function getFrontPoint(attacker, recipient) {
	const center = getSpriteCenter(attacker)
	const direction = getDirectionBetweenSprites(attacker, recipient)

	const horizontalDistance =
		(attacker.width * 0.48) /
		Math.max(
			Math.abs(direction.x),
			0.001
		)
	const verticalDistance =
		(attacker.height * 0.48) /
		Math.max(
			Math.abs(direction.y),
			0.001
		)
	const edgeDistance = Math.min(
		horizontalDistance,
		verticalDistance
	)

	return {
		x: center.x + direction.x * edgeDistance,

		y: center.y + direction.y * edgeDistance
	}
}


// save attack effect images after they load for reuse without loading again
const battleEffectImageCache = new Map()

function loadBattleEffectImage(src) {
	if (battleEffectImageCache.has(src)) {
		return battleEffectImageCache.get(src)
	}

	const imagePromise = new Promise(
		(resolve, reject) => {
			const image = new Image()

			image.onload = () => resolve(image)
			image.onerror = () => reject(
				new Error(
					`Could not load battle effect: ${src}`
				)
			)
			image.src = src
		}
	)
	battleEffectImageCache.set(src, imagePromise)
	return imagePromise
}

// takes a sprite sheet and draws the animation at requested place
class GridSpriteEffect {
	constructor({
		image,
		position,
		columns = 6,
		rows = 5,
		scale = 0.4,
		duration = 700,
		opacity = 1,
		rotation = 0
	}) {
		this.image = image
		this.position = { ...position }

		this.columns = columns
		this.rows = rows
		this.totalFrames = columns * rows

		this.sourceWidth = image.width / columns
		this.sourceHeight = image.height / rows

		this.width = this.sourceWidth * scale
		this.height = this.sourceHeight * scale

		this.duration = duration
		this.opacity = opacity
		this.rotation = rotation
		this.startedAt = performance.now()
	}


	// draw the correct sprite-sheet frame based on elapsed time.
	draw(context) {
		const elapsed = Math.min(
			this.duration,
			performance.now() -
				this.startedAt
		)

		const progress =
			this.duration === 0
				? 1
				: elapsed / this.duration

		const frame = Math.min(
			this.totalFrames - 1,
			Math.floor(
				progress * this.totalFrames
			)
		)

		const column = frame % this.columns

		const row = Math.floor(frame / this.columns)

		context.save()
		context.globalAlpha = this.opacity

		context.translate(
			this.position.x + this.width / 2,
			this.position.y + this.height / 2
		)

		context.rotate(this.rotation)

		context.translate(
			-this.width / 2,
			-this.height / 2
		)

		context.drawImage(
			this.image,
			column * this.sourceWidth,
			row * this.sourceHeight,
			this.sourceWidth,
			this.sourceHeight,
			0,
			0,
			this.width,
			this.height
		)

		context.restore()
	}
}


// plays attack effect and removes it when animation finishes
async function startGridEffect({
	src,
	renderedSprites,
	center,
	scale,
	duration = 700,
	columns = 6,
	rows = 5,
	rotation = 0,
	behindSprite = null,
	moveToCenter = null,
	rotateBy = 0
}) {
	const image = await loadBattleEffectImage(src)

	const effect = new GridSpriteEffect({
		image,
		position: {
			x: 0,
			y: 0
		},
		columns,
		rows,
		scale,
		duration,
		rotation
	})

	effect.position.x = center.x - effect.width / 2
	effect.position.y = center.y - effect.height / 2

	if (behindSprite) {
		insertEffectBehindSprite(
			renderedSprites,
			effect,
			behindSprite
		)
	} else {
		renderedSprites.push(effect)
	}

	const animations = [wait(duration)]

	if (moveToCenter) {
		animations.push(
			tween(effect.position, {
				x: moveToCenter.x - effect.width / 2,
				y: moveToCenter.y - effect.height / 2,
				duration: duration / 1000,
				ease: 'power2.inOut'
			})
		)
	}

	if (rotateBy) {
		animations.push(
			tween(effect, {
				rotation: effect.rotation + rotateBy,
				duration: duration / 1000,
				ease: 'none'
			})
		)
	}

	// remove the effect after every animation is finished.
	const finished =
		Promise.all(animations).finally(
			() => {
				removeRenderedEffect(
					renderedSprites,
					effect
				)
			}
		)
	return {effect, finished}
}


// draw an expanding ring for howl
class SoundWaveEffect {
	constructor({
		position,
		radius = 8,
		opacity = 0.9
	}) {
		this.position = { ...position }
		this.radius = radius
		this.opacity = opacity
	}


	draw(context) {
		context.save()

		context.globalAlpha = this.opacity
		context.strokeStyle = '#f8f2e8'
		context.lineWidth = 4

		context.beginPath()

		context.arc(
			this.position.x,
			this.position.y,
			this.radius,
			0,
			Math.PI * 2
		)
		context.stroke()
		context.restore()
	}
}


// draw sparkle used by healing effects.
class SparkleEffect {
	constructor({
		position,
		size = 7,
		opacity = 1,
		rotation = 0
	}) {
		this.position = { ...position }
		this.size = size
		this.opacity = opacity
		this.rotation = rotation
	}


	draw(context) {
		context.save()

		context.globalAlpha = this.opacity

		context.translate(this.position.x, this.position.y)
		context.rotate(this.rotation)

		context.fillStyle = '#f8f2e8'

		context.beginPath()
		context.moveTo(0, -this.size)

		context.lineTo(this.size * 0.35, -this.size * 0.35)
		context.lineTo(this.size, 0)
		context.lineTo(this.size * 0.35, this.size * 0.35)
		context.lineTo(0, this.size)
		context.lineTo(-this.size * 0.35, this.size * 0.35)
		context.lineTo(-this.size, 0)
		context.lineTo(-this.size * 0.35, -this.size * 0.35)

		context.closePath()
		context.fill()
		context.restore()
	}
}


// the brackets that close around the target during binary search.
class SearchBracketEffect {
	constructor({
		center,
		width = 150,
		height = 110,
		duration = 650
	}) {
		this.center = { ...center }
		this.width = width
		this.height = height
		this.duration = duration
		this.startedAt = performance.now()
		this.opacity = 1
	}

	draw(context) {
		const progress = Math.min(
			1,
			(performance.now() -this.startedAt) / this.duration
		)

		// moving both brackets inward 
		const gap = this.width * (1 - progress * 0.72)
		const bracketHeight = this.height * (0.65 + progress * 0.35)
		const top = this.center.y - bracketHeight / 2
		const bottom = this.center.y + bracketHeight / 2
		const left = this.center.x - gap / 2
		const right = this.center.x + gap / 2
		const hook = 18

		context.save()

		context.globalAlpha = this.opacity
		context.strokeStyle = '#f8f2e8'
		context.lineWidth = 5
		context.lineCap = 'square'

		context.beginPath()

		context.moveTo(left + hook, top)
		context.lineTo(left, top)
		context.lineTo(left, bottom)
		context.lineTo(left + hook, bottom)
		context.moveTo(right - hook, top)
		context.lineTo(right, top)
		context.lineTo(right, bottom)
		context.lineTo(right - hook,bottom)

		context.stroke()
		context.restore()
	}
}


// temporary number above a monster.
class LuckyNumberEffect {
	constructor({
		center,
		value,
		duration = 700
	}) {
		this.center = { ...center }
		this.value = value
		this.duration = duration
		this.startedAt = performance.now()
	}

	draw(context) {
		const progress = Math.min(
			1,
			(performance.now() - this.startedAt) / this.duration
		)
		context.save()

		// fade and move the number upward
		context.globalAlpha = 1 - progress * 0.6
		context.fillStyle = '#f8f2e8'
		context.strokeStyle = '#3b3935'
		context.lineWidth = 5
		context.font = '28px "Press Start 2P"'
		context.textAlign = 'center'
		context.textBaseline = 'middle'

		const y = this.center.y - progress * 46

		context.strokeText(
			String(this.value),
			this.center.x,
			y
		)

		context.fillText(
			String(this.value),
			this.center.x,
			y
		)
		context.restore()
	}
}


// shake and fade a monster after it takes damage
function animateDamage(
	recipient,
	{
		distance = 12,
		duration = 0.07
	} = {}
) {
	return new Promise((resolve) => {
		const startingX = recipient.position.x
		const pushDirection = recipient.isEnemy ? 1 : -1

		const timeline = gsap.timeline({
			onComplete: () => {
				recipient.position.x = startingX
				recipient.opacity = 1
				resolve()
			}
		})

		timeline
			.to(recipient.position, {
				x: startingX + pushDirection * distance,
				duration,
				repeat: 3,
				yoyo: true,
				ease: 'power1.inOut'
			})
			.to(
				recipient,
				{
					opacity: 0.35,
					duration,
					repeat: 3,
					yoyo: true
				},
				'<'
			)
			.to(recipient.position, {
				x: startingX,
				duration: 0.06
			})
			.to(
				recipient,
				{
					opacity: 1,
					duration: 0.01
				},
				'<'
			)
	})
}


// move forward, hit, and return to the starting position
async function playTackle({
	attacker,
	recipient,
	onHit
}) {
	const startingX = attacker.position.x
	const direction = attacker.isEnemy ? -1 : 1

	await tween(attacker.position, {
		x: startingX - direction * 20,
		duration: 0.18,
		ease: 'power1.out'
	})

	await tween(attacker.position, {
		x: startingX + direction * 42,
		duration: 0.1,
		ease: 'power3.in'
	})

	playSound(audio.tackleHitSound)
	onHit()

	await Promise.all([
		animateDamage(recipient),
		tween(attacker.position, {
			x: startingX,
			duration: 0.22,
			ease: 'power2.out'
		})
	])
}

// lunge toward the recipient and return after
async function playPounce({
	attacker,
	recipient,
	onHit
}) {
	const startingPosition = {...attacker.position}
	const direction = getDirectionBetweenSprites(attacker, recipient)
	const impactPosition = getApproachPosition(attacker, recipient, 82)

	await tween(attacker.position, {
		x: startingPosition.x - direction.x * 14,
		y: startingPosition.y - direction.y * 14 + 8,
		duration: 0.16,
		ease: 'power2.out'
	})

	await tween(attacker.position, {
		x: impactPosition.x,
		y: impactPosition.y - 20,
		duration: 0.24,
		ease: 'power3.in'
	})

	playSound(audio.pounceSound)
	onHit()

	await Promise.all([
		animateDamage(recipient, {
			distance: 20,
			duration: 0.065
		}),

		tween(attacker.position, {
			x: startingPosition.x,
			y: startingPosition.y,
			duration: 0.34,
			ease: 'power2.out'
		})
	])
}


// send expanding sound waves from the attacker toward the recipient
async function playHowl({
	attacker,
	recipient,
	renderedSprites,
	onHit
}) {
	const startingY = attacker.position.y

	const howlOrigin = getFrontPoint(attacker, recipient)

	const waves = [0,80,160].map((delay) => {
		const wave =
			new SoundWaveEffect({
				position: howlOrigin
			})

		insertEffectBetweenSprites(
			renderedSprites,
			wave,
			attacker,
			recipient
		)

		return new Promise((resolve) => {
			gsap.to(wave, {
				radius: 560,
				opacity: 0,
				duration: 0.72,
				delay: delay / 1000,
				ease: 'power1.out',

				onComplete: () => {
					removeRenderedEffect(
						renderedSprites,
						wave
					)
					resolve()
				}
			})
		})
	})
	playSound(audio.howlAttackSound)

	const attackerMotion =
		tween(attacker.position, {
			y: startingY - 4,
			duration: 0.12,
			repeat: 5,
			yoyo: true,
			ease: 'sine.inOut'
		})

	await wait(480)
	onHit()

	await Promise.all([
		attackerMotion,

		animateDamage(recipient, {
			distance: 14,
			duration: 0.055
		}),
		...waves
	])

	attacker.position.y = startingY
}


// dash into the recipient twice 
async function playZoomies({
	attacker,
	recipient,
	onHit
}) {
	const startingPosition = {...attacker.position}
	const direction = getDirectionBetweenSprites(attacker, recipient)
	const perpendicular = {x: -direction.y, y: direction.x}
	const impactPosition = getApproachPosition(attacker, recipient, 74)

	for (
		let hitIndex = 0;
		hitIndex < 2;
		hitIndex += 1
	) {
		const sideOffset =
			hitIndex === 0
				? -12
				: 12

		await tween(attacker.position, {
			x: impactPosition.x + perpendicular.x * sideOffset,
			y: impactPosition.y + perpendicular.y * sideOffset,
			duration: 0.16,
			ease: 'power4.in'
		})
		playSound(audio.zoomiesHitSound)
		const hitConnected = onHit()

		await Promise.all([
			animateDamage(recipient, {
				distance: 10,
				duration: 0.045
			}),

			tween(attacker.position, {
				x: startingPosition.x - direction.x * 34,
				y: startingPosition.y - direction.y * 34,
				duration: 0.15,
				ease: 'power3.out'
			})
		])

		// stop the second hit if the first one failed or ended the battle.
		if (
			!hitConnected || recipient.isFainted
		) {
			break
		}
	}

	await tween(attacker.position, {
		x: startingPosition.x,
		y: startingPosition.y,
		duration: 0.13,
		ease: 'power2.out'
	})
}


// show sparkles around Hubble and apply healing effect
async function playGoodBoy({
	attacker,
	renderedSprites,
	onHeal
}) {
	const startingX = attacker.position.x
	const startingY = attacker.position.y
	const centerX = attacker.position.x + attacker.width / 2
	const centerY = attacker.position.y + attacker.height / 2
	const offsets = [
		[-42, 8],
		[-22, -26],
		[10, -38],
		[38, -14],
		[46, 20],
		[0, 34]
	]
	playSound(audio.goodBoySound)

	const sparkles = offsets.map(
		([offsetX, offsetY], index) => {
			const sparkle =
				new SparkleEffect({
					position: {
						x: centerX + offsetX,

						y: centerY + offsetY
					},

					size: 6 + (index % 3),
					rotation: index * 0.35
				})

			insertEffectBehindSprite(
				renderedSprites,
				sparkle,
				attacker
			)

			return new Promise((resolve) => {
				gsap.to(
					sparkle.position,
					{
						y: sparkle.position.y - 28,
						duration: 0.7,
						delay: index * 0.045,
						ease: 'power1.out'
					}
				)

				gsap.to(sparkle, {
					opacity: 0,
					rotation: sparkle.rotation + 1.4,
					duration: 0.7,
					delay: index * 0.045,

					onComplete: () => {
						removeRenderedEffect(
							renderedSprites,
							sparkle
						)
						resolve()
					}
				})
			})
		}
	)

	// give attacker a small jump and shake
	const attackerMotion =
		new Promise((resolve) => {
			const timeline = gsap.timeline({
				onComplete: () => {
					attacker.position.x = startingX
					attacker.position.y = startingY
					resolve()
				}
			})

			timeline
				.to(attacker.position, {
					y: startingY - 12,
					duration: 0.18,
					ease: 'power2.out'
				})
				.to(attacker.position, {
					x: startingX - 4,
					duration: 0.07,
					repeat: 3,
					yoyo: true,
					ease: 'sine.inOut'
				})
				.to(attacker.position, {
					x: startingX,
					y: startingY,
					duration: 0.22,
					ease: 'bounce.out'
				})
		})

	await wait(260)
	onHeal()

	await Promise.all([
		attackerMotion,
		...sparkles
	])
}


// =========================================================
// QUASAUR ATTACKS
// =========================================================


// fire a long beam from Quasaur's mouth through the recipient.
async function playLightBeam({
	attacker,
	recipient,
	renderedSprites,
	onHit
}) {
	playSound(audio.lightBeamSound)

	const duration = 780
	const image = await loadBattleEffectImage('./attacks/lightBeam.png')

	const mouth = {
		x: attacker.position.x + attacker.width * 0.25,
		y: attacker.position.y + attacker.height * 0.27}
	const target = {
		x: recipient.position.x + recipient.width * 0.52,
		y: recipient.position.y + recipient.height * 0.46
	}

	const differenceX = target.x - mouth.x
	const differenceY = target.y - mouth.y
	const distance = Math.hypot(differenceX, differenceY)
	const directionX = differenceX / distance
	const directionY = differenceY / distance

	const rotation = Math.atan2(differenceY, differenceX) - Math.PI / 2

	const beam =
		new GridSpriteEffect({
			image,
			position: {
				x: 0,
				y: 0
			},
			columns: 6,
			rows: 5,
			scale: 1,
			duration,
			rotation
		})
	beam.width = 175
	beam.height = Math.hypot(GAME_WIDTH, GAME_HEIGHT) * 1.4

	const beamApexRatio = 0.27
	const distanceFromApexToCenter = beam.height / 2 - beam.height * beamApexRatio
	const beamCenter = {
		x: mouth.x + directionX * distanceFromApexToCenter, // - moves left
		y: mouth.y + directionY * distanceFromApexToCenter + 5 // + moves down
	}

	beam.position.x = beamCenter.x - beam.width / 2
	beam.position.y = beamCenter.y - beam.height / 2
	renderedSprites.push(beam)

	const startingX = attacker.position.x

	// shake slightly while the beam charges
	const charge =
		tween(
			attacker.position,
			{
				x: startingX + 5,
				duration: 0.09,
				repeat: 5,
				yoyo: true,
				ease: 'sine.inOut'
			}
		)

	const beamFinished =
		wait(duration).finally(() => {
			removeRenderedEffect(
				renderedSprites,
				beam
			)
		})

	await wait(360)
	onHit()

	await Promise.all([
		beamFinished,
		charge,

		animateDamage(
			recipient,
			{
				distance: 22,
				duration: 0.055
			}
		)
	])

	attacker.position.x = startingX
}


// Send a cosmic jet from the attacker to the recipient.
async function playJett({
	attacker,
	recipient,
	renderedSprites,
	onHit
}) {
	playSound(audio.jettSound)
	const start = getSpriteCenter(attacker)
	const end = getSpriteCenter(recipient)
	const effect =
		await startGridEffect({
			src: './attacks/cosmicJet.png',
			renderedSprites,
			center: start,
			moveToCenter: end,
			scale: 0.34,
			duration: 620,
			rotation: attacker.isEnemy ? Math.PI : 0
		})

	await wait(500)
	onHit()

	await Promise.all([
		effect.finished,
		animateDamage(recipient, {
			distance: 16,
			duration: 0.05
		})
	])
}

// makes hubbles next attack waeaker
async function playRedshift({
	recipient,
	renderedSprites,
	onEffect
}) {
	playSound(audio.redshiftSound)

	const effect =
		await startGridEffect({
			src: './attacks/redshift.png',
			renderedSprites,
			center: getSpriteCenter(recipient),
			scale: 0.42,
			duration: 760,
			behindSprite: recipient,
			rotateBy: Math.PI * 1.2
		})

	await wait(360)
	onEffect()
	await effect.finished
}


// show a rotating disk around the attacker and restore health.
async function playAccretionDisk({
	attacker,
	renderedSprites,
	onHeal
}) {
	playSound(audio.accretionDiskSound)

	const effect =
		await startGridEffect({
			src: './attacks/accretionDisk.png',
			renderedSprites,
			center: getSpriteCenter(attacker),
			scale: 0.68,
			duration: 850,
			rotateBy: Math.PI * 1.5
		})

	effect.isAccretionDiskForeground = true

	await wait(390)
	onHeal()
	await effect.finished
}


// =========================================================
// RECURSAUR ATTACKS
// =========================================================


// preform each recursive call hit with decreasing damage and effect size
async function playRecursiveCall({
	attack,
	attacker,
	recipient,
	renderedSprites,
	onHit
}) {
	const startingPosition = {...attacker.position}
	const direction = getDirectionBetweenSprites(attacker, recipient)
	const perpendicular = {x: -direction.y, y: direction.x}
	const damageSequence = attack.damageSequence || [attack.damage]
	const impactPosition = getApproachPosition(attacker, recipient, 78 )

	for (
		let index = 0;
		index < damageSequence.length;
		index += 1
	) {
		const sideOffset =
			(index - 1) * 11

		await tween(attacker.position, {
			x: impactPosition.x + perpendicular.x * sideOffset,
			y: impactPosition.y + perpendicular.y * sideOffset,
			duration: 0.15,
			ease: 'power4.in'
		})

		// make each attack slightly smaller than the last
		const effect =
			await startGridEffect({
				src: './attacks/recursion.png',
				renderedSprites,
				center:	getSpriteCenter(recipient),
				scale: 0.42 - index * 0.07,
				duration: 330
			})

		await wait(120)

		const healthBeforeHit = recipient.health

		const recursionSound = audio.recursiveCallSounds?.[index]
		if (recursionSound) {playSound(recursionSound)}
		const hitConnected =onHit(damageSequence[index])

		const actualDamage = Math.max(0, healthBeforeHit - recipient.health)

		let damageNumberFinished = Promise.resolve()

		if (actualDamage > 0) {
			const recipientCenter = getSpriteCenter(recipient)

			const damageNumber =
				new LuckyNumberEffect({
					center: {
						x: recipientCenter.x,

						y: recipientCenter.y - recipient.height * 0.45
					},
					value: actualDamage,
					duration: 520
				})
			renderedSprites.push(damageNumber)

			damageNumberFinished =
				wait(520).finally(
					() => {
						removeRenderedEffect(
							renderedSprites,
							damageNumber
						)
					}
				)
		}

		// shake hubble while recursaur moves backward after each hit
		await Promise.all([
			effect.finished,
			damageNumberFinished,

			animateDamage(recipient, {
				distance: 13 - index * 2,
				duration: 0.04
			}),

			tween(attacker.position, {
				x: startingPosition.x - direction.x * 30,
				y: startingPosition.y - direction.y * 30,
				duration: 0.15,
				ease: 'power3.out'
			})
		])

		if (!hitConnected ||recipient.isFainted) {break}
	}

	await tween(attacker.position, {
		x: startingPosition.x,
		y: startingPosition.y,
		duration: 0.14,
		ease: 'power2.out'
	})
}


// restore health 
async function playBaseCase({
	attacker,
	renderedSprites,
	onHeal
}) {
	playSound(audio.baseCaseSound)

	const effect =
		await startGridEffect({
			src: './attacks/baseCase.png',
			renderedSprites,
			center: getSpriteCenter(attacker),
			scale: 0.4,
			duration: 780
		})

	await wait(350)
	onHeal()
	await effect.finished
}


// damage hubble and then apply recoil to attacker
async function playStackOverflow({
	attacker,
	recipient,
	renderedSprites,
	onHit,
	onSelfHit
}) {
	playSound(audio.stackOverflowSound)

	const effect =
		await startGridEffect({
			src: './attacks/stackOverflow.png',
			renderedSprites,
			center: getSpriteCenter(recipient),
			scale: 0.46,
			duration: 760
		})

	await wait(350)
	onHit()

	await animateDamage(recipient, {distance: 24, duration: 0.05})

	await wait(80)
	onSelfHit()

	await Promise.all([
		effect.finished,
		animateDamage(attacker, {distance: 9,duration: 0.04})
	])
}


// memorize effect before move is coppied
async function playMemorize({
	attacker,
	renderedSprites
}) {
	playSound(audio.memorizeSound)

	const effect =
		await startGridEffect({
			src: './attacks/memorize.png',
			renderedSprites,
			center: getSpriteCenter(attacker),

			scale: 0.52,
			duration: 680
		})
	await effect.finished
}


// =========================================================
// ALGORYTHM ATTACKS
// =========================================================


// close search brackets around hubble before applying damage
async function playBinarySearch({
	recipient,
	renderedSprites,
	onHit
}) {
	playSound(audio.binarySearchSound)

	const effect =
		new SearchBracketEffect({
			center: getSpriteCenter(recipient),
			width: Math.max(140, recipient.width * 1.55),
			height: Math.max(105, recipient.height * 1.35),
			duration: 660
		})

	renderedSprites.push(effect)
	await wait(500)
	onHit()
	await animateDamage(recipient, {distance: 15,duration: 0.05})
	await wait(160)
	removeRenderedEffect(renderedSprites,effect)
}

async function playOptimize({
	attacker,
	renderedSprites,
	onEffect
}) {
	playSound(audio.optimizeSound)

	const effect =
		await startGridEffect({
			src: './attacks/optimize.png',
			renderedSprites,
			center: getSpriteCenter(attacker),
			scale: 0.48,
			duration: 720,
		})

	await wait(320)
	onEffect()
	await effect.finished
}

async function playInfiniteLoop({
	recipient,
	renderedSprites,
	onEffect
}) {
	playSound(audio.infiniteLoopSound)

	const effect =
		await startGridEffect({
			src: './attacks/infiniteLoop.png',
			renderedSprites,
			center: getSpriteCenter(recipient),
			scale: 0.44,
			duration: 820,
			rotateBy:Math.PI * 1.6
		})

	await wait(390)
	onEffect()
	await effect.finished
}


// show successful analysis or runtime-error animation
async function playRuntimeAnalysis({
	attacker,
	recipient,
	renderedSprites,
	onHit,
	failed
}) {
	playSound(audio.runtimeAnalysisSound)

	if (failed) {const startingPosition = {...attacker.position}

		const startingOpacity = attacker.opacity
		const startingRotation = attacker.rotation

		const explosion =
			await startGridEffect({
				src: './attacks/runtimeError.png',
				renderedSprites,
				center: getSpriteCenter(attacker),
				scale: 0.58,
				duration: 920,
				rotateBy: Math.PI * 0.18
			})

		await Promise.all([
			tween(attacker.position, {
				x: startingPosition.x + 13,
				y: startingPosition.y - 8,
				duration: 0.055,
				repeat: 9,
				yoyo: true,
				ease: 'none'
			}),

			tween(attacker, {
				opacity: 0.12,
				rotation: startingRotation + 0.16,
				duration: 0.075,
				repeat: 7,
				yoyo: true,
				ease: 'none'
			}),

			explosion.finished
		])

		// restore the sprite after the failed animation.
		attacker.position.x = startingPosition.x
		attacker.position.y = startingPosition.y
		attacker.opacity = startingOpacity
		attacker.rotation = startingRotation
		return
	}

	const successEffect =
		await startGridEffect({
			src: './attacks/runtimeSuccess.png',
			renderedSprites,
			center:	getSpriteCenter(recipient),
			scale: 0.43,
			duration: 760
		})

	await wait(350)
	onHit()

	await Promise.all([
		successEffect.finished,
		animateDamage(recipient, {distance: 24, duration: 0.05})
	])
}

// =========================================================
// OPTUNE ATTACKS
// =========================================================

// move the explore effect from optune toward hubble
async function playExplore({
	attacker,
	recipient,
	renderedSprites,
	onHit
}) {
	playSound(audio.exploreSound)

	const effect =
		await startGridEffect({
			src: './attacks/explore.png',
			renderedSprites,
			center: getSpriteCenter(attacker),
			moveToCenter: getSpriteCenter(recipient),
			scale: 0.45,
			duration: 650,
			rotateBy: Math.PI
		})

	await wait(420)
	onHit()

	await Promise.all([
		effect.finished,
		animateDamage(recipient, {distance: 13,duration: 0.05})
	])
}


// show the setup animation before exploit repeats a previous attack
async function playExploit({
	attacker,
	renderedSprites
}) {
	playSound(audio.exploitSound)
	const effect =
		await startGridEffect({
			src: './attacks/optimize.png',
			renderedSprites,
			center:getSpriteCenter(attacker),
			scale: 0.4,
			duration: 560,
		})
	await effect.finished
}


// display randomly selected damage value and apply hit
async function playLuckyDraw({
	recipient,
	renderedSprites,
	onHit,
	resolvedDamage
}) {playSound(audio.luckyDrawSound)

	const center = getSpriteCenter(recipient)
	const number =
		new LuckyNumberEffect({
			center: {
				x: center.x,
				y: center.y - recipient.height * 0.45
			},
			value: resolvedDamage,
			duration: 720
		})

	renderedSprites.push(number)

	// scale impact effect based on the selected damage value
	const effect =
		await startGridEffect({
			src: './attacks/hit.png',
			renderedSprites,
			center,
			scale: 0.30 + resolvedDamage / 240,
			duration: 650
		})

	await wait(300)
	onHit()

	await Promise.all([
		effect.finished,

		animateDamage(recipient, {
			distance: 8 + resolvedDamage / 2,
			duration: 0.05
		}),
		wait(720)
	])
	removeRenderedEffect(renderedSprites, number)
}


// show rotating shield and apply the damage-reduction effect
async function playConfidenceBound({
	attacker,
	renderedSprites,
	onEffect
}) {
	playSound(audio.confidenceBoundSound)

	const effect =
		await startGridEffect({
			src: './attacks/shield.png',
			renderedSprites,
			center: getSpriteCenter(attacker),
			scale: 0.52,
			duration: 820, 
			rotateBy: Math.PI * 1.25
		})

	await wait(360)
	onEffect()
	await effect.finished

}

const attackAnimations = {
	Tackle: playTackle,
	Pounce: playPounce,
	Howl: playHowl,
	Zoomies: playZoomies,
	GoodBoy: playGoodBoy,
	LightBeam: playLightBeam,
	Jett: playJett,
	Redshift: playRedshift,
	AccretionDisk: playAccretionDisk,
	RecursiveCall: playRecursiveCall,
	BaseCase: playBaseCase,
	StackOverflow: playStackOverflow,
	Memorize: playMemorize,
	BinarySearch: playBinarySearch,
	Optimize: playOptimize,
	InfiniteLoop: playInfiniteLoop,
	RuntimeAnalysis: playRuntimeAnalysis,
	Explore: playExplore,
	Exploit: playExploit,
	LuckyDraw: playLuckyDraw,
	ConfidenceBound: playConfidenceBound
}

function playAttackAnimation({
	attack,
	attacker,
	recipient,
	renderedSprites,
	onHit = () => true,
	onHeal = () => 0,
	onSelfHit = () => 0,
	onEffect = () => {},
	resolvedDamage = attack.damage || 0,
	failed = false
}) {
	const animation = attackAnimations[attack.animation]

	return animation({
		attack,
		attacker,
		recipient,
		renderedSprites,
		onHit,
		onHeal,
		onSelfHit,
		onEffect,
		resolvedDamage,
		failed
	})
}

// pause battle music, play the faint sound
function playFaintSoundAndWait() {
	audioManager.pauseBattleMusic()

	return new Promise((resolve) => {
		let finished = false
		let playbackId = null
		let timeoutId = null

		const finish = () => {
			if (finished) return

			finished = true
			window.clearTimeout(timeoutId)

			if (playbackId !== null) {
				audio.faintSound.off('end', finish, playbackId)
				audio.faintSound.off('playerror', finish, playbackId)
				audio.faintSound.off('loaderror', finish, playbackId)
			}
			resolve()
		}

		playbackId = audioManager.playEffect(audio.faintSound)

		if (playbackId === null) {
			finish()
			return
		}

		audio.faintSound.once('end', finish, playbackId)
		audio.faintSound.once('playerror', finish, playbackId)
		audio.faintSound.once('loaderror', finish, playbackId)

		timeoutId = window.setTimeout(finish, 1100)
	})
}

// Move a fainted monster downward while fading it out.
function playFaintAnimation(monster) {
	const faintSoundFinished = playFaintSoundAndWait()

	const animationFinished =
		new Promise((resolve) => {
			const timeline =
				gsap.timeline({
					onComplete: resolve
				})

			timeline
				.to(monster.position, {
					y: monster.position.y + 20
				})
				.to(
					monster,
					{
						opacity: 0
					},
					'<'
				)
		})
	return Promise.all([animationFinished, faintSoundFinished
	])
}