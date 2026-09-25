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

test('V96 base FG tiene 979 contenidos y Tutoría solo en primero y segundo',()=>{
  const files=Array.from({length:9},(_,i)=>`data/curriculum_v96/fg-all-p${i+1}.txt`);
  const encoded=files.map(x=>fs.readFileSync(x,'utf8').trim()).join('');
  const rows=JSON.parse(zlib.gunzipSync(Buffer.from(encoded,'base64')).toString('utf8'));
  const year=x=>Number(Array.isArray(x)?(x.length>=7?x[1]:x[0]):(x.year??x.anio??x['Año']));
  const subject=x=>String(Array.isArray(x)?(x.length>=7?x[3]:x[1]):(x.subject??x.materia??x['Materia']??''));
  const text=x=>String(Array.isArray(x)?(x.length>=7?x[6]:x[4]):(x.text??x.contenido??x['Contenido']??''));
  assert.equal(rows.length,979);
  assert.ok(rows.every(x=>year(x)>=1&&year(x)<=5&&subject(x)&&text(x)));
  assert.deepEqual([...new Set(rows.map(year))].sort(),[1,2,3,4,5]);
  const tutor=rows.filter(x=>subject(x)==='Tutoría');
  assert.equal(tutor.length,19);
  assert.deepEqual([...new Set(tutor.map(year))].sort(),[1,2]);
});
test('V93 cobertura usa como 100 por ciento el agrupamiento completo del nivel',()=>{
  const source=fs.readFileSync('src/v91-coverage-core.js','utf8');
  assert.ok(source.includes("universeForLevel"));
  assert.ok(source.includes("x.year===Number(year)&&x._area===ak"));
  assert.ok(source.includes("groupingLevelCoverage"));
  assert.ok(source.includes("formatTypeCoverage"));
  assert.ok(source.includes("trajectoryCoverage"));
  assert.ok(source.includes("offLevel"));
});

test('V93 mantiene cuatro planes y muestra trayectoria nivel formato espacio y plan',()=>{
  const source=fs.readFileSync('src/v91-plans-coverage.js','utf8');
  assert.ok(source.includes("[1,2,3,4].map"));
  assert.ok(source.includes("Agrupamiento · trayectoria"));
  assert.ok(source.includes("Agrupamiento · nivel"));
  assert.ok(source.includes("Este espacio"));
  assert.ok(source.includes("Planes del espacio"));
  assert.ok(source.includes("Primer cuatrimestre · Planes 1 y 2"));
  assert.ok(source.includes("Segundo cuatrimestre · Planes 3 y 4"));
  assert.ok(source.includes("Criterios colegiados de evaluación"));
  assert.ok(source.includes("coverageForIds?.(group,plan.contents)"));
  assert.ok(source.includes("formatTypeCoverage"));
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
