![Latest Release Download Count](https://img.shields.io/badge/dynamic/json?color=blue&label=Downloads%40latest&query=assets%5B1%5D.download_count&url=https%3A%2F%2Fapi.github.com%2Frepos%2Fvtt-lair%2Fsimbuls-cover-calculator%2Freleases%2Flatest) [![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Fsimbuls-cover-calculator&colorB=4aa94a)](https://forge-vtt.com/bazaar#package=simbuls-cover-calculator) 

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/N4N36ZSPQ)

# Simbul's Cover Calculator
A Foundry VTT module that calculates cover for DnD 5e.

### Cover Calculator
- When a user with a selected token targets another token with the designated hotkey held, the target's cover will be calculated following the rules presented in DMG pg. 251.
- A message in chat will be posted concerning the target's cover in relation to the selected token(s).
- Prioritizes walls, tiles, and then tokens.
  - Walls, tiles, and tokens have a new option in their configuration dialog that sets the cover granted by them.
  - Two tiles are included from game-icons.net that are configured automatically for half and three-quarters cover in modules/simbuls-cover-calculator/assets/cover-tiles.
- Has two modes for cover in relation to walls: Center Point and Four Corner. Cover from tiles and tokens are (currently) only calculated from Center Point.
  - Center Point - a target token's cover is based on foundry's player vision rendering (center point of self to 4 corners of target)
  - Four Corner - direct implementation of DMG rules, where vision is computed from each occupied grid point and the corner granting the target the least cover is chosen.
  - A more detailed discussion of this can be found on our Wiki
- Added `Token#setCoverValue` which accepts 0-3 (no, half, 3/4, and full cover, respectively). Can be used to change a token's provided cover; e.g. when prone or dead.

#### A Note on Module Interactions

Simbul's Cover Calculator provides built-in functionality for managing cover in a simple manner. Other modules may interact with its output, or supercede it entirely. If this is the case, please consult the other module's instructions or readme and configure the Helpers cover calculator settings appropriately.

[Cover Debug](https://user-images.githubusercontent.com/33215552/197622902-3c22ba88-1412-4cfc-8364-3e7289e7d58f.mp4)


### Cover Application

- Manual setting adds chat buttons to click to cycle between different cover effects.
- Automatic will automatically apply the relevant effect but still generate the chat message for manual adjustment.
- This cover bonus is applied onto the _attacker_ not the target and is a -2,-5,-40 penalty for any attack rolls.
- The cover bonus to Dexerity saves are not handled.
- A special trait has been added to indicate if the actor should ignore certain levels of cover (e.g. Sharpshooter, Spell Sniper, Wand of the Warmage)
- Alternatively, a flag of `"dnd5e", "helpersIgnoreCover"` will flag the token as ignoring cover, for use with Spell Sniper or Sharpshooter ( will also remove melee cover effects ). Said flags accepts values of 0, 1, 2 or 3 which allows the actor to ignore no, half, three-quarters or full cover respectively. To ensure legacy compatibility values of true are also accepted but identical in functionality to a value of 2.
- Cover penalties can be optionally removed at the end of the token's turn.

![CoverReport](https://user-images.githubusercontent.com/33215552/197622872-b26e3eea-eccc-413b-90c7-4c280da511ed.png)


Originally part of [DnD 5e Helpers](https://github.com/trioderegion/dnd5e-helpers)
