// how all of the popups work

const informationElements = {
	overlay: document.querySelector('#informationOverlay'),
	panel: document.querySelector('#informationPanel'),
	closeButton: document.querySelector('#closeInformationButton'),
	eyebrow: document.querySelector('#informationEyebrow'),
	title: document.querySelector('#informationTitle'),
	body: document.querySelector('#informationBody'),
	links: document.querySelector('#informationLinks')
}

let informationPopupCloseHandler = () => {}
let informationPopupInitialized = false
let informationPopupReturnFocus = null


// photos of hubble
function addHubbleGalleryStyles() {
	if (document.querySelector('#hubbleGalleryStyles')) {return}

	const style = document.createElement('style')
	style.id = 'hubbleGalleryStyles'

	style.textContent = `
		.hubble-gallery {
			width: 100%;
			margin-top: 18px;
		}

		.hubble-gallery-frame {
			position: relative;

			display: flex;
			align-items: center;
			justify-content: center;

			width: 100%;
			min-height: 320px;

			overflow: hidden;

			border: 4px solid var(--ui-ink);
			background: var(--ui-paper);
			box-shadow: 5px 5px 0 var(--ui-shadow);

			touch-action: pan-y;
		}

		.hubble-gallery-image {
			display: block;

			width: 100%;
			height: 320px;

			object-fit: contain;
			background: var(--ui-paper-hover);
		}

		.hubble-gallery-button {
			position: absolute;
			top: 50%;
			z-index: 2;

			display: flex;
			align-items: center;
			justify-content: center;

			width: 48px;
			height: 48px;
			padding: 0;

			transform: translateY(-50%);

			border: 4px solid var(--ui-ink);
			background: var(--ui-paper);
			color: var(--ui-ink);

			font-size: 17px;
			line-height: 1;

			box-shadow: 3px 3px 0 var(--ui-shadow);
		}

		.hubble-gallery-button:hover,
		.hubble-gallery-button:focus-visible {
			background: var(--ui-paper-hover);
		}

		.hubble-gallery-button--previous {
			left: 12px;
		}

		.hubble-gallery-button--next {
			right: 12px;
		}

		.hubble-gallery-details {
			display: flex;
			align-items: flex-start;
			justify-content: space-between;
			gap: 18px;

			margin-top: 14px;
		}

		.hubble-gallery-caption {
			flex: 1;

			margin: 0;

			font-size: 10px;
			line-height: 1.8;
		}

		.hubble-gallery-counter {
			flex-shrink: 0;

			font-size: 9px;
			line-height: 1.8;
			white-space: nowrap;
		}

		.hubble-gallery-dots {
			display: flex;
			flex-wrap: wrap;
			align-items: center;
			justify-content: center;
			gap: 9px;

			margin-top: 13px;
		}

		.hubble-gallery-dot {
			width: 13px;
			height: 13px;
			padding: 0;

			border: 3px solid var(--ui-ink);
			background: var(--ui-paper);
		}

		.hubble-gallery-dot.is-active {
			background: var(--ui-accent);
		}

		.hubble-gallery:focus-visible {
			outline: 4px solid var(--ui-accent);
			outline-offset: 5px;
		}

		@media (max-width: 700px) {
			.hubble-gallery-frame {
				min-height: 235px;
			}

			.hubble-gallery-image {
				height: 235px;
			}

			.hubble-gallery-button {
				width: 40px;
				height: 40px;

				border-width: 3px;

				font-size: 14px;
			}

			.hubble-gallery-button--previous {
				left: 8px;
			}

			.hubble-gallery-button--next {
				right: 8px;
			}

			.hubble-gallery-details {
				display: block;
			}

			.hubble-gallery-counter {
				display: block;
				margin-top: 7px;
			}
		}
	`
	document.head.append(style)
}


