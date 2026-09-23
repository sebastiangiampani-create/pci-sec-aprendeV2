import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('V87 carga la identidad institucional en la entrada web',()=>{
  const loader=fs.readFileSync('app-safe.html','utf8');
  assert.match(loader,/src\/v87-institutional-branding\.js/);
});

test('V87 incorpora los dos recursos institucionales',()=>{
  const school=fs.readFileSync('assets/brand-escuela-maestros.svg','utf8');
  const ministry=fs.readFileSync('assets/brand-ministerio.svg','utf8');
  assert.match(school,/escuela de/);
  assert.match(school,/maestros/);
  assert.match(ministry,/Ministerio de Educación/);
  assert.match(ministry,/Buenos/);\n  assert.match(ministry,/Aires Ciudad/);
});

test('V87 muestra logo y footer tambien dentro del panel de acceso',()=>{
  const source=fs.readFileSync('src/v87-institutional-branding.js','utf8');
  assert.match(source,/v87-access-brand/);
  assert.match(source,/v87-access-footer/);
  assert.match(source,/brand-escuela-maestros\.svg/);
  assert.match(source,/brand-ministerio\.svg/);
  assert.match(source,/ccLicenseFooter/);
});

test('V87 mantiene responsive la identidad institucional',()=>{
  const source=fs.readFileSync('src/v87-institutional-branding.js','utf8');
  assert.match(source,/@media\(max-width:700px\)/);
  assert.match(source,/\.top \.brand\.pci-v87-brand/);
  assert.match(source,/#pciV87InstitutionalFooter/);
});
