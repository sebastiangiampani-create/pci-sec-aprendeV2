import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

const files=[
  '../src/v73-management-home.js',
  '../src/v71-management-nav-reset.js',
  '../src/v71-lean-management.js'
];

test('Gestión no referencia el scheduler V68 obsoleto',async()=>{
  for(const p of files){
    const source=await readFile(new URL(p,import.meta.url),'utf8');
    assert.doesNotMatch(source,/PCIAnnualSchedulerV68/);
  }
});

test('V91 retira Horarios del recorrido activo de Gestión',async()=>{
  const [home,app]=await Promise.all([
    readFile(new URL('../src/v73-management-home.js',import.meta.url),'utf8'),
    readFile(new URL('../app.html',import.meta.url),'utf8')
  ]);
  assert.doesNotMatch(home,/key:'horarios'/);
  assert.doesNotMatch(home,/PCIAnnualSchedulerV65|PCIScheduleStableV81/);
  assert.doesNotMatch(app,/src\/v65-annual-scheduler\.js|src\/v81-stable-scheduler\.js/);
});

test('Gestión usa el cargador simple sin versiones manuales',async()=>{
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
