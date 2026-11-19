# Attack Titan Timeline

An interactive timeline in three languages (Traditional Chinese, English and Japanese) of who crossed the three Walls in *Attack on Titan*, and how. It shows 29 events from 743 to the years after 857 on a 3D map of Paradis Island: a landscape with mountains, forests and towns, the three Walls standing 50 m over it, and every Titan and person a small moving figure.

- a 3D map (three.js): the island's relief with snow on the northern peaks, the sea, forests, district towns and the capital, the Walls with their gates, and a low sun that throws shadows; the camera looks down steeply from afar and sinks towards the horizon as you zoom in;
- playback with a camera that follows the action, or zoom, pan and turn yourself (mouse wheel, slider, drag, pinch; drag with the right mouse button or twist with two fingers to turn, and the compass faces north again; the Bird's eye button looks straight down like a map; you can zoom in until a person stands about 70 px tall); with the auto camera on, key scenes cut in at the centre of the map (a gate breaking, a transformation, the Rumbling);
- animated routes for every character, with unconfirmed routes marked as such; a Titan shifter's portrait changes to their Titan at the moment they transform;
- live Walls: a broken gate is a ragged hole torn through the Wall, with blocks thrown inwards and smoke rising, and a breached or lost Wall is coloured as such; gates are sealed (the boulder at Trost, hardened crystal at Shiganshina); in the Rumbling the Walls crumble stretch by stretch into stumps and rubble, and the Rumbling is simulated Titan by Titan: they stand shoulder to shoulder in every Wall and district wall, walk straight out (stepping aside only for towns and villages) and close up into one great circle that flattens the forests and buildings outside the Walls and sweeps out over the sea;
- a simulated crowd: about 200 Pure Titans that gather where people live, and about 500 civilians who retreat behind the Walls and resettle; whoever does not get away in time (in Shiganshina and Maria territory in 845, the column of 846) is caught by a Titan that walks up, lifts them to its mouth and eats them, with blood (the auto camera closes in while this happens); Survey Corps riders, wall cannons, the Wall Titans, the Titan that lies on a crushed roof in Ragako, and the crawling Titan dragging itself from the south coast;
- day and night (Titans stand still in the dark, except under the moon at Utgard), the evacuation boats of 845, the 846 "reclamation" of Wall Maria, the people of south-west Wall Rose leaving for Ehrmich and Wall Sina when Titans appear at Ragako in 850 (and coming home afterwards), the signal flares of the long-range scouting formation, cloud shadows and snow in the north;
- a mini map in the corner with a coloured dot for everything that moves; click it to look there;
- a picture for every event: a scene from the story or manga-style panels of the characters involved;
- a closing chapter after 857: railways are laid across the island (with trains), new ports and towns are built, and more people settle beyond the old Wall lines.

**Live site:** https://kenny-wong.github.io/attack-titan-timeline/

Contains full story spoilers.

## Running it

Open `index.html` directly in a browser. It needs no server and works offline. The map, figures, portraits, emblems and three.js are embedded in the one file; the scene pictures in `assets/scenes/` are loaded beside it, and an event falls back to character panels when its picture is missing.

The 3D map needs WebGL. Where it is not available the page shows the earlier flat, painted map with the same story and controls; `index.html?flat` asks for the flat map on purpose. On phones, and on computers where frames stay slow, the 3D map drops its shadow map for simple round shadows.

`index.html` is generated. To change the site, edit the sources and rebuild:

```bash
npm run build   # assembles index.html from src/ and assets/
npm test        # Node's built-in test runner, no dependencies
```

## Files

- `index.html`: the built site.
- `src/`: the sources: world geometry, terrain, the height of the land, camera, story text and scenes, crowd simulation, map painter, the 3D stage (`stage3d.js` with `s3-*.js`), the flat stage and the app (see `src/build.json` for the order).
- `assets/3d-design/design.json`: the design of the 3D map as data: every figure and building as a small rig of boxes, spheres, capsules and cones with its animation clips, and the colours of the Walls, the land, the light and the effects; `notes.md` is the art direction.
- `vendor/three/`: three.js r187 (MIT), bundled into one classic script so the page still opens from disk; its README says how.
- `assets/population/puppets.js`: the drawn figures of the flat map and of the page's keys (Canvas 2D sprite atlas); `puppets-preview.html` shows them.
- `assets/theme/`: regiment emblems, ornaments and the masthead banner (original drawings, embedded by the build); `theme-preview.html` shows them.
- `assets/scenes/`: scene pictures for the story card and the key-scene cut-ins (`titans/` holds the wide Titan pictures), with their sources in `sources.json`.
- `assets/map-designs/world-terrain.json`, `src/world-coast.json`: terrain classes and coastline of the map.
- `assets/portraits/`, `assets/icon-options/`: portrait images and their sources (`assets/portraits/titans/` holds the Titan forms); `icon-choices.html`, `titan-choices.html` and `map-choices.html` are earlier design comparisons.
- `original/Attack_on_Titan_Walls_V2.html`: the first version of the page, kept for reference.
- `tests/`: story geography, route timing, crowd numbers and behaviour, camera and geometry checks, the 3D camera's maths, the height of the land, and the figures' rigs and design.

The map is an original model: the island outline, district positions and landscape are redrawn after fan-made reference maps, not an official survey, and the routes are schematic. Character and scene images remain copyrighted by their respective owners; this is a non-commercial fan project.
