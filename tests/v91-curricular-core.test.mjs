import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import zlib from 'node:zlib';

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

test('V91 mantiene la base curricular y de gestion sin reactivar modulos retirados',()=>{
  const management=fs.readFileSync('src/v73-management-home.js','utf8');
  for(const key of ["key:'docentes'","key:'asignaciones'","key:'excel'"])assert.ok(management.includes(key),key);
  assert.equal(management.includes("key:'horarios'"),false);
  assert.equal(management.includes("key:'disponibilidad'"),false);
  assert.equal(management.includes("key:'equipos'"),false);
});

test('V103 base FG revisada tiene 1126 contenidos y Tutoría solo en primero y segundo',()=>{
  const files=Array.from({length:9},(_,i)=>`data/curriculum_v103/fg-all-p${i+1}.txt`);
  const encoded=files.map(x=>fs.readFileSync(x,'utf8').trim()).join('');
  const rows=JSON.parse(zlib.gunzipSync(Buffer.from(encoded,'base64')).toString('utf8'));
  assert.equal(rows.length,1126);
  assert.ok(rows.every(x=>Number(x.year)>=1&&Number(x.year)<=5&&x.subject&&x.text));
  assert.deepEqual([...new Set(rows.map(x=>Number(x.year)))].sort(),[1,2,3,4,5]);
  assert.deepEqual(Object.fromEntries([1,2,3,4,5].map(y=>[y,rows.filter(x=>Number(x.year)===y).length])),{1:253,2:241,3:257,4:217,5:158});
  const tutor=rows.filter(x=>x.subject==='Tutoría');
  assert.equal(tutor.length,24);
  assert.deepEqual([...new Set(tutor.map(x=>Number(x.year)))].sort(),[1,2]);
});

test('V97 cobertura toma materias reales del agrupamiento y deduplica por nivel',()=>{
  const source=fs.readFileSync('src/v91-coverage-core.js','utf8');
  assert.ok(source.includes('memberRows(group)'));
  assert.ok(source.includes('universeForGroup'));
  assert.ok(source.includes('universeForGroups'));
  assert.ok(source.includes('fgCoverageAgainstUniverse'));
  assert.ok(source.includes('groupingLevelCoverage'));
  assert.ok(source.includes('planCoverage'));
  assert.ok(source.includes('offLevel'));
});

test('V97 cobertura visible no duplica el sistema real de planes',()=>{
  const source=fs.readFileSync('src/v91-plans-coverage.js','utf8');
  assert.ok(source.includes('Cobertura del agrupamiento'));
  assert.ok(source.includes('Cobertura anual del espacio'));
  assert.ok(source.includes('Cada materia se coteja'));
  assert.ok(source.includes('formatCoverage'));
  assert.ok(source.includes('v97-group-coverage'));
  assert.equal(source.includes('v91Plans'),false);
  assert.equal(source.includes('data-v91-plan'),false);
  const plans=fs.readFileSync('src/v38-phase2-workspace.js','utf8');
  assert.ok(plans.includes('plansBimestrales'));
  assert.ok(plans.includes('Cobertura por materia'));
  assert.ok(plans.includes('Dentro del agrupamiento'));
});

test('V102 perfil conserva cargos y asignaciones y se integra al header',()=>{
  const source=fs.readFileSync('src/v85-access-panel.js','utf8');
  assert.ok(source.includes("cargoSummary"));
  assert.ok(source.includes("cargoLabel"));
  assert.ok(source.includes("root.assignments"));
  assert.ok(source.includes("v102-profile-head"));
  assert.ok(source.includes(".institutional-ba"));
  assert.equal(source.includes("v91-profile-menu"),false);
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
