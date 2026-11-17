# Attack Titan Timeline

An interactive, bilingual (Traditional Chinese / English) timeline of who crossed the three Walls in *Attack on Titan*, and how. It shows 27 events from 743 to 857 on an illustrated map of Paradis Island. You can play them back, scrub through each scene, and follow animated routes for every character, with uncertain routes marked as such. The status of each wall and gate builds up as the story goes on. Small crowds of Pure Titans and civilians live on the island throughout, showing where the Titans invaded and how the people retreated behind the Walls; they can be switched off on the map.

**Live site:** https://kenny-wong.github.io/attack-titan-timeline/

Contains full story spoilers.

## Running it

Open `index.html` directly in a browser. It needs no server, dependencies or build step, and it works offline because the map and portraits are embedded in the file.

Tests use Node's built-in runner: `npm test` (or `node --test "tests/*.test.js"`).

## Files

- `index.html`: the application (the site).
- `src/route-geometry.js` (smooth route curves) and `src/population.js` (crowds): embedded into `index.html` by `npm run embed`.
- `scripts/`: map build (`build-island-map.mjs`, `embed-map.mjs`) and the embed script.
- `assets/map-designs/`: the island map and the earlier design options (compared in `map-choices.html`).
- `assets/population/`: crowd sprites, motion settings and a preview page.
- `assets/portraits/`, `assets/icon-options/`: portrait images and their sources; `icon-choices.html` and `titan-choices.html` compare the options.
- `original/Attack_on_Titan_Walls_V2.html`: the unmodified Version 2 baseline (also `Attack_on_Titan_Walls_V2.html`).
- `tests/`: story geography, route timing, crowd and version checks.

The map is an original illustration and the routes are schematic, not to official scale. Character images remain copyrighted by their respective owners; this is a non-commercial fan project.
