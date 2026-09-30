import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('V119 se carga como capa aislada al final del loader',()=>{
  const app=fs.readFileSync('app.html','utf8');
  assert.ok(app.includes("'src/v119-responsive-legibility.js'"));
  assert.ok(app.indexOf("'src/v119-responsive-legibility.js'")>app.indexOf("'src/v114-plan-criteria-excel.js'"));
});

test('V119 aumenta tamaño táctil y evita zoom de iOS en formularios',()=>{
  const source=fs.readFileSync('src/v119-responsive-legibility.js','utf8');
  assert.ok(source.includes('min-height:42px'));
  assert.ok(source.includes('font-size:16px!important'));
  assert.ok(source.includes('#institutional input'));
  assert.ok(source.includes('#v114PlanCriteriaScreen input'));
});

test('V119 corrige microtipografias de Gestion cobertura planes y Calificaciones',()=>{
  const source=fs.readFileSync('src/v119-responsive-legibility.js','utf8');
  for(const needle of [
    '.v71m-teacher small',
    '.v110-coord-chip small',
    '.v95-coord-row small',
    '.v95-coverage-head',
    '.v98d-subject-name small',
    '.v99d-plan-head',
    '.v114-validations small'
  ]) assert.ok(source.includes(needle),needle);
});

test('V119 conserva tablas complejas con desplazamiento horizontal',()=>{
  const source=fs.readFileSync('src/v119-responsive-legibility.js','utf8');
  assert.ok(source.includes('.v84cc-table-wrap'));
  assert.ok(source.includes('-webkit-overflow-scrolling:touch'));
  assert.ok(source.includes('scrollbar-gutter:stable'));
});

test('V119 no modifica codigo funcional de modulos curriculares',()=>{
  const source=fs.readFileSync('src/v119-responsive-legibility.js','utf8');
  assert.equal(source.includes('state.'),false);
  assert.equal(source.includes('save()'),false);
  assert.equal(source.includes('assignments'),false);
  assert.equal(source.includes('contentIds'),false);
});
