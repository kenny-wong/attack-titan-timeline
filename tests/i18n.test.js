// The page speaks Traditional Chinese, English and Japanese: every text must exist in all three.
const test = require('node:test');
const assert = require('node:assert');
const vm = require('node:vm');
const { load, read } = require('./helpers.js');
const c = load();
const LANGS = ['zh', 'en', 'ja'];
const app = read('src/app.js');
const block = (name) => {
  const at = app.indexOf('const ' + name + ' = {'), end = app.indexOf('\n};', at);
  assert.ok(at >= 0 && end > at, 'no ' + name + ' in app.js');
  return app.slice(at, end + 3);
};
const C = (zh, en, ja) => ({ zh, en, ja });
const run = (code, extra = {}) => vm.runInNewContext(code, { C, ...extra });

test('every event text has Chinese, English and Japanese', () => {
  let n = 0;
  const walk = (v, path) => {
    if (!v || typeof v !== 'object') return;
    if (typeof v.zh === 'string' || typeof v.en === 'string') {
      for (const l of LANGS) assert.ok(typeof v[l] === 'string' && v[l].trim(), `${path}: no ${l} text`);
      n++;
      return;
    }
    for (const k of Object.keys(v)) walk(v[k], path + '.' + k);
  };
  for (const e of c.events) walk({ title: e.title, description: e.description, outcome: e.outcome, beats: e.beats, characters: e.characters, marks: e.marks }, e.id);
  assert.ok(n > 280, 'texts checked: ' + n);
});

test('the interface text has the same entries in all three languages', () => {
  const TXT = run(block('TXT') + ';TXT');
  const keys = (o, p = '') => Object.keys(o).flatMap((k) => (o[k] && typeof o[k] === 'object' ? keys(o[k], p + k + '.') : [p + k]));
  const zh = keys(TXT.zh).sort().join();
  for (const l of LANGS) {
    assert.strictEqual(keys(TXT[l]).sort().join(), zh, l + ' has different entries');
    for (const k of keys(TXT[l])) assert.ok(String(k.split('.').reduce((o, part) => o[part], TXT[l])).length > 0, `${l}.${k} is empty`);
  }
});

test('places, people and districts are named in all three languages', () => {
  const labels = run(block('labels') + ';labels');
  for (const [k, v] of Object.entries(labels)) for (const l of LANGS) assert.ok(v[l], `label ${k}: no ${l}`);
  for (const [k, v] of Object.entries(c.cast)) for (const l of LANGS) assert.ok(v[l], `cast ${k}: no ${l}`);
  for (const d of c.World.DISTRICTS) for (const l of LANGS) assert.ok(d[l], `district ${d.id}: no ${l}`);
  // no two-language C('…', '…') call is left in the sources
  for (const f of ['src/app.js', 'src/story.js']) assert.ok(!/C\('[^']*', '[^']*'\)/.test(read(f)), f + ' has a name without Japanese');
});

test('the language switch offers the three languages', () => {
  const html = read('src/index.template.html');
  for (const l of LANGS) assert.ok(html.includes(`data-lang="${l}"`), 'no button for ' + l);
});

test('the page has a mini map, and the illustrative-map note is gone', () => {
  const html = read('src/index.template.html');
  assert.ok(html.includes('id="miniMap"') && html.includes('id="miniCanvas"'));
  assert.ok(!/data-i18n="schematic"/.test(html));
  assert.ok(!/^\s+schematic:/m.test(app), 'the note text is still in the interface text');
});

test('the page sets up the crowd model before anything that reads it at load', () => {
  // top-level statements run in order; reading POP earlier stops the whole page
  const lines = app.split('\n'), made = lines.findIndex((l) => l.startsWith('const POP = '));
  assert.ok(made > 0);
  lines.forEach((l, i) => { if (i < made && /^\S/.test(l) && !/^(function|\/\/)/.test(l)) assert.ok(!/\bPOP\./.test(l), 'line ' + (i + 1) + ' uses POP before it exists'); });
});
