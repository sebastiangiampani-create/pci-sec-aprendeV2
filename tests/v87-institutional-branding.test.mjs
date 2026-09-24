import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('el branding institucional estático está en la aplicación',()=>{
  const core=fs.readFileSync('app-core.html','utf8');
  assert.match(core,/assets\/logo-escuela-maestros\.svg/);
  assert.match(core,/assets\/logo-escuela-maestros-blanco\.svg/);
  assert.match(core,/assets\/ba-logo\.png/);
  assert.match(core,/assets\/ba-ciudad-footer\.png/);
  assert.match(core,/id="institutionalFooter"/);
});

test('el acceso tiene su propio branding estático',()=>{
  const panel=fs.readFileSync('src/v85-access-panel.js','utf8');
  assert.match(panel,/access-brand-row/);
  assert.match(panel,/access-institutional-footer/);
  assert.match(panel,/assets\/logo-escuela-maestros\.svg/);
  assert.match(panel,/assets\/ba-ciudad-footer\.png/);
});

test('no se carga el antiguo parche dinámico de branding',()=>{
  const app=fs.readFileSync('app.html','utf8');
  const safe=fs.readFileSync('app-safe.html','utf8');
  assert.doesNotMatch(app,/v87-institutional-branding/);
  assert.doesNotMatch(safe,/v87-institutional-branding/);
});

test('branding responsive',()=>{
  const core=fs.readFileSync('app-core.html','utf8');
  const panel=fs.readFileSync('src/v85-access-panel.js','utf8');
  assert.match(core,/@media\(max-width:700px\)/);
  assert.match(panel,/@media\(max-width:760px\)/);
});