function initializeInformationPopup({
	onClose
}) {
	informationPopupCloseHandler =
		typeof onClose === 'function'
			? onClose
			: () => {}

	addHubbleGalleryStyles()

	if (informationPopupInitialized) {return}

	informationPopupInitialized = true

	informationElements.closeButton.addEventListener('click', closeInformationPopup)

	// close when user clicks the area outside the panel
	informationElements.overlay.addEventListener(
		'click',
		(event) => {
			if (event.target !== informationElements.overlay) {
				return
			}
			closeInformationPopup()
		}
	)

	// let escape close the popup while it is visible.
	window.addEventListener('keydown', (event) => {
		if (
			event.key !== 'Escape' ||
			informationElements.overlay.classList.contains('is-hidden')
		) {
			return
		}
		event.preventDefault()
		closeInformationPopup()
	})
}


// create a link button 
function createInformationLink(linkDefinition) {
	const link = document.createElement('a')

	link.className = 'information-link-button'
	link.href = linkDefinition.url
	link.textContent = linkDefinition.label
	link.target = '_blank'

	link.rel = 'noopener noreferrer'
	return link
}


function appendParagraphs(container, paragraphs = []) {
	paragraphs.forEach((paragraphText) => {
		const paragraph = document.createElement('p')

		paragraph.className = 'information-copy'
		paragraph.textContent = paragraphText

		container.append(paragraph)
	})
}

function appendBullets(container, bullets = []) {
	if (bullets.length === 0) {return}

	const list = document.createElement('ul')
	list.className = 'information-list'

	bullets.forEach((bulletText) => {
		const item = document.createElement('li')
		item.textContent = bulletText
		list.append(item)
	})
	container.append(list)
}


function appendSectionLinks(container, links = []) {
	if (links.length === 0) {return}

	const linksContainer = document.createElement('div')
	linksContainer.className = 'information-section-links'

	links.forEach((linkDefinition) => {
		linksContainer.append(
			createInformationLink(linkDefinition)
		)
	})
	container.append(linksContainer)
}

// build photo gallery
function createInformationGallery(galleryDefinition) {
	const images = Array.isArray(galleryDefinition.images)
		? galleryDefinition.images
		: []

	if (images.length === 0) {
		return null
	}

	const gallery = document.createElement('div')
	gallery.className = 'hubble-gallery'

	gallery.tabIndex = 0
	gallery.setAttribute('aria-label', galleryDefinition.label || 'Photo gallery')

	const frame = document.createElement('div')
	frame.className = 'hubble-gallery-frame'

	const image = document.createElement('img')
	image.className = 'hubble-gallery-image'
	image.draggable = false

	const previousButton = document.createElement('button')
	previousButton.className =
		'hubble-gallery-button hubble-gallery-button--previous'
	previousButton.type = 'button'
	previousButton.textContent = '‹'
	previousButton.setAttribute('aria-label', 'Previous Hubble photo')

	const nextButton = document.createElement('button')
	nextButton.className =
		'hubble-gallery-button hubble-gallery-button--next'
	nextButton.type = 'button'
	nextButton.textContent = '›'
	nextButton.setAttribute('aria-label', 'Next Hubble photo')

	const details = document.createElement('div')
	details.className = 'hubble-gallery-details'

	const caption = document.createElement('p')
	caption.className = 'hubble-gallery-caption'

	const counter = document.createElement('span')
	counter.className = 'hubble-gallery-counter'

	counter.setAttribute('aria-live', 'polite')

	const dots = document.createElement('div')
	dots.className = 'hubble-gallery-dots'

	let activeIndex = 0
	let touchStartX = null
	let missingPhotoFallbackUsed = false

	const dotButtons = images.map((photo, index) => {
		const dot = document.createElement('button')

		dot.className = 'hubble-gallery-dot'
		dot.type = 'button'
		dot.setAttribute(
			'aria-label',
			`Show Hubble photo ${index + 1}`
		)

		dot.addEventListener('click', () => {
			showImage(index)
		})
		dots.append(dot)
		return dot
	})

	function showImage(index) {
		// loops photo navigation
		activeIndex = (index + images.length) % images.length

		const activePhoto = images[activeIndex]
		missingPhotoFallbackUsed = false

		image.src = activePhoto.src
		image.alt = activePhoto.alt || `Hubble photo ${activeIndex + 1}`

		caption.textContent = activePhoto.caption || ''
		counter.textContent = `${activeIndex + 1} / ${images.length}`

		dotButtons.forEach((dot, dotIndex) => {
			const isActive = dotIndex === activeIndex
			dot.classList.toggle('is-active', isActive)
			dot.setAttribute('aria-current', isActive ? 'true' : 'false')
		})
	}



	// navigating  gallery.
	previousButton.addEventListener('click', () => {
		showImage(activeIndex - 1)
	})

	nextButton.addEventListener('click', () => {
		showImage(activeIndex + 1)
	})

	gallery.addEventListener('keydown', (event) => {
		if (event.key === 'ArrowLeft') {
			event.preventDefault()
			showImage(activeIndex - 1)
			return
		}

		if (event.key === 'ArrowRight') {
			event.preventDefault()
			showImage(activeIndex + 1)
		}
	})

	// starting position of a swipe gesture.
	frame.addEventListener('pointerdown', (event) => {
		touchStartX = event.clientX
	})

	// changing photos when the user swipes far enough 
	frame.addEventListener('pointerup', (event) => {
		if (touchStartX === null) {return}

		const distance = event.clientX - touchStartX
		touchStartX = null

		if (Math.abs(distance) < 45) {return}

		showImage(distance > 0 ? activeIndex - 1 : activeIndex + 1)
	})

	// clear swipe state if pointer interaction is interrupted
	frame.addEventListener('pointercancel', () => {
		touchStartX = null
	})

	frame.append(image, previousButton, nextButton)
	details.append(caption, counter)
	gallery.append(frame, details, dots)

	showImage(0)
	return gallery
}

