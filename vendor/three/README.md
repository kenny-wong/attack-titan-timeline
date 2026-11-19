# three.js (vendored)

`three.iife.min.js` is [three.js](https://threejs.org/) r187 (MIT licence, see `LICENSE`): the parts this page uses, bundled into one classic script that defines the global `THREE`. The page is a single `index.html` that must also work when opened straight from disk, and ES modules do not load from `file://`, so the module build cannot be used as it is.

To rebuild it for another release, put `three.core.js` and `three.module.js` from the `build/` folder of the npm package `three` beside `entry.js` and run:

```bash
npx esbuild entry.js --bundle --format=iife --global-name=THREE --minify --legal-comments=none --target=es2020 --outfile=three.iife.min.js
```

Then put the licence line back at the top of the file. `entry.js` lists what is exported; add a name there when the stage needs another class.
