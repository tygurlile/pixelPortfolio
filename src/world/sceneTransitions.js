// overaly used to fade between the outdoor world and building interiors
const explorationTransitionOverlay = '#overlappingDiv'


// fade the screen to black, update the scene, and then fade back in
function transitionBetweenExplorationScenes({
	onCovered,
	onComplete = () => {}
}) {
	// prevent another transition from starting before this one finishes
	if (gameState.transition.active) {return false}

	gameState.transition.active = true

	resetInputState()
	hideInteractionPrompt()

	window.gsap.to(
		explorationTransitionOverlay,
		{
			opacity: 1,
			duration: 0.35,

			onComplete: () => {
				onCovered()

				window.gsap.to(
					explorationTransitionOverlay,
					{
						opacity: 0,
						duration: 0.35,

						onComplete: () => {
							gameState.transition.active = false
							onComplete()
						}
					}
				)
			}
		}
	)
	return true
}
