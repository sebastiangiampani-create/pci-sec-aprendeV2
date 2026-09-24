import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('V89 usa branding institucional oficial',()=>{
  const source=fs.readFileSync('src/v87-institutional-branding.js','utf8');
  assert.match(source,/assets\/logo-escuela-maestros\.svg/);
  assert.match(source,/assets\/logo-escuela-maestros-blanco\.svg/);
  assert.match(source,/assets\/ba-logo\.png/);
  assert.match(source,/assets\/ba-ciudad-footer\.png/);
});

test('V89 define un unico footer institucional canonico',()=>{
  const source=fs.readFileSync('src/v87-institutional-branding.js','utf8');
  assert.match(source,/const FOOTER_ID='pciInstitutionalFooter'/);
  assert.match(source,/function placeSingleFooter/);
  assert.match(source,/function removeDuplicateCanonicalFooters/);
  assert.doesNotMatch(source,/function installGlobalFooter/);
  assert.doesNotMatch(source,/className='v88-access-footer'/);
});

test('V89 mueve el mismo footer entre acceso y aplicacion',()=>{
  const source=fs.readFileSync('src/v87-institutional-branding.js','utf8');
  assert.match(source,/if\(shell\)/);
  assert.match(source,/shell\.appendChild\(footer\)/);
  assert.match(source,/cc\.before\(footer\)/);
});

test('V89 limpia footers heredados de V87 y V88',()=>{
  const source=fs.readFileSync('src/v87-institutional-branding.js','utf8');
  assert.match(source,/pciV87InstitutionalFooter/);
  assert.match(source,/pciV88InstitutionalFooter/);
  assert.match(source,/\.v87-access-brand,\.v87-access-footer,\.v88-access-brand-row,\.v88-access-footer/);
});

test('V89 mantiene responsive',()=>{
  const source=fs.readFileSync('src/v87-institutional-branding.js','utf8');
  assert.match(source,/@media\(max-width:700px\)/);
});
