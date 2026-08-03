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
	astronomyDataProjects,
	pm25Project,
	yelpDatabaseProject,
	hqProject,
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

		introParagraphs: workExperience,

		jumpLinks: [
			{
				label: 'Applied Data Science Projects',
				targetId: 'data-projects'
			},
			{
				label: 'Research',
				targetId: 'research-experience'
			},
			{
				label: 'Teaching & Mentoring',
				targetId: 'teaching-mentoring'
			}
		],

		groups: [
			{
				id: 'data-projects',
				title: 'Applied Data Science Projects',
				className: 'projects',

				sections: [
					{
						heading: 'Program Analytics and Social Protection Access',
						role: 'USC Graduate Research and Consulting Project',
						date: '2025',
						paragraphs: hqProject,

						bullets: [
							'Cleaned and reviewed field-worker and program activity data, checking for missing values, inconsistent records, unusual entries, and reporting gaps that could affect the analysis.',
							'Examined how field-worker activity changed over time and compared patterns in outreach, engagement, and service delivery to identify where participation or program activity differed.',
							'Summarized the main patterns in the data and developed preliminary recommendations for improving outreach and field operations.',
							'Clearly separated observed trends from conclusions that would require additional analysis.'
						]
					},

					{
						heading: 'Database Systems and Query Performance Analysis',
						role: 'PostgreSQL and MongoDB Benchmarking Project',
						date: '2024',
						paragraphs: yelpDatabaseProject,

						bullets: [
							'Data Preparation: Cleaned and transformed semi-structured business and review data for use in both relational and document database systems.',
							'Database Design: Created PostgreSQL tables and MongoDB collections that supported comparable analytical tasks across both platforms.',
							'Query Development: Wrote SQL queries and MongoDB aggregation pipelines for filtering, joining, grouping, text search, and nested data analysis.',
							'Performance Benchmarking: Compared query runtimes, execution plans, documents or rows examined, and the effects of different indexing strategies.',
							'Technical Communication: Summarized the strengths, limitations, and appropriate use cases of relational and document-oriented databases.'
						],

						links: [
							{
								label: 'View GitHub Repository',
								url: 'https://github.com/tygurlile/YelpDatabaseSystemsAnalysis'
							}
						]
					},
					{
						heading: 'Environmental Data Modeling and Health Analytics',
						role: 'Applied Data Science Project',
						date: '2024',
						paragraphs: pm25Project,

						bullets: [
							'Data Integration and Cleaning: Prepared and joined CDC, NOAA, and air-quality data with different formats, geographic units, and time periods.',
							'Exploratory Data Analysis: Examined trends, seasonal patterns, geographic differences, correlations, missing values, and potential data-quality issues.',
							'Feature Engineering: Created time-based, weather, and location-related variables for use in statistical analysis and predictive modeling.',
							'Predictive Modeling: Built models to estimate PM2.5 levels and evaluated how weather and environmental variables affected prediction performance.',
							'Model Evaluation: Compared results using appropriate performance metrics and investigated where model predictions were less reliable.',
							'Communication: Presented findings through visualizations and a written report while distinguishing statistical relationships from causal conclusions.'
						],

						links: [
							{
								label: 'View GitHub Repository',
								url: 'https://github.com/tygurlile/pm25HealthImpactModeling'
							}
						]
					},
					{
						heading: 'Scientific Data Analysis Projects',
						role: 'Advanced Scientific Computing Coursework',
						date: '2024',
						paragraphs: astronomyDataProjects,

						bullets: [
							'Used SQL-like database queries and public data APIs to retrieve, filter, join, and analyze large observational datasets from multiple sources.',
							'Bayesian Statistical Modeling: Built probabilistic models to estimate unobserved quantities, quantify uncertainty, compare model assumptions, and interpret posterior results.',
							'High-Dimensional Predictive Modeling: Processed complex numerical data, engineered model inputs, and applied regression methods to predict physical properties from thousands of measured features.',
							'Image Classification: Built and evaluated machine-learning models for multiclass image classification, comparing performance metrics and investigating common prediction errors.'
						],

						links: [
							{
								label: 'View GitHub Repository',
								url: 'https://github.com/tygurlile/AstronomyDataScienceProjects'
							}
						]
					}
				]
			},

			{
				id: 'research-experience',
				title: 'Research Experience',
				className: 'research',

				sections: [
					{
						heading: 'Space Sciences Laboratory - UC Berkeley',
						subheading: 'Daytime Thermospheric Wind Transients and Circulation in May 2021',
						role: 'Undergraduate Researcher',
						date: 'Aug 2021–May 2025',
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
						role: 'Research Intern',
						date: 'Jun–Aug 2024',
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
				id: 'teaching-mentoring',
				title: 'Teaching and Mentoring',
				className: 'teaching',

				sections: [
					{
						heading: 'USC DSO Research Experiences for Undergraduates',
						role: 'Graduate Student Instructor and Mentor',
						date: 'Jun 2026–Aug 2026',
						paragraphs: aiResearch
					},

					{
						heading: 'Introduction to General Astronomy - UC Berkeley',
						role: 'Reader and Grader',
						date: 'Aug 2022–Dec 2024',
						paragraphs: reading
					},

					{
						heading: 'Mauna Kea Scholars Program',
						role: 'Research Mentor',
						date: 'Jun–Aug 2024',
						paragraphs: mkScholar
					},

					{
						heading: 'Python Programming in Astronomy - UC Berkeley',
						role: 'Reader, Grader, and Teaching Assistant',
						date: 'Jun–Aug 2023',
						paragraphs: pythonProgramming
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
						role: 'Volunteer Outreach Coordinator',
						date: 'Jun–Aug 2024',

						paragraphs: outreach1,

						bullets: [
							'Organized public stargazing and astronomy education events.',
							'Explained complex scientific concepts to diverse age groups.',
							'Connected astronomy education with Hawaiian cultural knowledge.'
						]
					},

					{
						heading: 'Middle School Science Fair Mentor',
						role: 'Volunteer Science Fair Coach',
						date: '2023',

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
						role: 'Project Leader',
						date: 'Aug 2017–Jan 2020',

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
