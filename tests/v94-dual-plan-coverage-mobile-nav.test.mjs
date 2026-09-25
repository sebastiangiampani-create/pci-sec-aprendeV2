import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function loadPlanCoverage(){
  const source=fs.readFileSync('src/v38-phase2-workspace.js','utf8');
  const window={
    PCIPhase2V28:null,
    PCICoverageV91:{
      coverageForIds(){
        return {
          total:40,used:2,percent:5,
          bySubject:[
            {subject:'Historia',total:20,used:1,percent:5},
            {subject:'Geografía',total:15,used:1,percent:6.7},
            {subject:'FEC',total:5,used:0,percent:0}
          ],
          byComponent:[]
        };
      },
      formatCoverage(){
        return {
          total:40,used:15,percent:37.5,
          bySubject:[
            {subject:'Historia',total:20,used:8,percent:40},
            {subject:'Geografía',total:15,used:5,percent:33.3},
            {subject:'FEC',total:5,used:2,percent:40}
          ],
          byComponent:[]
        };
      }
    }
  };
  const document={
    readyState:'loading',
    addEventListener(){},
    getElementById(){return null},
    querySelectorAll(){return[]},
    body:{appendChild(){}},
    head:{appendChild(){}},
    createElement(){return {id:'',className:'',textContent:'',appendChild(){},addEventListener(){}}}
  };
  const context={
    console,window,document,
    state:{active:'Sociales'},
    ensure(){return {phase2V28:{groups:{},customContents:[]}}},
    save(){},
    requestAnimationFrame(){},
    confirm(){return true},
    alert(){},
    FormData:class{},
    Date,Math,Set,Map
  };
  vm.runInNewContext(source,context,{filename:'src/v38-phase2-workspace.js'});
  return window.PCIPlanCoverageV94;
}

test('V94 usa valores absolutos y porcentaje',()=>{
  const api=loadPlanCoverage();
  assert.equal(api.metric(10,50),'10/50 · 20%');
  assert.equal(api.metric(0,50),'0/50 · 0%');
});

test('V94 laboratorio mide plan contra nivel y contra espacio',()=>{
  const api=loadPlanCoverage();
  const group={type:'laboratorio',year:1};
  const plan={contentIds:['h1','g1']};
  const result=api.planCoverage(group,plan.contentIds);
  assert.equal(result.levelUsed,2);
  assert.equal(result.levelTotal,40);
  assert.equal(result.spaceUsed,15);
  const html=api.planCoverageSummary(group,plan,true);
  assert.match(html,/2\/40 · 5%/);
  assert.match(html,/2\/15 · 13\.3%/);
  assert.match(html,/Historia/);
  assert.match(html,/1\/20 · 5%/);
  assert.match(html,/1\/8 · 12\.5%/);
});

test('V94 taller tambien tiene doble denominador y troncal prioriza nivel',()=>{
  const api=loadPlanCoverage();
  assert.equal(api.dualSpace({type:'taller'}),true);
  assert.equal(api.dualSpace({type:'laboratorio'}),true);
  assert.equal(api.dualSpace({type:'troncal'}),false);
  const plan={contentIds:['h1','g1']};
  assert.match(api.planCoverageSummary({type:'taller',year:1},plan,true),/Dentro del taller/);
  assert.equal(api.planCoverageSummary({type:'troncal',year:1},plan,true).includes('Dentro del'),false);
});

test('V94 muestra cobertura por materia directamente en las tarjetas reales de planes',()=>{
  const source=fs.readFileSync('src/v38-phase2-workspace.js','utf8');
  for(const needle of [
    'planCoverageSummary(g,p,true)',
    'v94-subjects',
    'v94-subject-metrics',
    'Aporte al',
    'Dentro del',
    'Los valores muestran contenidos usados/total y porcentaje'
  ]) assert.ok(source.includes(needle),needle);
});

test('V94 actualiza cobertura al seleccionar contenidos dentro del plan',()=>{
  const source=fs.readFileSync('src/v38-phase2-workspace.js','utf8');
  assert.ok(source.includes("querySelectorAll('[data-pcontent]').forEach"));
  assert.ok(source.includes("host.innerHTML=planCoverageSummary(g,p,true)"));
  assert.ok(source.includes('v94PlanCoverage'));
});

test('V94 aplica la misma cobertura a planes electivos A y B',()=>{
  const source=fs.readFileSync('src/v47-elective-plans.js','utf8');
  assert.ok(source.includes('PCIPlanCoverageV94'));
  assert.ok(source.includes('v94ElectiveCoverage'));
  assert.ok(source.includes('data-back-space'));
  assert.ok(source.includes('Los valores muestran contenidos usados/total y porcentaje'));
});

test('V94 restaura botones Volver y hace visible el navegador flotante sobre modales en movil',()=>{
  const nav=fs.readFileSync('src/ui-navigation-consistency.js','utf8');
  assert.ok(nav.includes('.screen>.back{display:inline-flex!important'));
  assert.ok(nav.includes('z-index:9997'));
  assert.ok(nav.includes("['v38modal','v39modal','v84ContentControl','v93CoverageDashboard']"));
  assert.ok(nav.includes('env(safe-area-inset-bottom'));
});

test('V94 evita que el perfil movil tape planes y dock',()=>{
  const profile=fs.readFileSync('src/v85-access-panel.js','utf8');
  assert.ok(profile.includes('bottom:calc(82px + env(safe-area-inset-bottom,0px))'));
  assert.ok(profile.includes('width:min(360px,calc(100vw - 20px))'));
});

test('V94 mantiene responsive de planes en una columna y reserva espacio inferior',()=>{
  const workspace=fs.readFileSync('src/v38-phase2-workspace.js','utf8');
  assert.ok(workspace.includes('.v38-grid,.v38-fields{grid-template-columns:1fr}'));
  assert.ok(workspace.includes('padding-bottom:calc(170px + env(safe-area-inset-bottom,0px))'));
  assert.ok(workspace.includes('v94-plan-actions'));
});

test('V94 panel macro y detalle V91 muestran absolutos mas porcentaje',()=>{
  const v91=fs.readFileSync('src/v91-plans-coverage.js','utf8');
  const dashboard=fs.readFileSync('src/v93-curricular-coverage-dashboard.js','utf8');
  for(const needle of ['Number(result.used||0)','Number(result.total)','x.used','x.total','x.percent'])assert.ok(v91.includes(needle),needle);
  for(const needle of ['Number(r.used||0)','Number(r.total)','x.used','x.total','x.percent'])assert.ok(dashboard.includes(needle),needle);
});
