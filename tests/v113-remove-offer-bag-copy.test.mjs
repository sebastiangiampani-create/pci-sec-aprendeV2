import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('V113 retira el texto explicativo de la bolsa en Mapa de la Oferta',()=>{
  const core=fs.readFileSync('app-core.html','utf8');
  const guard=fs.readFileSync('src/v112-remove-obsolete-map-notice.js','utf8');
  assert.equal(core.includes('La bolsa contiene todas las materias de Formación General de 1.º a 5.º'),false);
  assert.ok(guard.includes("text.startsWith('La bolsa contiene todas las materias de Formación General')"));
  assert.ok(guard.includes("offer.querySelectorAll('.hero p')"));
  assert.ok(core.includes('id="offerTitle"'));
});
