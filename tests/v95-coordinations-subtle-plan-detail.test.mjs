import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function loadAccess(){
  const source=fs.readFileSync('src/v80-access-control.js','utf8');
  const state={
    active:'Sociales',
    selected:['Sociales','Economía'],
    institutional:{
      teachers:{
        t1:{id:'t1',name:'Coord Uno',email:'uno@escuela.edu.ar'},
        t2:{id:'t2',name:'Coord Dos',email:'dos@escuela.edu.ar'}
      },
      assignments:{},
      coordinations:[
        {id:'c1',teacherId:'t1',kind:'area',scope:'Ciencias Sociales',shift:'Mañana'},
        {id:'c2',teacherId:'t2',kind:'area',scope:'Ciencias Sociales',shift:'Tarde'},
        {id:'c3',teacherId:'t1',kind:'orientation',scope:'Economía',shift:'Tarde'},
        {id:'c4',teacherId:'t1',kind:'orientation',scope:'Economía',shift:'Mañana'}
      ]
    }
  };
  const groups={
    Sociales:[
      {id:'s1',area:'Ciencias Sociales',subjectIds:['hist1']},
      {id:'s2',area:'Matemática',subjectIds:['mat1']},
      {id:'s3',area:'Formación Orientada',subjectIds:['fo1']}
    ],
    Economía:[
      {id:'e1',area:'Ciencias Sociales',subjectIds:['hist1']},
      {id:'e2',area:'Matemática',subjectIds:['mat1']},
      {id:'e3',area:'Formación Orientada',subjectIds:['fo1']}
    ]
  };
  let appliedScope=null;
  const window={
    addEventListener(){},
    dispatchEvent(){},
    PCIInstitutionalV48:{allImplementationRows(){return[]}},
    PCIPhase2V28:{
      groups(){return groups[state.active]||[]},
      setAccessScope(scope){appliedScope=scope}
    }
  };
  const document={
    body:{dataset:{}},
    head:{appendChild(){}},
    createElement(){return {textContent:''}},
    getElementById(){return null},
    querySelector(){return null},
    querySelectorAll(){return[]},
    addEventListener(){}
  };
  const context={
    console,window,document,state,
    setTimeout(){return 0},
    clearTimeout(){},
    MutationObserver:class{observe(){} disconnect(){}},
    CustomEvent:class{constructor(type,opts){this.type=type;this.detail=opts?.detail}},
    toast(){},
    Set,Map,Object,Array,String,Number,JSON
  };
  vm.runInNewContext(source,context,{filename:'src/v80-access-control.js'});
  return {api:window.PCIAppAccessV80,state,getApplied:()=>appliedScope};
}

test('V95 Gestion guarda coordinaciones multiples por area orientacion y turno',()=>{
  const source=fs.readFileSync('src/v71-lean-management.js','utf8');
  for(const needle of [
    "r.coordinations=Array.isArray(r.coordinations)?r.coordinations:[]",
    "kind==='area'",
    "kind==='orientation'",
    "SHIFTS=['Sin especificar','Mañana','Tarde','Vespertino','Jornada completa']",
    'Coordinación de área',
    'Coordinación de orientación',
    'Un mismo docente puede tener varias coordinaciones'
  ]) assert.ok(source.includes(needle),needle);
  assert.equal(source.includes('Otros formatos pedagógicos'),false);
});

test('V95 permite varios coordinadores del mismo ambito y distingue turno',()=>{
  const source=fs.readFileSync('src/v71-lean-management.js','utf8');
  assert.ok(source.includes("String(x.teacherId)===String(teacherId)&&x.kind===kind&&String(x.scope)===String(scope)&&String(x.shift||'Sin especificar')===String(shift)"));
  assert.ok(source.includes("r.coordinations.push"));
  assert.ok(source.includes("data-v95-coord-remove"));
});

test('V95 coordinador de area edita esa area en todas las orientaciones',()=>{
  const {api}=loadAccess();
  const editable=api.coordinatorEditableAreasByOrientation('t1');
  assert.ok(editable.Sociales.includes('Ciencias Sociales'));
  assert.ok(editable.Economía.includes('Ciencias Sociales'));
});

test('V95 coordinador de orientacion edita todas las areas de su orientacion',()=>{
  const {api}=loadAccess();
  const editable=api.coordinatorEditableAreasByOrientation('t1');
  assert.ok(editable.Economía.includes('Ciencias Sociales'));
  assert.ok(editable.Economía.includes('Matemática'));
  assert.ok(editable.Economía.includes('Formación Orientada'));
  assert.equal(editable.Sociales.includes('Matemática'),false);
});

test('V95 acumula varias coordinaciones del mismo docente',()=>{
  const {api}=loadAccess();
  const rows=api.coordinatorAssignments('t1');
  assert.equal(rows.length,3);
  const access=api.setSession({role:'coordinator',teacherId:'t1'});
  assert.equal(access.role,'coordinator');
  assert.equal(access.teacherId,'t1');
  assert.ok(access.editableAreasByOrientation.Sociales.includes('Ciencias Sociales'));
  assert.ok(access.editableAreasByOrientation.Economía.includes('Matemática'));
});

test('V95 login de coordinador deriva permisos desde Gestion y no los inventa al ingresar',()=>{
  const source=fs.readFileSync('src/v85-access-panel.js','utf8');
  for(const needle of [
    'Ingresar con coordinaciones de Gestión',
    'coordinatorRows',
    'coordinatorOptions',
    'coordinationSummary',
    "applyProfile({role:'coordinator',teacherId:row.teacher.id"
  ]) assert.ok(source.includes(needle),needle);
  assert.equal(source.includes("let coordinatorOrientation=''"),false);
});

test('V95 Asignacion a espacios incluye coordinaciones sin sumar una tarjeta nueva',()=>{
  const home=fs.readFileSync('src/v73-management-home.js','utf8');
  assert.ok(home.includes('.v71o-assignment,#v48InstitutionalContent > .v95-coordination'));
  for(const key of ["key:'docentes'","key:'asignaciones'","key:'excel'"])assert.ok(home.includes(key),key);
  assert.equal((home.match(/\{key:'/g)||[]).length,3);
});

test('V95 detalle de cobertura permanece visible pero usa filas sutiles',()=>{
  const source=fs.readFileSync('src/v38-phase2-workspace.js','utf8');
  for(const needle of [
    'v95-plan-kpis',
    'v95-coverage-table',
    'v95-coverage-line',
    'Materia / componente',
    'planCoverageSummary(g,p,true)'
  ]) assert.ok(source.includes(needle),needle);
  assert.equal(source.includes('v94-subjects'),false);
  assert.equal(source.includes('v94-subject-metrics'),false);
});

test('V95 reinicio de Gestion contempla coordinaciones',()=>{
  const source=fs.readFileSync('src/v71-management-nav-reset.js','utf8');
  assert.ok(source.includes('docentes, cargos, asignaciones, coordinaciones'));
});
