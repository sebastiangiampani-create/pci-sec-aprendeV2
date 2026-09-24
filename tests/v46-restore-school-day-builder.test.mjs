import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

test('Jornada escolar sigue existiendo como módulo V51 independiente',async()=>{
  const source=await readFile(new URL('../src/v51-school-timetable-config.js',import.meta.url),'utf8');
  assert.match(source,/id='v51ScheduleConfig'/);
  assert.match(source,/Jornada escolar/);
  assert.match(source,/Configuración horaria de la escuela/);
  assert.match(source,/Generar grilla/);
  assert.match(source,/Agregar hora manual/);
  assert.match(source,/PCIScheduleConfigV51=\{[^}]*ensureSection/);
});

test('V91 conserva Jornada escolar como código legado pero no la carga en Gestión',async()=>{
  const [management,app]=await Promise.all([
    readFile(new URL('../src/v73-management-home.js',import.meta.url),'utf8'),
    readFile(new URL('../app.html',import.meta.url),'utf8')
  ]);
  assert.doesNotMatch(management,/key:'horarios'|PCIScheduleConfigV51|PCIAnnualSchedulerV65/);
  assert.doesNotMatch(app,/src\/v51-school-timetable-config\.js|src\/v65-annual-scheduler\.js/);
});

test('r46 mantiene Ofrecimiento fuera de Horarios',async()=>{
  const source=await readFile(new URL('../src/v73-management-home.js',import.meta.url),'utf8');
  assert.doesNotMatch(source,/Carga y ofrecimiento docente|Oferta mínima y porcentaje variable|Usar mínimo/);
});

test('la jornada usa el cargador simple sin versiones manuales',async()=>{
  const [loader,index,app]=await Promise.all([
    readFile(new URL('../app-safe.html',import.meta.url),'utf8'),
    readFile(new URL('../index.html',import.meta.url),'utf8'),
    readFile(new URL('../app.html',import.meta.url),'utf8')
  ]);
  assert.match(loader,/fetch\('app\.html',\{cache:'no-store'\}\)/);
  assert.match(index,/fetch\('app\.html',\{cache:'no-store'\}\)/);
  assert.match(app,/fetch\(url,\{cache:'no-store'\}\)/);
  assert.doesNotMatch(loader,/\?v=/);
  assert.doesNotMatch(index,/\?v=/);
  assert.doesNotMatch(app,/\?v=/);
});
