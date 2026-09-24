import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

test('V65 monta el constructor sin depender de la UI de ofrecimiento',async()=>{
  const source=await readFile(new URL('../src/v65-annual-scheduler.js',import.meta.url),'utf8');
  const renderStart=source.indexOf('function render(){');
  const scheduleStart=source.indexOf('function schedule()',renderStart);
  assert.ok(renderStart>=0&&scheduleStart>renderStart,'debe existir el render del constructor V65');
  const renderBody=source.slice(renderStart,scheduleStart);
  assert.match(renderBody,/v48InstitutionalContent/);
  assert.match(renderBody,/v65AnnualScheduler/);
  assert.match(renderBody,/document\.createElement\('section'\)/);
  assert.doesNotMatch(renderBody,/v56OfferModel|v65AnnualOffer/);
});

test('V91 no monta el constructor de Horarios desde Gestión',async()=>{
  const source=await readFile(new URL('../src/v73-management-home.js',import.meta.url),'utf8');
  assert.doesNotMatch(source,/key:'horarios'/);
  assert.doesNotMatch(source,/PCIAnnualSchedulerV65|PCIScheduleStableV81|PCIScheduleViews/);
});

test('Vistas del horario se anclan primero al constructor V65 y respetan su visibilidad',async()=>{
  const source=await readFile(new URL('../src/schedule-views.js',import.meta.url),'utf8');
  assert.match(source,/document\.body\.classList\.contains\('v73-management-home-active'\)/);
  assert.match(source,/const sched=\$\('v65AnnualScheduler'\)\|\|\$\('v68AnnualScheduler'\)\|\|\$\('v53Scheduler'\)/);
  assert.match(source,/sched\.classList\.contains\('v73-hidden'\)/);
  assert.match(source,/sched\.after\(box\)/);
  assert.match(source,/Generá primero el horario anual\./);
});

test('r45 no reintroduce la interfaz visual de ofrecimiento docente',async()=>{
  const files=[
    '../src/v73-management-home.js',
    '../src/schedule-views.js',
    '../src/v65-annual-scheduler.js'
  ];
  for(const p of files){
    const source=await readFile(new URL(p,import.meta.url),'utf8');
    assert.doesNotMatch(source,/Carga y ofrecimiento docente|Oferta mínima y porcentaje variable|Usar mínimo/);
  }
});


test('el constructor usa el cargador simple sin versiones manuales',async()=>{
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
