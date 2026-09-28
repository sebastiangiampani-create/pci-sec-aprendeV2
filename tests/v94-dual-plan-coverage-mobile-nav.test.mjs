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

test('V97 laboratorio mide cada materia contra anual y contra agrupamiento',()=>{
  const api=loadPlanCoverage();
  const group={type:'laboratorio',year:1};
  const plan={contentIds:['h1','g1']};
  const result=api.planCoverage(group,plan.contentIds);
  assert.equal(result.dual,true);
  assert.equal(result.rows.length,3);
  const historia=result.rows.find(x=>x.label==='Historia');
  assert.deepEqual(
    [historia.planUsed,historia.annualTotal,historia.groupingTotal],
    [1,20,8]
  );
  const html=api.planCoverageSummary(group,plan,true);
  assert.match(html,/Cobertura por materia/);
  assert.match(html,/Dentro del agrupamiento/);
  assert.match(html,/Historia/);
  assert.match(html,/1\/20 · 5%/);
  assert.match(html,/1\/8 · 12\.5%/);
});

test('V97 taller tiene doble referencia y troncal solo referencia anual',()=>{
  const api=loadPlanCoverage();
  assert.equal(api.dualSpace({type:'taller'}),true);
  assert.equal(api.dualSpace({type:'laboratorio'}),true);
  assert.equal(api.dualSpace({type:'troncal'}),false);
  const plan={contentIds:['h1','g1']};
  assert.match(api.planCoverageSummary({type:'taller',year:1},plan,true),/Dentro del agrupamiento/);
  assert.equal(api.planCoverageSummary({type:'troncal',year:1},plan,true).includes('Dentro del agrupamiento'),false);
});

test('V97 muestra cobertura por materia directamente en las tarjetas reales de planes',()=>{
  const source=fs.readFileSync('src/v38-phase2-workspace.js','utf8');
  for(const needle of [
    'planCoverageSummary(g,p,true)',
    'v95-coverage-table',
    'v95-coverage-line',
    'Cobertura por materia',
    'Del anual',
    'Dentro del agrupamiento',
    'La cobertura se lee materia por materia'
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

test('V101 evita que el perfil movil tape planes y dock integrandolo al flujo',()=>{
  const profile=fs.readFileSync('src/v85-access-panel.js','utf8');
  assert.ok(profile.includes('v101-session-host'));
  assert.ok(profile.includes('.v91-profile{position:relative'));
  assert.ok(profile.includes('.v101-session-host{padding:8px 10px 0;justify-content:stretch}'));
  assert.equal(profile.includes('bottom:calc(82px + env(safe-area-inset-bottom,0px))'),false);
});

test('V94 mantiene responsive de planes en una columna y reserva espacio inferior',()=>{
  const workspace=fs.readFileSync('src/v38-phase2-workspace.js','utf8');
  assert.ok(workspace.includes('.v38-grid,.v38-fields{grid-template-columns:1fr}'));
  assert.ok(workspace.includes('padding-bottom:calc(170px + env(safe-area-inset-bottom,0px))'));
  assert.ok(workspace.includes('v94-plan-actions'));
});

test('V97 panel y detalle muestran absolutos mas porcentaje por materia',()=>{
  const v91=fs.readFileSync('src/v91-plans-coverage.js','utf8');
  const dashboard=fs.readFileSync('src/v93-curricular-coverage-dashboard.js','utf8');
  for(const needle of ['Number(x.used||0)','Number(x.total||0)','Number(x.percent||0)','Materia'])assert.ok(v91.includes(needle),needle);
  for(const needle of ['Number(x.used||0)','Number(x.total||0)','Number(x.percent||0)','Cobertura anual por materia'])assert.ok(dashboard.includes(needle),needle);
});
