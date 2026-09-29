import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function loadAccess(){
  const source=fs.readFileSync('src/v80-access-control.js','utf8');
  const state={
    active:'Orientacion A',
    selected:['Orientacion A','Orientacion B'],
    institutional:{teachers:{t1:{id:'t1',name:'Coord'}},assignments:{},coordinations:[
      {id:'c1',teacherId:'t1',kind:'area',scope:'Ciencias Sociales',shift:'Mañana'}
    ]}
  };
  const groups={
    'Orientacion A':[{id:'a1',area:'Ciencias Sociales'},{id:'a2',area:'Matemática'}],
    'Orientacion B':[{id:'b1',area:'Formación Orientada'},{id:'b2',area:'Artes'}]
  };
  const window={
    addEventListener(){},dispatchEvent(){},
    PCIInstitutionalV48:{allImplementationRows(){return[]}},
    PCIPhase2V28:{groups(){return groups[state.active]||[]},setAccessScope(){}}
  };
  const document={
    body:{dataset:{}},head:{appendChild(){}},
    createElement(){return {textContent:''}},
    getElementById(){return null},querySelector(){return null},querySelectorAll(){return[]},addEventListener(){}
  };
  const context={console,window,document,state,setTimeout(){return 0},clearTimeout(){},MutationObserver:class{observe(){} disconnect(){}},CustomEvent:class{},toast(){},Set,Map,Object,Array,String,Number,JSON};
  vm.runInNewContext(source,context,{filename:'src/v80-access-control.js'});
  return window.PCIAppAccessV80;
}

test('V110 coordinador ve las areas reales de cada orientacion',()=>{
  const api=loadAccess();
  const allowed=api.coordinatorAllowedAreasByOrientation();
  assert.deepEqual([...allowed['Orientacion A']].sort(),['Ciencias Sociales','Matemática'].sort());
  assert.deepEqual([...allowed['Orientacion B']].sort(),['Artes','Formación Orientada'].sort());
});

test('V110 ficha docente muestra y edita coordinaciones',()=>{
  const source=fs.readFileSync('src/v71-lean-management.js','utf8');
  for(const needle of [
    'coordinationInlineHtml',
    'teacherCoordinationRows',
    'data-v110-coord-editor',
    'data-v110-coord-kind',
    'data-v110-coord-add',
    'addCoordinationForTeacher',
    "'Formación Orientada'"
  ]) assert.ok(source.includes(needle),needle);
});

test('V110 Excel valida ambito segun tipo de coordinacion',()=>{
  const source=fs.readFileSync('src/v71-simple-assignment-excel.js','utf8');
  for(const needle of [
    'function coordinationScope(kind,value)',
    "kind==='area'",
    'COORDINATION_AREAS',
    'state.selected',
    "const scope=coordinationScope(kind"
  ]) assert.ok(source.includes(needle),needle);
});
