import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

async function harness(){
  const source=fs.readFileSync('src/v91-coverage-core.js','utf8');
  const data={rows:[
    {id:'p-h1',year:1,area:'Ciencias Sociales',subject:'Historia',text:'Historia uno'},
    {id:'p-h2',year:1,area:'Ciencias Sociales',subject:'Historia',text:'Historia dos'},
    {id:'p-g1',year:1,area:'Ciencias Sociales',subject:'Geografía',text:'Geografia uno'},
    {id:'p-f1',year:1,area:'Ciencias Sociales',subject:'Formación Ética y Ciudadana',text:'FEC uno'},
    {id:'p-h3',year:2,area:'Ciencias Sociales',subject:'Historia',text:'Historia tres'},
    {id:'p-g2',year:2,area:'Ciencias Sociales',subject:'Geografía',text:'Geografia dos'},
    {id:'p-m1',year:1,area:'Matemática',subject:'Matemática',text:'Matematica uno'},
    {id:'p-m2',year:1,area:'Matemática',subject:'Matemática',text:'Matematica dos'}
  ]};
  const contents={
    c1:{id:'c1',component:'FG',subject:'Historia',text:'Historia uno'},
    c2:{id:'c2',component:'FG',subject:'Historia',text:'Historia dos'},
    c3:{id:'c3',component:'FG',subject:'Geografía',text:'Geografia uno'},
    c4:{id:'c4',component:'FG',subject:'Formación Ética y Ciudadana',text:'FEC uno'},
    c5:{id:'c5',component:'FG',subject:'Historia',text:'Historia tres'},
    c6:{id:'c6',component:'FG',subject:'Geografía',text:'Geografia dos'},
    cm1:{id:'cm1',component:'FG',subject:'Matemática',text:'Matematica uno'},
    cm2:{id:'cm2',component:'FG',subject:'Matemática',text:'Matematica dos'}
  };
  const subjects={
    's-h':{id:'s-h',name:'Historia',year:1,origin:'FG'},
    's-g':{id:'s-g',name:'Geografía',year:1,origin:'FG'},
    's-f':{id:'s-f',name:'Formación Ética y Ciudadana',year:1,origin:'FG'},
    's-m':{id:'s-m',name:'Matemática',year:1,origin:'FG'}
  };
  const groups=[
    {id:'lab-c1',area:'Ciencias Sociales',type:'laboratorio',year:1,term:'1',subjectIds:['s-h','s-g'],data:{contents:['c1','c3']}},
    {id:'lab-c2',area:'Ciencias Sociales',type:'laboratorio',year:1,term:'2',subjectIds:['s-h','s-f'],data:{contents:['c1','c2','c4']}},
    {id:'lab-y2',area:'Ciencias Sociales',type:'laboratorio',year:2,term:'3',subjectIds:[],data:{contents:['c5']}},
    {id:'troncal-m',area:'Matemática',type:'troncal',year:1,term:'1-2',subjectIds:['s-m'],data:{contents:['cm1','cm2']}}
  ];
  const window={
    addEventListener(){},
    PCIPhase2V28:{
      async loadCurriculum(){return{fg:data.rows,fo:[]}},
      getFGCatalog(){return data.rows},
      findContent(id){return contents[id]||null},
      members(group){return (group?.subjectIds||[]).map(id=>subjects[id]).filter(Boolean)},
      getAreaPool(){return[]}
    }
  };
  const context={console,window,Set,Map};
  vm.runInNewContext(source,context,{filename:'src/v91-coverage-core.js'});
  await window.PCICoverageV91.ready();
  return {api:window.PCICoverageV91,groups};
}

function bySubject(result,name){
  return result.bySubject.find(x=>x.subject===name);
}

test('V97 un laboratorio usa solo las materias que realmente conforman el agrupamiento',async()=>{
  const {api,groups}=await harness();
  const r=api.formatCoverage(groups[0]);
  assert.equal(r.total,3,'Historia 2 + Geografía 1');
  assert.equal(r.used,2);
  assert.equal(r.percent,66.7);
  assert.deepEqual(
    [...r.bySubject.map(x=>[x.subject,x.total,x.used,x.percent])],
    [['Geografía',1,1,100],['Historia',2,1,50]]
  );
  assert.equal(r.bySubject.some(x=>x.subject==='Formación Ética y Ciudadana'),false);
});

