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
    {id:'p-g2',year:2,area:'Ciencias Sociales',subject:'Geografía',text:'Geografia dos'}
  ]};
  const contents={
    c1:{id:'c1',component:'FG',subject:'Historia',text:'Historia uno'},
    c2:{id:'c2',component:'FG',subject:'Historia',text:'Historia dos'},
    c3:{id:'c3',component:'FG',subject:'Geografía',text:'Geografia uno'},
    c4:{id:'c4',component:'FG',subject:'Formación Ética y Ciudadana',text:'FEC uno'},
    c5:{id:'c5',component:'FG',subject:'Historia',text:'Historia tres'},
    c6:{id:'c6',component:'FG',subject:'Geografía',text:'Geografia dos'}
  };
  const groups=[
    {id:'lab-a',area:'Ciencias Sociales',type:'laboratorio',year:1,data:{contents:['c1','c3']}},
    {id:'lab-b',area:'Ciencias Sociales',type:'laboratorio',year:1,data:{contents:['c1','c2']}},
    {id:'troncal',area:'Ciencias Sociales',type:'troncal',year:1,data:{contents:['c4','c5']}},
    {id:'lab-y2',area:'Ciencias Sociales',type:'laboratorio',year:2,data:{contents:['c5']}}
  ];
  const window={
    addEventListener(){},
    PCIPhase2V28:{
      async loadCurriculum(){return{fg:data.rows,fo:[]}},
      getFGCatalog(){return data.rows},
      findContent(id){return contents[id]||null},
      members(){return[]},
      getAreaPool(){return[]}
    }
  };
  const context={
    console,window,
    fetch:async()=>({ok:true,json:async()=>data}),
    Set,Map
  };
  vm.runInNewContext(source,context,{filename:'src/v91-coverage-core.js'});
  await window.PCICoverageV91.ready();
  return {api:window.PCICoverageV91,groups};
}

test('V93 el 100 por ciento de un espacio FG es todo el agrupamiento del nivel',async()=>{
  const {api,groups}=await harness();
  const r=api.formatCoverage(groups[0]);
  assert.equal(r.total,4);
  assert.equal(r.used,2);
  assert.equal(r.percent,50);
  assert.deepEqual([...r.bySubject.map(x=>[x.subject,x.total,x.used])],[
    ['Formación Ética y Ciudadana',1,0],
    ['Geografía',1,1],
    ['Historia',2,1]
  ]);
});

test('V93 varios laboratorios se unen sin sumar repetidos',async()=>{
  const {api,groups}=await harness();
  const r=api.formatTypeCoverage(groups[0],groups);
  assert.equal(r.total,4);
  assert.equal(r.used,3);
  assert.equal(r.percent,75);
});

test('V93 cobertura del agrupamiento en el nivel une todos los formatos',async()=>{
  const {api,groups}=await harness();
  const r=api.groupingLevelCoverage(groups[0],groups);
  assert.equal(r.total,4);
  assert.equal(r.used,4);
  assert.equal(r.percent,100);
  assert.equal(r.offLevel,1,'el contenido de segundo usado en primero no suma');
});

test('V93 un plan usa el mismo denominador del nivel y no el del espacio',async()=>{
  const {api,groups}=await harness();
  const r=api.coverageForIds(groups[0],['c1']);
  assert.equal(r.total,4);
  assert.equal(r.used,1);
  assert.equal(r.percent,25);
});

test('V93 la trayectoria usa la union de los niveles del agrupamiento',async()=>{
  const {api,groups}=await harness();
  const r=api.trajectoryCoverage('Ciencias Sociales',groups);
  assert.equal(r.total,6);
  assert.equal(r.used,5);
  assert.equal(r.percent,83.3);
});

test('V93 carga panel de cobertura despues de V91 y conserva Tabla de control',()=>{
  const app=fs.readFileSync('app.html','utf8');
  const core=app.indexOf('src/v91-coverage-core.js');
  const plans=app.indexOf('src/v91-plans-coverage.js');
  const dashboard=app.indexOf('src/v93-curricular-coverage-dashboard.js');
  assert.ok(core>=0&&plans>core&&dashboard>plans);
  assert.ok(app.includes('src/v84-content-control-table.js'));
});

test('V93 panel muestra trayectoria nivel formatos y espacios',()=>{
  const source=fs.readFileSync('src/v93-curricular-coverage-dashboard.js','utf8');
  for(const needle of [
    'Panel de cobertura curricular','Agrupamiento · trayectoria',
    'groupingLevelCoverage','formatTypeCoverage','formatCoverage',
    'bySubject','byComponent','v93d-space-list'
  ]) assert.ok(source.includes(needle),needle);
});

test('V93 FO respeta jerarquia bloque eje y trata Historia orientada o Tecnologia como materia',()=>{
  const core=fs.readFileSync('src/v91-coverage-core.js','utf8');
  const plans=fs.readFileSync('src/v91-plans-coverage.js','utf8');
  assert.ok(core.includes("?'Materia':'Bloque'"));
  assert.ok(core.includes('foBreakdown'));
  assert.ok(core.includes('axes'));
  assert.ok(plans.includes('v93-axes'));
});