function createInformationSection(sectionDefinition) {
	const section = document.createElement('section')
	section.className = 'information-section'

	if (sectionDefinition.heading) {
		const heading = document.createElement('h2')

		heading.className = 'information-section-title'
		heading.textContent = sectionDefinition.heading

		section.append(heading)
	}

	if (sectionDefinition.subheading) {
		const subheading = document.createElement('p')
		subheading.className = 'information-section-subheading'
		subheading.textContent = sectionDefinition.subheading
		section.append(subheading)
	}

	if (sectionDefinition.role || sectionDefinition.date) {
		const meta = document.createElement('div')
		meta.className = 'information-section-meta'

		if (sectionDefinition.role) {
			const role = document.createElement('span')
			role.className = 'information-section-role'
			role.textContent = sectionDefinition.role
			meta.append(role)
		}

		if (sectionDefinition.date) {
			const date = document.createElement('span')
			date.className = 'information-section-date'
			date.textContent = sectionDefinition.date
			meta.append(date)
		}

		section.append(meta)
	}

	appendParagraphs(section, sectionDefinition.paragraphs)
	appendBullets(section, sectionDefinition.bullets)

	if (sectionDefinition.gallery) {
		const gallery = createInformationGallery(sectionDefinition.gallery)
		if (gallery) {section.append(gallery)}
	}

	appendSectionLinks(section, sectionDefinition.links)
	return section
}


// group containing one or more related information sections
function createInformationGroup(groupDefinition) {
	const group = document.createElement('section')
	const groupClassName = groupDefinition.className || 'default'

	group.className = `information-group information-group--${groupClassName}`

	if (groupDefinition.id) {
		group.id = groupDefinition.id
		group.tabIndex = -1
	}

	if (groupDefinition.title) {
		const title = document.createElement('h2')

		title.className = 'information-group-title'
		title.textContent = groupDefinition.title

		group.append(title)
	}

	const sections = Array.isArray(groupDefinition.sections)
		? groupDefinition.sections
		: []

	sections.forEach((sectionDefinition) => {
		group.append(createInformationSection(sectionDefinition))
	})
	return group
}


// Render links that should appear above the main information groups.
function renderTopLinks(topLinks = []) {
	if (topLinks.length === 0) {return}

	const topLinksContainer = document.createElement('div')
	topLinksContainer.className = 'information-top-links'

	topLinks.forEach((linkDefinition) => {
		topLinksContainer.append(createInformationLink(linkDefinition))
	})

	informationElements.body.append(topLinksContainer)
}