test('V97 la cobertura anual del nivel une agrupamientos y no duplica contenidos',async()=>{
  const {api,groups}=await harness();
  const r=api.groupingLevelCoverage(groups[0],groups);
  assert.equal(r.total,4,'Historia 2 + Geografía 1 + FEC 1');
  assert.equal(r.used,4,'c1 aparece en C1 y C2 pero cuenta una sola vez');
  assert.equal(r.percent,100);
  assert.deepEqual(
    [...r.bySubject.map(x=>[x.subject,x.total,x.used])],
    [
      ['Formación Ética y Ciudadana',1,1],
      ['Geografía',1,1],
      ['Historia',2,2]
    ]
  );
});

test('V97 un plan de laboratorio se coteja contra anual y contra su agrupamiento',async()=>{
  const {api,groups}=await harness();
  const r=api.planCoverage(groups[0],['c1']);
  assert.equal(r.dual,true);
  const historia=r.rows.find(x=>x.label==='Historia');
  const geografia=r.rows.find(x=>x.label==='Geografía');
  assert.deepEqual(
    [historia.planUsed,historia.annualTotal,historia.annualPercent,historia.groupingTotal,historia.groupingPercent],
    [1,2,50,1,100]
  );
  assert.deepEqual(
    [geografia.planUsed,geografia.annualTotal,geografia.groupingTotal,geografia.groupingPercent],
    [0,1,1,0]
  );
});

test('V97 una troncal compara el plan solo con el anual de su materia',async()=>{
  const {api,groups}=await harness();
  const troncal=groups.find(x=>x.id==='troncal-m');
  const space=api.formatCoverage(troncal);
  assert.equal(space.total,2);
  assert.equal(space.used,2);
  const r=api.planCoverage(troncal,['cm1']);
  assert.equal(r.dual,false);
  assert.equal(r.rows.length,1);
  assert.deepEqual(
    [r.rows[0].label,r.rows[0].planUsed,r.rows[0].annualTotal,r.rows[0].annualPercent],
    ['Matemática',1,2,50]
  );
});

test('V97 los contenidos de otro nivel no suman a un agrupamiento',async()=>{
  const {api,groups}=await harness();
  const r=api.coverageForIds(groups[0],['c1','c5']);
  assert.equal(r.total,3);
  assert.equal(r.used,1);
  assert.equal(r.offLevel,1);
});

test('V97 mantiene el panel separado de los planes y la tabla de control',()=>{
  const app=fs.readFileSync('app.html','utf8');
  const core=app.indexOf('src/v91-coverage-core.js');
  const plans=app.indexOf('src/v91-plans-coverage.js');
  const dashboard=app.indexOf('src/v93-curricular-coverage-dashboard.js');
  assert.ok(core>=0&&plans>core&&dashboard>plans);
  assert.ok(app.includes('src/v84-content-control-table.js'));
});

test('V97 no crea un segundo sistema de planes dentro de las tarjetas',()=>{
  const source=fs.readFileSync('src/v91-plans-coverage.js','utf8');
  assert.equal(source.includes('v91Plans'),false);
  assert.equal(source.includes('data-v91-plan'),false);
  assert.ok(source.includes('Cobertura del agrupamiento'));
  assert.ok(source.includes('Cobertura anual del espacio'));
  assert.ok(source.includes('formatCoverage'));
  assert.ok(source.includes('v97-group-coverage'));
});

test('V97 los planes reales muestran anual y agrupamiento por materia',()=>{
  const source=fs.readFileSync('src/v38-phase2-workspace.js','utf8');
  assert.ok(source.includes('Cobertura por materia'));
  assert.ok(source.includes('Del anual'));
  assert.ok(source.includes('Dentro del agrupamiento'));
  assert.ok(source.includes('planCoverage(g,p.contentIds'));
  assert.ok(source.includes('PCIPlanCoverageV94'));
});

test('V97 panel prioriza nivel, materia y agrupamientos sin repetir total de trayectoria',()=>{
  const source=fs.readFileSync('src/v93-curricular-coverage-dashboard.js','utf8');
  for(const needle of [
    'Panel de cobertura curricular','Cobertura anual por materia',
    'groupingLevelCoverage','formatCoverage','Agrupamientos del nivel',
    'no se repite aquí el total general de la bolsa'
  ]) assert.ok(source.includes(needle),needle);
  assert.equal(source.includes('Agrupamiento · trayectoria'),false);
});


