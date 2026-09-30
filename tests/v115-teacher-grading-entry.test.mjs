import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('V115 acceso docente reconoce la pantalla reducida de Calificaciones',()=>{
  const access=fs.readFileSync('src/v80-access-control.js','utf8');
  assert.ok(access.includes("'v114PlanCriteriaScreen'"));
  assert.ok(access.includes("setHidden($('v114CriteriaEntry'),!['admin','teacher','coordinator'].includes(access.role))"));
});

test('V115/V116 tarjeta Calificaciones queda visible y ordenada en Inicio',()=>{
  const source=fs.readFileSync('src/v114-plan-criteria-excel.js','utf8');
  assert.ok(source.includes("management.after(card)"));
  assert.ok(source.includes("pciList.after(card)"));
  assert.ok(source.includes("card.hidden=!allowed"));
});

test('V115 mantiene el filtrado de planes por asignacion docente',()=>{
  const source=fs.readFileSync('src/v114-plan-criteria-excel.js','utf8');
  assert.ok(source.includes("session.role==='teacher'"));
  assert.ok(source.includes("teachersFor(ctx).some(t=>String(t.id)===String(session.teacherId||''))"));
});

test('V115 no reactiva Calificaciones ni Boletines legacy',()=>{
  const app=fs.readFileSync('app.html','utf8');
  assert.equal(app.includes("'src/v76-calificaciones.js'"),false);
  assert.equal(app.includes("'src/v77-boletines-cierres.js'"),false);
  assert.ok(app.includes("'src/v114-plan-criteria-excel.js'"));
});

// V115 sync: acceso docente visible y autorizado por controlador central.
