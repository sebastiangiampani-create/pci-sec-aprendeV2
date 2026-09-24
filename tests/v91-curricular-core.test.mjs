import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('V91 recorta el recorrido a curriculum y gestion necesaria',()=>{
  const app=fs.readFileSync('app.html','utf8');
  for(const removed of [
    'src/v78-asistencia.js','src/v79-regularidad.js','src/v83-attendance-course-report.js',
    'src/v76-calificaciones.js','src/v77-boletines-cierres.js',
    'src/v51-school-timetable-config.js','src/v65-annual-scheduler.js','src/v81-stable-scheduler.js',
    'src/v60-availability-preferences.js','src/schedule-views.js'
  ]) assert.equal(app.includes(removed),false,removed+' no debe cargarse');
  assert.ok(app.includes('src/v91-coverage-core.js'));
  assert.ok(app.includes('src/v91-plans-coverage.js'));
  assert.ok(app.includes('src/v71-simple-assignment-excel.js'));
});

test('V91 mantiene gestion de docentes cargos asignaciones y estudiantes',()=>{
  const management=fs.readFileSync('src/v73-management-home.js','utf8');
  for(const key of ["key:'docentes'","key:'asignaciones'","key:'comisiones'","key:'excel'","key:'respaldo'"])assert.ok(management.includes(key),key);
  assert.equal(management.includes("key:'horarios'"),false);
  assert.equal(management.includes("key:'disponibilidad'"),false);
  assert.equal(management.includes("key:'equipos'"),false);
});

test('V91 base de cobertura tiene año prescripto explicito',()=>{
  const data=JSON.parse(fs.readFileSync('data/contenidos-prescriptos-fg.json','utf8'));
  assert.ok(Array.isArray(data.rows));
  assert.ok(data.rows.length>1000);
  assert.ok(data.rows.every(x=>Number(x.year)>=1&&Number(x.year)<=5));
  assert.ok(data.rows.every(x=>x.id&&x.subject&&x.text));
  assert.deepEqual([...new Set(data.rows.map(x=>x.year))].sort(),[1,2,3,4,5]);
});

test('V91 cobertura usa denominador del año y materias del espacio',()=>{
  const source=fs.readFileSync('src/v91-coverage-core.js','utf8');
  assert.ok(source.includes("x.year===year&&keys.has(x._subject)"));
  assert.ok(source.includes("used.size/universe.length"));
  assert.ok(source.includes("offLevel"));
  assert.ok(source.includes("memberSubjects"));
});

test('V91 define cuatro planes y dos dimensiones independientes',()=>{
  const source=fs.readFileSync('src/v91-plans-coverage.js','utf8');
  assert.ok(source.includes("[1,2,3,4].map"));
  assert.ok(source.includes("Dimensión 1 · Formato curricular"));
  assert.ok(source.includes("Dimensión 2 · Planes"));
  assert.ok(source.includes("Primer cuatrimestre · Planes 1 y 2"));
  assert.ok(source.includes("Segundo cuatrimestre · Planes 3 y 4"));
  assert.ok(source.includes("Criterios colegiados de evaluación"));
  assert.ok(source.includes("coverageForIds?.(group,plan.contents)"));
  assert.ok(source.includes("formatCoverage?.(group)"));
});

test('V91 perfil muestra cargos reales y asignaciones',()=>{
  const source=fs.readFileSync('src/v85-access-panel.js','utf8');
  assert.ok(source.includes("cargoSummary"));
  assert.ok(source.includes("cargoLabel"));
  assert.ok(source.includes("v91-profile-menu"));
  assert.ok(source.includes("root.assignments"));
});

test('V91 docente edita solo grupos vinculados a materia y nivel asignados',()=>{
  const access=fs.readFileSync('src/v80-access-control.js','utf8');
  const phase=fs.readFileSync('src/v47-phase2-matrix.js','utf8');
  assert.ok(access.includes("teacherEditSubjectsByOrientation"));
  assert.ok(access.includes("editableSubjectsByOrientation"));
  assert.ok(phase.includes("canEditGroup"));
  assert.ok(phase.includes("Number(x.year)===Number(g.year)"));
  assert.ok(phase.includes("g.subjectIds"));
});
