// The version shown on the page matches package.json.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('page version equals package.json version', () => {
  const root = path.join(__dirname, '..');
  const { version } = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  for (const id of ['appVersion', 'headVersion']) {
    // the footer and the header
    const shown = html.match(new RegExp('id="' + id + '">v([\\d.]+)<'));
    assert.ok(shown, id + ': version element missing');
    assert.strictEqual(shown[1], version, id);
  }
});
