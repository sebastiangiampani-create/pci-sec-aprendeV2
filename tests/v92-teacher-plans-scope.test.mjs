import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

test('V92 carga Planes por docente despues de las coberturas V91',()=>{
  const app=fs.readFileSync('app.html','utf8');
  const core=app.indexOf('src/v91-coverage-core.js');
  const plans=app.indexOf('src/v91-plans-coverage.js');
  const teacherPlans=app.indexOf('src/v92-teacher-plans.js');
  assert.ok(core>=0);
  assert.ok(plans>core);
  assert.ok(teacherPlans>plans);
});

test('V92 Gestion expone solamente las cuatro tarjetas requeridas',()=>{
  const source=fs.readFileSync('src/v73-management-home.js','utf8');
  for(const key of ["key:'docentes'","key:'asignaciones'","key:'planes'","key:'excel'"]){
    assert.ok(source.includes(key),key);
  }
  assert.equal((source.match(/\{key:'/g)||[]).length,4);
  for(const forbidden of ["key:'comisiones'","key:'respaldo'","key:'horarios'","key:'asistencia'","key:'calificaciones'","key:'boletines'","key:'regularidad'"]){
    assert.equal(source.includes(forbidden),false,forbidden);
  }
});

test('V92 deja estudiantes/comisiones fuera del recorrido visual sin borrar la dependencia interna',()=>{
  const app=fs.readFileSync('app.html','utf8');
  const management=fs.readFileSync('src/v73-management-home.js','utf8');
  const home=fs.readFileSync('src/v74-home-redesign.js','utf8');
  assert.ok(app.includes('src/v72-students-commissions.js'));
  assert.equal(management.includes("key:'comisiones'"),false);
  assert.equal(home.includes('cursos y estudiantes'),false);
  assert.match(home,/Docentes, cargos, asignaciones y planes por docente/);
});

test('V92 Planes por docente usa assignments, placements y las APIs de cobertura V91',()=>{
  const source=fs.readFileSync('src/v92-teacher-plans.js','utf8');
  for(const needle of [
    'allImplementationRows','root().assignments','map.placements','PCIPhase2V28',
    'PCICoverageV91','PCIPlansCoverageV91','formatCoverage','coverageForIds','allPlans',
    'Cobertura del formato','plans:plans.map'
  ]) assert.ok(source.includes(needle),needle);
  assert.equal(source.includes('visiblePlanNumbers'),false,'Gestion debe mostrar los cuatro planes');
});

test('V92 resuelve assignment real a espacio integrado y conserva los cuatro planes',()=>{
  const source=fs.readFileSync('src/v92-teacher-plans.js','utf8');
  const group={
    id:'socialA-c1',
    year:1,
    term:'1',
    area:'Ciencias Sociales',
    subjectIds:['hist1','geo1','fec1'],
    data:{name:'Laboratorio de Ciencias Sociales · C1',contents:['h1','g1','f1']}
  };
  const document={
    getElementById(){return null;},
    createElement(){return {textContent:'',appendChild(){},className:'',id:''};},
    head:{appendChild(){}}
  };
  const state={
    active:'Otra',
    institutional:{
      teachers:{t1:{id:'t1',name:'Docente Uno',email:'docente@escuela.edu.ar'}},
      assignments:{'sociales|1A|hist1':'t1'}
    },
    maps:{
      Sociales:{placements:{'socialA-c1':['hist1','geo1','fec1']}}
    }
  };
  const window={
    addEventListener(){},
    PCIInstitutionalV48:{
      allImplementationRows(){
        return [
          {instanceId:'sociales|1A|hist1',orientation:'Sociales',subjectId:'hist1',year:1,course:'1.º A',division:'A',name:'Historia'},
          {instanceId:'sociales|1A|geo1',orientation:'Sociales',subjectId:'geo1',year:1,course:'1.º A',division:'A',name:'Geografía'}
        ];
      }
    },
    PCIPhase2V28:{
      gb(slot){return slot==='socialA-c1'?group:null;},
      members(){return [{name:'Historia'},{name:'Geografía'},{name:'Formación Ética y Ciudadana'}];}
    },
    PCICoverageV91:{
      formatCoverage(){return {year:1,total:24,used:10,percent:41.7,bySubject:[
        {subject:'Historia',total:10,used:4,percent:40},
        {subject:'Geografía',total:8,used:4,percent:50},
        {subject:'Formación Ética y Ciudadana',total:6,used:2,percent:33.3}
      ]};},
      coverageForIds(_group,ids){return {year:1,total:24,used:ids.length,percent:ids.length/24*100,bySubject:[]};}
    },
    PCIPlansCoverageV91:{
      allPlans(){return [1,2,3,4].map(number=>({number,name:`Plan ${number}`,contents:[`p${number}`]}));},
      visiblePlanNumbers(){return [1,2];}
    }
  };
  const context={
    console,document,window,state,
    setTimeout(){return 0;},
    clearTimeout(){},
    requestAnimationFrame(fn){fn();},
    Map,Set
  };
  vm.runInNewContext(source,context,{filename:'src/v92-teacher-plans.js'});
  const spaces=window.PCITeacherPlansV92.teacherSpaces('t1');
  assert.equal(spaces.length,1);
  assert.equal(spaces[0].orientation,'Sociales');
  assert.equal(spaces[0].year,1);
  assert.equal(spaces[0].name,'Laboratorio de Ciencias Sociales · C1');
  assert.deepEqual([...spaces[0].subjects],['Formación Ética y Ciudadana','Geografía','Historia']);
  assert.deepEqual([...spaces[0].courses],['1.º A']);
  assert.equal(spaces[0].format.total,24);
  assert.equal(spaces[0].format.used,10);
  assert.equal(spaces[0].plans.length,4);
  assert.deepEqual([...spaces[0].plans.map(x=>x.number)],[1,2,3,4]);
  assert.equal(state.active,'Otra','teacherSpaces debe restaurar la orientación activa');
});

test('V92 mantiene Mapa, Desarrollo Curricular y permisos V91 sin reescribirlos',()=>{
  const app=fs.readFileSync('app.html','utf8');
  const phase=fs.readFileSync('src/v47-phase2-matrix.js','utf8');
  const access=fs.readFileSync('src/v80-access-control.js','utf8');
  for(const protectedModule of ['src/v47-phase2-matrix.js','src/v59-phase2-annual-matrix.js','src/v48-institutional-layer.js']){
    assert.ok(app.includes(protectedModule),protectedModule);
  }
  assert.ok(phase.includes('canEditGroup'));
  assert.ok(phase.includes('editableSubjectsByOrientation'));
  assert.ok(access.includes('teacherEditSubjectsByOrientation'));
  assert.ok(access.includes('editableSubjectsByOrientation'));
});
