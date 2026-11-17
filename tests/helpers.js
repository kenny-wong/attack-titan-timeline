// Loads the DOM-free source modules into a sandbox, the way the page does.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

function load({ population = false, counts } = {}) {
  const ctx = {};
  vm.createContext(ctx);
  for (const f of ['src/route-geometry.js', 'src/world.js', 'src/terrain.js', 'src/camera.js']) vm.runInContext(read(f), ctx);
  ctx.World.init(JSON.parse(read('src/world-coast.json')));
  vm.runInContext(read('src/story-text.js') + read('src/story.js') + ';globalThis.events=events;globalThis.P=P;globalThis.lightAt=lightAt;globalThis.cast=cast;globalThis.TITAN_FORM=TITAN_FORM;globalThis.titanFormAt=titanFormAt;globalThis.KEY_SCENES=KEY_SCENES;', ctx);
  if (population) {
    vm.runInContext(read('src/population.js'), ctx);
    ctx.pop = ctx.Population.create(ctx.events, ctx.World, { points: ctx.P, counts });
  }
  return ctx;
}
module.exports = { load, read, root };
