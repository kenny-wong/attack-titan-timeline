# Attack Titan Timeline

An interactive, bilingual (Traditional Chinese / English) timeline of who crossed the three Walls in *Attack on Titan*, and how. It shows 28 events from 743 to 857 on an illustrated map of Paradis Island:

- playback with a camera that follows the action, or zoom and pan yourself (mouse wheel, slider, drag, pinch);
- animated routes for every character, with unconfirmed routes marked as such;
- live Walls: gates break, are sealed, and the Walls fall in the Rumbling;
- a simulated crowd: about 300 Pure Titans that gather where people live, civilians who retreat behind the Walls and resettle, Survey Corps riders, wall cannons and the Wall Titans;
- day and night (Titans stand still in the dark, except under the moon at Utgard), the evacuation boats of 845, the 846 "reclamation" of Wall Maria, the signal flares of the long-range scouting formation, cloud shadows, rain and snow in the north;
- a picture for every event: a scene from the story or manga-style panels of the characters involved.

**Live site:** https://kenny-wong.github.io/attack-titan-timeline/

Contains full story spoilers.

## Running it

Open `index.html` directly in a browser. It needs no server and works offline. The map, figures, portraits and emblems are embedded in the one file; the scene pictures in `assets/scenes/` are loaded beside it, and an event falls back to character panels when its picture is missing.

`index.html` is generated. To change the site, edit the sources and rebuild:

```bash
npm run build   # assembles index.html from src/ and assets/
npm test        # Node's built-in test runner, no dependencies
```

## Files

- `index.html`: the built site.
- `src/`: the sources: world geometry, terrain, camera, story text and scenes, crowd simulation, map painter, stage and app (see `src/build.json` for the order).
- `assets/population/puppets.js`: the animated figures (drawn with Canvas 2D into a sprite atlas); `puppets-preview.html` shows them.
- `assets/theme/`: regiment emblems, ornaments and the masthead banner (original drawings, embedded by the build); `theme-preview.html` shows them.
- `assets/scenes/`: scene pictures for the story card, with their sources in `sources.json`.
- `assets/map-designs/world-terrain.json`, `src/world-coast.json`: terrain classes and coastline of the map.
- `assets/portraits/`, `assets/icon-options/`: portrait images and their sources; `icon-choices.html`, `titan-choices.html` and `map-choices.html` are earlier design comparisons.
- `original/Attack_on_Titan_Walls_V2.html`: the first version of the page, kept for reference.
- `tests/`: story geography, route timing, crowd numbers and behaviour, camera and geometry checks.

The map is an original illustration: the island outline, district positions and landscape are redrawn after fan-made reference maps, not an official survey, and the routes are schematic. Character and scene images remain copyrighted by their respective owners; this is a non-commercial fan project.
