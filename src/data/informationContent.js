// all the information that goes on the signs and the popouts
const {
	aboutMe,
	hubble,
	education,
	outreach,
	outreach1,
	outreach2,
	outreach3,
	workExperience,
	icon,
	ifa,
	mkScholar,
	pythonProgramming,
	reading,
	aiResearch,
	websiteIdea,
	websiteTools,
	websiteFeatures,
	websiteProcess,
	website
} = window.informationParagraphs

const informationContent = {
	// -------------------------------------
	// OUTDOOR SIGNS
	// -------------------------------------

	'personal-sign': {
		title: 'Personal Building',

		groups: [
			{
				className: 'sign',

				sections: [
					{
						paragraphs: [
							'Enter this building to learn more about me, my education, and my interests.'
						]
					}
				]
			}
		]
	},

	'work-sign': {
		title: 'Work Building',

		groups: [
			{
				className: 'sign',

				sections: [
					{
						paragraphs: [
							'Enter this building to explore my experience, selected projects, and resume.'
						]
					}
				]
			}
		]
	},

	'volunteer-sign': {
		title: 'Volunteer Area',

		groups: [
			{
				className: 'sign',

				sections: [
					{
						paragraphs: [
							'Use the terminal in this area to learn about my volunteer and community experience.'
						]
					}
				]
			}
		]
	},

	// -------------------------------------
	// PERSONAL TERMINAL
	// -------------------------------------

	'personal-overview': {
		title: 'Personal Information',

		groups: [
			{
				title: 'About Me',
				className: 'aboutme',

				sections: [
					{
						paragraphs: aboutMe
					},

					{
						heading: 'Meet Hubble',

						paragraphs: hubble,

						gallery: {
							label: 'Photos of Hubble',

							images: [
								{
									src: './images/hubble/lookingup.png',
									alt: 'lookingup',
									caption: 'Your meeting can wait.'
								},
								{
									src: './images/hubble/waffle.png',
									alt: 'waffle',
									caption: 'Breakfast bandit.'
								},
								{
									src: './images/hubble/walking.png',
									alt: 'walking',
									caption: 'One small step for Hubble.'
								},
								{
									src: './images/hubble/sleeping.png',
									alt: 'sleeping',
									caption: 'Hard at work.'
								}
							]
						}
					}
				]
			},

			{
				title: 'Education',
				className: 'education',

				sections: [
					{
						paragraphs: education,

						bullets: [
							'Data Science: Data Structures, Data Engineering, Bayesian Data Analytics, Advanced Regression Analysis, and Deep Learning for Business Applications',
							'Operations: Measure-Theoretic Probability, Linear Programming, Dynamic Optimization, and Reinforcement Learning',
							'Astrophysics: Multivariable Calculus, Thermodynamics and Quantum Physics, and Relativistic Astrophysics'
						]
					}
				]
			},

			{
				title: 'Interests',
				className: 'interests',

				sections: [
					{
						bullets: [
							'Causal Inference',
							'Product and Operations Analytics',
							'STEM Outreach and Scientific Communication',
							'Astronomy and Astrophysics'
						]
					}
				]
			},

			{
				title: 'Skills',
				className: 'skills',

				sections: [
					{
						bullets: [
							'Programming Languages: Python, Java, JavaScript, C++, and HTML',
							'Database Systems: MongoDB and SQL',
							'Technical Skills: Data Cleaning, Data Visualization, Statistical Computing, and Model Evaluation',
							'Professional Skills: Technical Communication, Research Translation, Mentorship, Stakeholder Engagement, and Cross-Functional Collaboration'
						]
					}
				]
			}
		],

		links: [
			{
				label: 'Connect on LinkedIn',
				url: 'https://www.linkedin.com/in/lilyoglesby/'
			}
		]
	},

	// -------------------------------------
	// WORK TERMINAL
	// -------------------------------------

	'work-overview': {
		title: 'Work Experience',

		topLinks: [
			{
				label: 'Resume',
				url: './src/data/Resume.pdf'
			},
			{
				label: 'GitHub',
				url: 'https://github.com/tygurlile'
			},
			{
				label: 'LinkedIn',
				url: 'https://www.linkedin.com/in/lilyoglesby/'
			}
		],

		groups: [
			{
				title: 'Research Experience',
				className: 'research',

				sections: [
					{
						paragraphs: workExperience
					},

					{
						heading: 'Space Sciences Laboratory - UC Berkeley',
						subheading: 'Daytime Thermospheric Wind Transients and Circulation in May 2021',

						paragraphs: icon,

						links: [
							{
								label: 'Read the Published Paper',
								url: 'https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2025JA033729'
							}
						]
					},

					{
						heading: "Institute for Astronomy - University of Hawai'i at Manoa",
						subheading: 'Machine Learning for Astronomical Anomaly Detection',

						paragraphs: ifa,

						links: [
							{
								label: 'Read the Research Report',
								url: 'https://project.ifa.hawaii.edu/h20/wp-content/uploads/sites/4/2025/05/Oglesby_CHAMP_Report.pdf'
							}
						]
					}
				]
			},

			{
				title: 'Teaching and Mentorship',
				className: 'teaching',

				sections: [
					{
						heading: 'Mauna Kea Scholars Program',
						subheading: 'Research Mentor',
						paragraphs: mkScholar
					},

					{
						heading: 'Python Programming in Astronomy - UC Berkeley',
						subheading: 'Teaching Assistant and Grader',
						paragraphs: pythonProgramming
					},

					{
						heading: 'Introduction to General Astronomy - UC Berkeley',
						subheading: 'Teaching Assistant and Grader',
						paragraphs: reading
					},

					{
						heading: 'USC DSO Research Experience for Undergraduates',
						subheading: 'General Mentor',
						paragraphs: aiResearch
					}
				]
			},

			{
				title: 'Personal Projects',
				className: 'projects',

				sections: [
					{
						heading: 'Interactive Pokémon-Style Portfolio Website',
						paragraphs: website
					}
				]
			}
		]
	},

	// -------------------------------------
	// OUTDOOR VOLUNTEER TERMINAL
	// -------------------------------------

	'volunteer-overview': {
		title: 'STEM Education and Outreach',

		groups: [
			{
				title: 'Why Outreach Matters to Me',
				className: 'outreach-introduction',

				sections: [
					{
						paragraphs: outreach
					}
				]
			},

			{
				title: 'Volunteer Experience',
				className: 'volunteer-experience',

				sections: [
					{
						heading: 'Royal Astronomical Society of Hawaii',
						subheading: 'Volunteer Outreach Coordinator',

						paragraphs: outreach1,

						bullets: [
							'Organized public stargazing and astronomy education events.',
							'Explained complex scientific concepts to diverse age groups.',
							'Connected astronomy education with Hawaiian cultural knowledge.'
						]
					},

					{
						heading: 'Middle School Science Fair Mentor',
						subheading: 'Volunteer Science Fair Coach',

						paragraphs: outreach2,

						bullets: [
							'Mentored students in transforming broad interests into focused, testable research questions.',
							'Advised students on experimental design, methodology, variable selection, and data collection.',
							'Provided hands-on support throughout testing, troubleshooting, and results interpretation.',
							'Prepared students to present their findings through clear visuals, structured explanations, and confident delivery.'
						]
					},

					{
						heading: 'NASA Astrobiology Outreach - UC Riverside',
						subheading: 'Project Leader',

						paragraphs: outreach3,

						bullets: [
							'Designed and led hands-on astrobiology activities for elementary school students and community audiences.',
							'Translated complex scientific topics into clear, age-appropriate explanations that encouraged curiosity and participation.',
							'Coordinated interactive outreach booths at UC Riverside and Riverside’s Long Night of Arts and Innovation.',
							'Trained and supported volunteers in delivering educational activities consistently and confidently.',
							'Promoted early STEM engagement by creating welcoming opportunities for students to explore science through experimentation and discovery.'
						]
					}
				]
			}
		],

		links: []
	},


	// -------------------------------------
	// WEBSITE INFO
	// -------------------------------------

	'website-overview': {
		eyebrow: 'Project Process',
		title: 'How I Built This Website',

		groups: [
			{
				title: 'Behind the Portfolio',
				className: 'projects',

				sections: [
					{
						heading: 'Why I Made It',
						paragraphs: websiteIdea
					},

					{
						heading: 'How It Works',
						paragraphs: websiteTools,
					},

					{
						heading: 'What I Added',
						paragraphs: websiteFeatures
					},

					{
						heading: 'Development Process',
						paragraphs: websiteProcess
					}
				]
			}
		],

		links: [
			{
				label: 'View the Source Code',
				url: 'https://github.com/tygurlile/pixelPortfolio'
			},
			{
				label: 'Read the Full README and Credits',
				url: 'https://github.com/tygurlile/pixelPortfolio#readme'
			}
		]
	}
}
