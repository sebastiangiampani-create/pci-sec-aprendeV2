import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('V111 retira el aviso Mapa inicial del Mapa de la Oferta',()=>{
  const source=fs.readFileSync('app-core.html','utf8');
  assert.equal(source.includes('<strong>Mapa inicial:</strong>'),false);
  assert.equal(source.includes('Fase 2 e Implementación institucional pueden trabajarse aun mientras este mapa siga en construcción.'),false);
  assert.ok(source.includes('id="offer"'));
  assert.ok(source.includes('id="matrix"'));
});
