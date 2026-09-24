import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('V88 carga identidad institucional oficial',()=>{
  const loader=fs.readFileSync('app-safe.html','utf8');
  const source=fs.readFileSync('src/v87-institutional-branding.js','utf8');
  assert.match(loader,/src\/v87-institutional-branding\.js/);
  assert.match(source,/assets\/logo-escuela-maestros\.svg/);
  assert.match(source,/assets\/logo-escuela-maestros-blanco\.svg/);
  assert.match(source,/assets\/ba-logo\.png/);
  assert.match(source,/assets\/ba-ciudad-footer\.png/);
});

test('V88 usa el footer institucional original',()=>{
  const source=fs.readFileSync('src/v87-institutional-branding.js','utf8');
  assert.match(source,/Ministerio de Educación/);
  assert.match(source,/Buenos Aires Ciudad/);
  assert.match(source,/#0d3550/);
  assert.match(source,/pci-v88-footer-school/);
});

test('V88 muestra branding oficial tambien en acceso',()=>{
  const source=fs.readFileSync('src/v87-institutional-branding.js','utf8');
  assert.match(source,/v88-access-brand-row/);
  assert.match(source,/v88-access-footer/);
  assert.match(source,/BA · Gobierno de la Ciudad de Buenos Aires/);
});

test('V88 mantiene responsive',()=>{
  const source=fs.readFileSync('src/v87-institutional-branding.js','utf8');
  assert.match(source,/@media\(max-width:700px\)/);
});