function renderIntroParagraphs(paragraphs = []) {
	if (paragraphs.length === 0) {return}

	const intro = document.createElement('div')
	intro.className = 'information-intro'

	appendParagraphs(intro, paragraphs)
	informationElements.body.append(intro)
}

function getElementTopInsidePanel(element, panel) {
	let top = 0
	let currentElement = element

	while (
		currentElement && currentElement !== panel
	) {
		top += currentElement.offsetTop
		currentElement = currentElement.offsetParent
	}
	return top
}

function renderJumpLinks(jumpLinks = []) {
	if (jumpLinks.length === 0) {return}

	const navigation = document.createElement('nav')

	navigation.className = 'information-jump-links'
	navigation.setAttribute('aria-label', 'Jump to experience section')

	jumpLinks.forEach((jumpDefinition) => {
		const button = document.createElement('button')

		button.className = 'information-jump-button'
		button.type = 'button'
		button.textContent = jumpDefinition.label

		button.addEventListener('click', () => {
			const target = document.getElementById(jumpDefinition.targetId)

			if (!target) {return}

			const panel = informationElements.panel
			const targetTop = getElementTopInsidePanel(target, panel)

			// leave some space between section heading and top of popup
			const topSpacing = 12

			panel.scrollTo({
				top: Math.max(0, targetTop - topSpacing),
				behavior: 'smooth'
			})
		})
		navigation.append(button)
	})
	informationElements.body.append(navigation)
}

function renderGroups(groups = []) {
	groups.forEach((groupDefinition) => {
		informationElements.body.append(
			createInformationGroup(groupDefinition)
		)
	})
}

// function renderJumpScrollSpacer(jumpLinks = []) {
// 	if (jumpLinks.length === 0) {return}

// 	const spacer = document.createElement('div')

// 	spacer.className = 'information-jump-scroll-spacer'
// 	spacer.setAttribute('aria-hidden', 'true')

// 	informationElements.body.append(spacer)
// }

function renderBottomLinks(links = []) {
	informationElements.links.replaceChildren()

	// separate class when no bottom links are available
	informationElements.links.classList.toggle(
		'is-empty',
		links.length === 0
	)

	links.forEach((linkDefinition) => {
		informationElements.links.append(
			createInformationLink(linkDefinition)
		)
	})
}

function openInformationPopup(contentId) {
	const contentDefinition = informationContent[contentId]

	informationPopupReturnFocus =
		document.activeElement instanceof HTMLElement
			? document.activeElement
			: null

	informationElements.panel.classList.toggle(
		'is-sign-popup',
		contentId.endsWith('-sign')
	)

	informationElements.eyebrow.textContent = contentDefinition.eyebrow || 'Information'
	informationElements.title.textContent = contentDefinition.title || 'Information'

	informationElements.body.replaceChildren()

	const jumpLinks = contentDefinition.jumpLinks || []

	renderTopLinks(contentDefinition.topLinks || [])
	renderIntroParagraphs(contentDefinition.introParagraphs || [])
	renderJumpLinks(jumpLinks)
	renderGroups(contentDefinition.groups || [])
	renderBottomLinks(contentDefinition.links || [])

	informationElements.overlay.classList.remove('is-hidden')
	informationElements.panel.scrollTop = 0

	window.requestAnimationFrame(() => {
		informationElements.closeButton.focus()
	})
	return true
}

function closeInformationPopup() {
	if (
		informationElements.overlay.classList.contains('is-hidden')
	) {
		return
	}

	informationElements.overlay.classList.add('is-hidden')
	informationPopupCloseHandler()

	// return focus to the element that opened the popup 
	if (
		informationPopupReturnFocus && document.contains(informationPopupReturnFocus)
	) {
		informationPopupReturnFocus.focus()
	}
	informationPopupReturnFocus = null
}

// some names got mixed up in the files
function hideInformationPopup() {
	closeInformationPopup()
}