test('V98 reorganiza solo el panel general con filtros y desplegables',()=>{
  const source=fs.readFileSync('src/v93-curricular-coverage-dashboard.js','utf8');
  for(const needle of [
    'id="v98dArea"','id="v98dLevel"','id="v98dStatus"',
    'Agrupamientos del nivel','<details class="v98d-grouping">',
    '<details class="v98d-area"','renderResults','Limpiar'
  ]) assert.ok(source.includes(needle),needle);
  const spaces=fs.readFileSync('src/v91-plans-coverage.js','utf8');
  assert.ok(spaces.includes('Cobertura del agrupamiento'));
  assert.ok(spaces.includes('v97-group-coverage'));
});


test('V99 el panel despliega planes por agrupamiento y es imprimible',()=>{
  const source=fs.readFileSync('src/v93-curricular-coverage-dashboard.js','utf8');
  for(const needle of [
    'Planes del agrupamiento',
    'planCoverage?.(g,p?.contentIds',
    'id="v99dPrint"',
    'function printPanel()',
    'Imprimir / Guardar PDF',
    'los porcentajes de los planes no se suman entre sí'
  ]) assert.ok(source.includes(needle),needle);
});


test('V100 la barra general despliega la cobertura completa por nivel',()=>{
  const source=fs.readFileSync('src/v91-plans-coverage.js','utf8');
  for(const needle of [
    'Ver cobertura por nivel',
    'Contenidos únicos del nivel, materia por materia.',
    'groupingLevelCoverage',
    'v100-level-breakdown',
    'decorateAreaCoverage'
  ]) assert.ok(source.includes(needle),needle);
});


test('V105 no mezcla FG y FO ni en porcentaje ni en bolsa',()=>{
  const source=fs.readFileSync('src/v47-phase2-matrix.js','utf8');
  for(const needle of [
    "componentCoverage(a,'FG')",
    "componentCoverage(a,'FO')",
    "contenidos de Formación General cubiertos",
    "Se muestran aparte y no se suman a este porcentaje.",
    "source=a==='Formación Orientada'?'FO':'FG'",
    "c=>c.component===source",
    "Formación General</button>",
    'data-src="FO"'
  ]) assert.ok(source.includes(needle),needle);
  assert.equal(source.includes('data-src="ALL"'),false);
  assert.equal(source.includes("source='ALL'"),false);
  assert.equal(source.includes("FG + ${foCount}"),false);
});


test('V106 permite asignar FG de otros niveles pero la cobertura solo cuenta el nivel del espacio',async()=>{
  const matrix=fs.readFileSync('src/v47-phase2-matrix.js','utf8');
  assert.ok(matrix.includes("if(c.component!=='FG'||c.area!==g.area)return false;"));
  assert.equal(matrix.includes("Number(c.year)!==Number(g.year)"),false);

  const {api,groups}=await harness();
  const r=api.coverageForIds(groups[0],['c1','c5']);
  assert.equal(r.used,1);
  assert.equal(r.offLevel,1);
  assert.equal(r.percent,33.3);
});


test('V107 un nombre editado en Desarrollo Curricular se reutiliza en el Mapa de la Oferta',()=>{
  const phase2=fs.readFileSync('src/v47-phase2-matrix.js','utf8');
  const map=fs.readFileSync('src/v19-map.js','utf8');
  assert.ok(phase2.includes("pci-space-name-changed"));
  assert.ok(phase2.includes("detail:{slot:g.id,name:String(g.data.name||g.name||'').trim()}"));
  assert.ok(map.includes("current()?.phase2V28?.groups?.[slot]?.name"));
  assert.ok(map.includes("data-space-name"));
  assert.ok(map.includes("phase2SpaceName(slot"));
  assert.ok(map.includes("window.addEventListener('pci-space-name-changed'"));
});

test('V97 FO conserva jerarquía de componentes cuando exista base anual por nivel',()=>{
  const core=fs.readFileSync('src/v91-coverage-core.js','utf8');
  assert.ok(core.includes("?'Materia':'Bloque'"));
  assert.ok(core.includes('foBreakdown'));
  assert.ok(core.includes('axes'));
});
