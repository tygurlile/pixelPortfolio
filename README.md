# Lily Oglesby — Interactive Pixel-Art Portfolio

This is my personal portfolio, but instead of building a normal website, I turned it into a small pixel-art game.

Visitors can walk around the map, enter different buildings, read about my research and experience, meet my dog Hubble, and optionally battle research-inspired creatures. 

> **Built by:** [Lily Oglesby](https://github.com/tygurlile)  
> **Status:** Still in development  
> **Built with:** HTML, CSS, JavaScript, Canvas, Tiled, Howler.js, and GSAP

---

## What Is in the Website?

The portfolio can be explored in two ways:

- **Play Game** lets visitors walk around the map, enter buildings, interact with displays, and run into optional battles.
- **Explore** opens the portfolio information directly for visitors who want to skip the game and read everything more quickly.

The main areas include:

- **Personal Building** — information about me, my education, interests, technical skills, and my dog.
- **Work Building** — research, publications, teaching, mentoring, projects, my résumé, GitHub, and LinkedIn.
- **Volunteer Area** — astronomy outreach, mentoring, and other volunteer work.
- **Battle Areas** — optional encounters with creatures inspired by my interests in data science and astrophysics
- **Interactive Displays** — signs, popups, galleries, and information panels placed throughout the map.

The dog following the player is **Hubble, my dog**. I made him the player's companion and battle partner because he is usually sitting next to me while I work.

---

## Features

### Exploration

- Top-down pixel-art map
- Keyboard and phone controls
- Mobile joystick and interaction button
- Buildings the player can enter
- Interior scenes and displays
- Collision boundaries and interaction zones
- Signs, popups, and photo galleries
- Quick Explore mode
- Responsive layouts for laptops and phones

### Hubble

- Follows the player around the map
- Wanders nearby when the player stops
- Returns to the player when he gets too far away
- Uses separate walking, idle, sitting, and battle animations
- Acts as the player's battle partner

### Battles

- Optional random encounters
- Choice to fight or run
- Research-themed enemies and attacks
- Turn-based battle flow
- Health and level systems
- Attack-use limits
- Healing and status effects
- Victory, defeat, and fainting behavior
- Animated attacks and battle dialogue
- Separate battle music
- Setting to turn battles off

### Audio and Settings

- Continuous map music
- Separate battle music
- Music that pauses inside buildings
- Attack, transition, victory, and defeat sounds
- Mute button
- Volume slider
- Phone-compatible audio behavior
- Battle toggle
- Settings menu

---

## Built With

| Technology | How it is used |
| --- | --- |
| HTML | Page structure, menus, controls, and portfolio content |
| CSS | Layout, responsive design, popups, galleries, menus, and interface styling |
| Vanilla JavaScript | Movement, collisions, interactions, battles, audio, and game state |
| HTML5 Canvas | Drawing the overworld and battle scenes |
| Tiled Map Editor | Building the maps and placing collision, battle, entrance, and interaction zones |
| Howler.js | Music, sound effects, muting, looping, and volume control |
| GSAP | Battle animations, fades, flashes, sprite movement, and transitions |
| Google Fonts | Loading the Press Start 2P font |

I did not use a JavaScript game engine or front-end framework. Most of the game systems are written directly in JavaScript.

---

## Controls

### Laptop

| Action | Control |
| --- | --- |
| Move | `WASD` or arrow keys |
| Interact, enter, or exit | `E` or `Space` |
| Open or close settings | `Escape` or the Settings button |
| Open the direct portfolio view | Explore button |
| Choose battle actions | On-screen buttons |

### Phone

| Action | Control |
| --- | --- |
| Move | On-screen joystick |
| Interact, enter, or exit | `A` button |
| Open settings | Settings button |
| Open the direct portfolio view | Explore button |
| Choose battle actions | Touch buttons |

---

## Project Structure

```text
.
├── index.html
├── styles.css
├── quickInfo.css
├── characters/
│   ├── me/
│   ├── hubble/
│   └── enemy-sprites/
├── images/
│   ├── map-and-foreground/
│   ├── battle-backgrounds/
│   ├── building-interiors/
│   └── hubble-photos/
├── attacks/
│   └── battle-effects/
├── audio/
│   ├── background-music/
│   ├── battle-music/
│   └── sound-effects/
└── src/
    ├── battle/
    ├── classes/
    ├── core/
    ├── data/
    ├── ui/
    ├── world/
    └── main.js
```

---

# Credits

This project uses a mix of original work, commissioned artwork, tutorial material, asset packs, open-source libraries, music arrangements, and AI-assisted development. I have listed the sources I know below. Any third-party artwork, audio, fonts, or code still belong to their original creators and follow their original licenses.

---

### Chris Courses — Pokémon JavaScript Game Tutorial with HTML Canvas

This is how I originally learned the basic structure for the game. The tutorial covers map rendering, movement, collision detection, battle zones, scene transitions, and a basic Canvas battle system. 


- **Creator:** Chris Courses / Chris Lis
- **Video tutorial:** [Pokémon JavaScript Game Tutorial with HTML Canvas](https://www.youtube.com/watch?v=yP5DKzriqXA)
- **Course page:** [Chris Courses course introduction](https://chriscourses.com/courses/pokemon/videos/introduction)
- **Starter code:** [chriscourses/pokemon-style-game](https://github.com/chriscourses/pokemon-style-game)

Since following the tutorial, I have expanded and reorganized the project quite a bit.

Some of the major additions include:

- Portfolio content and navigation
- Enterable buildings and interiors
- Interaction zones and information displays
- Hubble's companion behavior
- Phone controls
- Responsive layouts
- Settings and audio controls
- A quick Explore mode
- Custom enemies and attacks
- Leveling and move-use limits
- Healing and status effects
- More detailed battle dialogue and animations
- A reorganized codebase

---

## Outdoor Map Tiles

The outdoor map uses assets from two different packs. I combined them in Tiled and created the final map layout.

### Top Down Tile and Some Mob Sprite 32×32

- **Creator:** kentang / KentangPixel
- **Source:** [Top Down Tile and Some Mob Sprite 32×32](https://kentangpixel.itch.io/top-down-tile-and-some-mob-sprite)
- **Original tile size:** 32×32 pixels
- **Project tile size:** 48×48 pixels
- **Used for:** Grass, paths, terrain, water, cliffs, cave pieces, rocks, plants, and other outdoor details
- **Changes:** Selected tiles were resized from 32×32 to 48×48 pixels and arranged into the custom map

### Ninja Adventure — Asset Pack

- **Creators:** Pixel-Boy and AAA
- **Source:** [Ninja Adventure — Asset Pack](https://pixel-boy.itch.io/ninja-adventure-asset-pack)
- **License:** Creative Commons Zero v1.0 Universal
- **License page:** [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/)
- **Original tile size:** Mainly 16×16 pixels
- **Project tile size:** 48×48 pixels
- **Used for:** Selected terrain, plants, water, cliffs, paths, environmental objects, and some older tutorial-related assets
- **Changes:** Selected tiles were resized from 16×16 to 48×48 pixels and combined with the other outdoor tiles

### Map Layout and Resizing

I built the final world in **Tiled Map Editor**. ([source: Tiled Map Editor](https://www.mapeditor.org/))

This included:

- Arranging the terrain
- Placing water, paths, buildings, trees, rocks, and signs
- Creating foreground and background layers
- Adding collision boundaries
- Marking battle zones
- Adding building entrances
- Placing interaction zones

Some tilesheets had to be resized so everything would work on the same **48×48-pixel grid**. That resizing was a technical step and does not change ownership of the original art.

---

## Battle Background

- **Artist:** Hayashi Draws
- **Profile:** [Hayashi Draws on X](https://x.com/hayashidraws)
___

## Buildings and Interiors

### KR Mars Colony Tileset for RPGs

- **Creator:** Kokoro Reflections
- **Source:** [KR Mars Colony Tileset for RPGs](https://kokororeflections.itch.io/kr-mars-colony-tileset-for-rpgs)
- **Usage terms:** [Kokoro Reflections asset terms](https://kokororeflections.com/terms-use/)
- **Available sizes:** 32×32 and 48×48 pixels
- **Used for:** Building exteriors, interior rooms, floors, walls, greenhouse pieces, furniture, computers, displays, and science-fiction decorations

I used these assets to build the portfolio buildings and interior rooms. I created the room layouts, building purposes, exhibit placement, and interaction content myself.

---

## Character Artwork

### Lily and Hubble

All sprites of **Lily** and **Hubble** were drawn by **Hayashi Draws**.

- **Artist:** Hayashi Draws
- **Profile:** [Hayashi Draws on X](https://x.com/hayashidraws)
- **Artwork includes:**
  - Lily's player-character sprites
  - Hubble's walking sprites
  - Hubble's idle and sitting sprites
  - Hubble's battle sprites
  - Other project-specific poses and animations

These sprites were made specifically for this portfolio and should not be copied or reused without permission.

### Original Character Concepts

I created the names, themes, writing, and general concepts for:

- **Quasaur**
- **Recursaur**
- **Algorythm**
- **Optune**

Their attacks and battle behavior are based on ideas from astronomy, recursion, algorithms, optimization, and decision science.

The concepts and writing are mine, but the visual artwork is credited separately depending on the current sprite source.

---

## Temporary Enemy Sprites

### Mega Monster Pack

- **Creator:** unTied Games
- **Source:** [Mega Monster Pack](https://untiedgames.itch.io/mega-monster-pack)
- **Used for:** Temporary enemy sprites
- **Changes:** Selected sprites were resized, framed, animated, and connected to the custom battle system

The pack allows commercial and noncommercial use with attribution and does not allow the asset pack itself to be resold. ([source: Mega Monster Pack](https://untiedgames.itch.io/mega-monster-pack))

These sprites are only placeholders. The final artwork for Quasaur, Recursaur, Algorythm, and Optune is planned to be drawn by **Hayashi Draws**.

---

## Battle Effects

### Free VFX Asset Pack

- **Creator:** CodeManu
- **Source:** [Free VFX Asset Pack](https://codemanu.itch.io/vfx-free-pack)
- **Used for:** Beams, impacts, energy effects, shields, explosions, constellation effects, and other battle visuals
- **Changes:** Individual frames and spritesheets were resized, rotated, repositioned, timed, and combined with custom JavaScript and GSAP animations

The pack is used in effects for attacks such as:

```text
Light Beam
Cosmic Jet
Redshift
Accretion Disk
Recursive Call
Base Case
Stack Overflow
Optimize
Infinite Loop
Runtime Analysis
Lucky Draw
Confidence Bound
```

Other effects, including floating numbers, sparkles, sound-wave rings, screen flashes, movement paths, search brackets, and opacity changes, are created directly in the project code.

---

## Music

The website currently uses 8-bit arrangements of music from **The Planets** by Gustav Holst.

### Holst — Jupiter (8 Bit Edition)

- **Arrangement and recording:** Pcorf Creations / Paul Corfiatis
- **Original piece:** *Jupiter, the Bringer of Jollity*
- **Source:** [Holst — Jupiter (8 Bit Edition)](https://www.youtube.com/watch?v=hzWhwjrt8hE)
- **Used as:** Main map music

### Holst — Mars (8 Bit Edition)

- **Arrangement and recording:** Pcorf Creations / Paul Corfiatis
- **Original piece:** *Mars, the Bringer of War*
- **Source:** [Holst — Mars (8 Bit Edition)](https://www.youtube.com/watch?v=RxxAqwIrkY0)
- **Used as:** Battle music

---

## Sound Effects

All sound effects other than Howl in this project come from free audio packs created by [Kenney](https://kenney.nl/). The original `.ogg` files were converted to `.mp3` and renamed to match the project’s existing audio file names.

The howl sound effect was taken from a video recording of Hubble.

### Kenney — Sci-Fi Sounds

Source: [Sci-Fi Sounds](https://kenney.nl/assets/sci-fi-sounds)

* `forceField_004.ogg` — Accretion Disk
* `forceField_002.ogg` — Confidence Bound
* `laserRetro_001.ogg` — Exploit
* `explosionCrunch_003.ogg` — Fireball Hit
* `thrusterFire_002.ogg` — Jett
* `laserLarge_002.ogg` — Light Beam
* `lowFrequency_explosion_001.ogg` — Stack Overflow

### Kenney — Digital Audio

Source: [Digital Audio](https://kenney.nl/assets/digital-audio)

* `threeTone1.ogg` — Binary Search
* `phaserDown2.ogg` — Redshift
* `powerUp11.ogg` — Hubble’s healing move
* `powerUp11.ogg` — Fireball charge
* `phaseJump3.ogg` — Hubble’s Zoomies
* `pepSound1.ogg` — Victory
* `lowDown.ogg` — Defeat
* `powerUp7.ogg` — Optimize
* `twoTone2.ogg` — Memorize
* `zapThreeToneDown.ogg` - Recursive Call

The original sound zapThreeToneDown.ogg was divided into three separate clips so that each recursive copy could have its own impact sound. The clips were then lengthened slightly to better match the timing of the animation.

### Kenney — Interface Sounds

Source: [Interface Sounds](https://kenney.nl/assets/interface-sounds)

* `confirmation_003.ogg` — Base Case
* `question_003.ogg` — Explore
* `question_004.ogg` — Lucky Draw
* `glitch_003.ogg` — Infinite Loop
* `bong_001.ogg` — Initialize Battle
* `error_008.ogg` — Runtime Error

### Kenney — Impact Sounds

Source: [Impact Sounds](https://kenney.nl/assets/impact-sounds)

* `impactPunch_heavy_000.ogg` — Hubble’s Pounce

### Kenney — Retro Sounds 2

Source: [Kenney Audio Assets](https://kenney.nl/assets/category:Audio)

* `fall3.ogg` — Faint

All sound effects listed above were created by Kenney and released under the Creative Commons CC0 1.0 license.

---

## Tools and Libraries

### Tiled Map Editor

- **Creator:** Thorbjørn Lindeijer and contributors
- **Website:** [Tiled Map Editor](https://www.mapeditor.org/)
- **Repository:** [mapeditor/tiled](https://github.com/mapeditor/tiled)
- **License:** GNU General Public License v2

I used Tiled to build the map, organize layers, place assets, and define collision, battle, entrance, and interaction zones.

### Howler.js

- **Creator:** James Simpson / GoldFire Studios
- **Website:** [Howler.js](https://howlerjs.com/)
- **Repository:** [goldfire/howler.js](https://github.com/goldfire/howler.js)
- **License:** MIT License
- **Version used:** 2.2.3

Howler.js handles map music, battle music, sound effects, audio sprites, looping, muting, pausing, and volume control.

### GSAP

- **Creator:** GreenSock / GSAP
- **Website:** [GSAP](https://gsap.com/)
- **License information:** [GSAP Standard License](https://gsap.com/community/standard-license/)
- **Version used:** 3.9.1

GSAP is used for sprite movement, fades, flashes, attack animations, scene transitions, and timing.

### cdnjs

- **Website:** [cdnjs](https://cdnjs.com/)

cdnjs hosts the Howler.js and GSAP files loaded by the website.

---

## Font

### Press Start 2P

- **Designer:** CodeMan38 / Cody Boisclair
- **Source:** [Press Start 2P on Google Fonts](https://fonts.google.com/specimen/Press+Start+2P)
- **License:** SIL Open Font License 1.1
- **License page:** [SIL Open Font License](https://openfontlicense.org/)

Press Start 2P is used for menus, battle text, dialogue, prompts, and other game-style interface elements.

---

## What I Created or Customized

Unless another source is listed above, I created or substantially customized the following parts of the project:

- Portfolio writing and personal content
- Research, teaching, mentoring, project, and volunteer sections
- Overall world layout and organization
- Custom map composition using the credited tiles
- Building purposes and room layouts
- Signs, displays, galleries, and interaction content
- Hubble's role as the companion and battle partner
- Character concepts and art direction
- Quasaur, Recursaur, Algorythm, and Optune as original concepts
- Research-themed attacks and dialogue
- Health, leveling, move limits, healing, and status systems
- Mobile controls
- Responsive behavior
- Settings and audio controls
- Explore mode
- Battle logic and balancing
- Project restructuring and debugging
- Custom Canvas and GSAP effects
- Cross-device testing and integration

The commissioned artwork, temporary sprites, tilesets, VFX, music, fonts, and libraries are credited separately.

---

## AI-Assisted Development

**OpenAI ChatGPT** was used in the following ways as a development tool:

- Generate and revise portions of the JavaScript, HTML, and CSS
- Suggest debugging approaches and code organization improvements
- Help troubleshoot mobile controls, audio behavior, and battle mechanics
- Edit portfolio text

I directed the project’s design and functionality, selected and adapted any generated code, integrated the different systems, tested the website across devices, and continued revising the implementation based on the results.

---

## Research Featured in the Portfolio

### Daytime Thermospheric Wind Transients and Circulation in May 2021

[Read the paper](https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2025JA033729)

### Machine Learning for Astronomical Anomaly Detection — CHAMP Report

[Read the CHAMP report](https://project.ifa.hawaii.edu/h20/wp-content/uploads/sites/4/2025/05/Oglesby_CHAMP_Report.pdf)


---

## Pokémon Notice

This is a personal, non-commercial portfolio project inspired by the structure and visual style of classic monster-battling and pixel-art games.

**Pokémon** and its related trademarks, characters, and intellectual property belong to Nintendo, Creatures Inc., Game Freak, and The Pokémon Company.

This project is not affiliated with, sponsored by, endorsed by, or approved by any of those companies.

The custom characters, research themes, writing, and portfolio content in this project are not official Pokémon content.

---

## Reuse

Copyright © 2026 Lily Oglesby.

My original writing, photos, character concepts, map layout, and project-specific code remain my work unless another creator is listed.

Third-party artwork, audio, fonts, libraries, tutorials, and asset packs still belong to their original creators and follow their own licenses.

Please do not extract, repost, resell, or reuse third-party assets from this project without checking the original terms.

---

## Reference Links

These are the direct source links used throughout the README:

### Tutorials and Original Game Code

* [Chris Courses — Pokémon JavaScript Game Tutorial with HTML Canvas](https://www.youtube.com/watch?v=yP5DKzriqXA)
* [Chris Courses — Pokémon: Introduction](https://chriscourses.com/courses/pokemon/videos/introduction)
* [Chris Courses — Pokémon-Style Game GitHub Repository](https://github.com/chriscourses/pokemon-style-game)
* [Chris Courses — Tutorial Audio Directory](https://github.com/chriscourses/pokemon-style-game/tree/main/audio)
* [Chris Courses — Battle Background](https://github.com/chriscourses/pokemon-style-game/blob/main/img/battleBackground.png)

### Artwork and Game Assets

* [KentangPixel — Top Down Tile and Some Mob Sprite 32×32](https://kentangpixel.itch.io/top-down-tile-and-some-mob-sprite)
* [Pixel-Boy and AAA — Ninja Adventure Asset Pack](https://pixel-boy.itch.io/ninja-adventure-asset-pack)
* [Kokoro Reflections — KR Mars Colony Tileset for RPGs](https://kokororeflections.itch.io/kr-mars-colony-tileset-for-rpgs)
* [Kokoro Reflections — Game Assets and Tiles Usage Terms](https://kokororeflections.com/terms-use/)
* [Hayashi Draws](https://x.com/hayashidraws)
* [unTied Games — Mega Monster Pack](https://untiedgames.itch.io/mega-monster-pack)
* [CodeManu — Free VFX Asset Pack](https://codemanu.itch.io/vfx-free-pack)

### Music

* [Pcorf Creations — Holst: Jupiter, the Bringer of Jollity, 8-Bit Edition](https://www.youtube.com/watch?v=hzWhwjrt8hE)
* [Pcorf Creations — Holst: Mars, the Bringer of War, 8-Bit Edition](https://www.youtube.com/watch?v=RxxAqwIrkY0)

### Sound Effects

* [Kenney — Game Assets](https://kenney.nl/assets)
* [Kenney — Sci-Fi Sounds](https://kenney.nl/assets/sci-fi-sounds)
* [Kenney — Digital Audio](https://kenney.nl/assets/digital-audio)
* [Kenney — Interface Sounds](https://kenney.nl/assets/interface-sounds)
* [Kenney — Impact Sounds](https://kenney.nl/assets/impact-sounds)
* [Kenney — Retro Sounds 2 Archived Pack Directory](https://gamesounds.xyz/?dir=Kenney%27s+Sound+Pack%2FRetro+Sounds+2)
* [Creative Commons — CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/)

The howl sound effect was taken from a personal video recording of Hubble.

### Development Tools and Libraries

* [Tiled — Tiled Map Editor](https://www.mapeditor.org/)
* [Tiled Contributors — Tiled GitHub Repository](https://github.com/mapeditor/tiled)
* [GoldFire Studios — Howler.js](https://howlerjs.com/)
* [James Simpson and GoldFire Studios — Howler.js GitHub Repository](https://github.com/goldfire/howler.js)
* [GSAP](https://gsap.com/)
* [GSAP — Standard License](https://gsap.com/community/standard-license/)
* [cdnjs](https://cdnjs.com/)

### Fonts

* [Google Fonts — Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P)
* [SIL — SIL Open Font License](https://openfontlicense.org/)

### AI Assistance

* [OpenAI — What Is ChatGPT?](https://help.openai.com/en/articles/12677804-what-is-chatgpt-faq)

### Research

* [Oglesby et al. — Daytime Thermospheric Wind Transients and Circulation in May 2021](https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2025JA033729)
* [Oglesby — Machine Learning for Astronomical Anomaly Detection: CHAMP Report](https://project.ifa.hawaii.edu/h20/wp-content/uploads/sites/4/2025/05/Oglesby_CHAMP_Report.pdf)

