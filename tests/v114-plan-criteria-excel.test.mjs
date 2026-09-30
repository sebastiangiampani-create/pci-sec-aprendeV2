import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

test('V114 carga modulo reducido sin reactivar Calificador legacy',()=>{
  const app=fs.readFileSync('app.html','utf8');
  assert.ok(app.includes("'src/v114-plan-criteria-excel.js'"));
  assert.equal(app.includes("'src/v76-calificaciones.js'"),false);
  assert.equal(app.includes("'src/v77-boletines-cierres.js'"),false);
});

test('V114 Excel tiene exactamente PLAN CRITERIOS y CARGA',()=>{
  const source=fs.readFileSync('src/v114-plan-criteria-excel.js','utf8');
  for(const needle of [
    "wb.addWorksheet('PLAN')",
    "wb.addWorksheet('CRITERIOS')",
    "wb.addWorksheet('CARGA')",
    "'__PLAN_KEY'",
    "'__STUDENT_ID'",
    'Objetivos de aprendizaje',
    'CONTENIDOS DEL PLAN',
    'VALIDADO',
    'PENDIENTE'
  ]) assert.ok(source.includes(needle),needle);
  assert.equal(source.includes("wb.addWorksheet('CALIFICACIONES')"),false);
});

test('V114 conserva minimo cuatro criterios y adicionales removibles',()=>{
  const source=fs.readFileSync('src/v114-plan-criteria-excel.js','utf8');
  for(const needle of [
    'while(r.criteria.length<4)',
    'if(!Number.isInteger(i)||i<4||i>=record.criteria.length)return false',
    '+ Agregar criterio',
    'Mínimo obligatorio: 4 criterios'
  ]) assert.ok(source.includes(needle),needle);
});

test('V114 modificar texto invalida validaciones anteriores',()=>{
  const source=fs.readFileSync('src/v114-plan-criteria-excel.js','utf8');
  assert.ok(source.includes("if(String(c.text||'')!==next){c.text=next;c.validations={};}"));
});

test('V114 permisos se derivan de roles actuales',()=>{
  const source=fs.readFileSync('src/v114-plan-criteria-excel.js','utf8');
  assert.ok(source.includes("session.role==='teacher'"));
  assert.ok(source.includes("session.role==='coordinator'"));
  assert.ok(source.includes('editableAreasByOrientation'));
  assert.ok(source.includes("session.role==='admin'"));
});

test('V114 CARGA usa estudiantes reales de la comision',()=>{
  const source=fs.readFileSync('src/v114-plan-criteria-excel.js','utf8');
  assert.ok(source.includes('PCIStudentsCommissionsV72'));
  assert.ok(source.includes('studentsFor(ctx.commission.key)'));
  assert.ok(source.includes("header:'DNI'"));
  assert.ok(source.includes("header:'Apellido'"));
  assert.ok(source.includes("header:'Nombre'"));
});

test('V114 no toca nucleos protegidos del PCI',()=>{
  const app=fs.readFileSync('app.html','utf8');
  for(const protectedModule of [
    'src/v47-phase2-matrix.js',
    'src/v48-institutional-layer.js',
    'src/v80-access-control.js',
    'src/v91-coverage-core.js',
    'src/v91-plans-coverage.js'
  ]) assert.ok(app.includes(protectedModule),protectedModule);
});
