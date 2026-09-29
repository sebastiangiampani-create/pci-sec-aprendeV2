import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('V112 elimina cualquier aviso Mapa inicial que reaparezca por cache',()=>{
  const source=fs.readFileSync('src/v112-remove-obsolete-map-notice.js','utf8');
  const loader=fs.readFileSync('app.html','utf8');
  assert.ok(loader.includes("'src/v112-remove-obsolete-map-notice.js'"));
  assert.ok(source.includes("text.startsWith('Mapa inicial:')"));
  assert.ok(source.includes("el.remove()"));
  assert.ok(source.includes("pci-app-ready"));
});
