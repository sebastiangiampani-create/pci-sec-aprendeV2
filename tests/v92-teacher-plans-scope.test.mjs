import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('V92 Gestion no duplica Planes por docente como modulo independiente',()=>{
  const app=fs.readFileSync('app.html','utf8');
  const management=fs.readFileSync('src/v73-management-home.js','utf8');
  const home=fs.readFileSync('src/v74-home-redesign.js','utf8');

  assert.equal(app.includes('src/v92-teacher-plans.js'),false,'la vista duplicada no debe cargarse');
  assert.equal(management.includes("key:'planes'"),false,'Planes por docente no debe ser una tarjeta');
  for(const key of ["key:'docentes'","key:'asignaciones'","key:'excel'"])assert.ok(management.includes(key),key);
  assert.equal((management.match(/\{key:'/g)||[]).length,3);
  assert.match(home,/Docentes, cargos y asignaciones conectados con el Mapa de la Oferta y el Desarrollo Curricular/);
});

test('V92 conserva estudiantes y comisiones solo como dependencia interna fuera del recorrido visual',()=>{
  const app=fs.readFileSync('app.html','utf8');
  const management=fs.readFileSync('src/v73-management-home.js','utf8');
  assert.ok(app.includes('src/v72-students-commissions.js'));
  assert.equal(management.includes("key:'comisiones'"),false);
  assert.equal(management.includes("key:'estudiantes'"),false);
});

test('V92 deriva el acceso docente desde assignments reales de Gestion',()=>{
  const access=fs.readFileSync('src/v80-access-control.js','utf8');
  for(const needle of [
    'allImplementationRows','root().assignments','teacherAreasByOrientation',
    'teacherEditSubjectsByOrientation','editableSubjectsByOrientation',
    'Number(row.year)||0','subjectId:String(row.subjectId'
  ]) assert.ok(access.includes(needle),needle);
});

test('V92 docente ve el Desarrollo Curricular completo de su area',()=>{
  const phase=fs.readFileSync('src/v47-phase2-matrix.js','utf8');
  assert.ok(phase.includes("allowedAreasFor=(orientation=state.active)"));
  assert.ok(phase.includes("allowedAreas.has(x.a)"));
  assert.ok(phase.includes("host.innerHTML=ga(activeArea).map(card).join('')"));
});

test('V92 docente edita solo los espacios cuyo materia y nivel provienen de su asignacion',()=>{
  const phase=fs.readFileSync('src/v47-phase2-matrix.js','utf8');
  assert.ok(phase.includes("Number(x.year)===Number(g.year)"));
  assert.ok(phase.includes("(g.subjectIds||[]).map(String).includes(String(x.subjectId))"));
  assert.ok(phase.includes("if(canEditGroup(g))return"));
  assert.ok(phase.includes("card.querySelectorAll('input,textarea,[data-rm],[data-elec]').forEach(el=>el.disabled=true)"));
});

test('V92 los planes del Desarrollo Curricular heredan exactamente el permiso del espacio',()=>{
  const plans=fs.readFileSync('src/v91-plans-coverage.js','utf8');
  assert.ok(plans.includes("const editable=!!phase()?.canEditGroup?.(group)"));
  assert.ok(plans.includes("planCard(group,plan,editable)"));
  assert.ok(plans.includes("data-v91-field"));
  assert.ok(plans.includes("data-v91-content"));
});

test('V92 mantiene Mapa, Desarrollo Curricular, cobertura y permisos sin reescribir el nucleo',()=>{
  const app=fs.readFileSync('app.html','utf8');
  for(const protectedModule of [
    'src/v47-phase2-matrix.js','src/v59-phase2-annual-matrix.js',
    'src/v48-institutional-layer.js','src/v80-access-control.js',
    'src/v91-coverage-core.js','src/v91-plans-coverage.js'
  ]) assert.ok(app.includes(protectedModule),protectedModule);
});
