(() => {
  const phase=()=>window.PCIPhase2V28;
  const coverage=()=>window.PCICoverageV91;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pct=result=>result?.percent===null||result?.percent===undefined?null:(Number.isFinite(Number(result.percent))?Number(result.percent):null);
  const metric=result=>Number(result?.total)?`${Number(result.used||0)}/${Number(result.total)} · ${pct(result)}%`:pct(result)==null?'—':String(pct(result))+'%';

  function allPlans(group){
    group.data.v91Plans=Array.isArray(group.data.v91Plans)?group.data.v91Plans:[];
    const existing=new Map(group.data.v91Plans.map(p=>[Number(p.number),p]));
    const validContents=new Set(group.data.contents||[]);
    const plans=[1,2,3,4].map(n=>{
      const p=existing.get(n)||{number:n,name:`Plan ${n}`,objectives:'',criteria:'',contents:[]};
      p.number=n;
      p.name=String(p.name||`Plan ${n}`);
      p.objectives=String(p.objectives||'');
      p.criteria=String(p.criteria||'');
      p.contents=[...new Set((p.contents||[]).filter(id=>validContents.has(id)))];
      return p;
    });
    group.data.v91Plans=plans;
    return plans;
  }

  function visiblePlanNumbers(group){
    const term=String(group.term||'');
    if(term.includes('-'))return [1,2,3,4];
    const c=Number(term)||0;
    return c%2===1?[1,2]:[3,4];
  }

  function formatLabel(group){
    const labels={troncal:'Troncal',laboratorio:'Laboratorios',taller:'Talleres',proyecto:'Proyecto',seminario:'Seminarios',asignatura:'Asignaturas'};
    return labels[group?.type]||'Formato curricular';
  }

  function progress(result){
    const value=pct(result);
    return value==null?'':`<div class="v91-bar v91-main"><span style="width:${Math.min(100,value)}%"></span></div>`;
  }

  function subjectBars(result){
    const rows=result?.bySubject||[];
    if(!rows.length)return '';
    return `<div class="v91-subjects">${rows.map(x=>`
      <div class="v91-subject">
        <div><strong>${esc(x.subject)}</strong><span>${x.used}/${x.total} · ${x.percent}%</span></div>
        <div class="v91-bar"><span style="width:${Math.min(100,x.percent)}%"></span></div>
      </div>`).join('')}</div>`;
  }

  function componentBars(result){
    const rows=result?.byComponent||[];
    if(!rows.length)return '';
    return `<div class="v93-components">${rows.map(x=>`
      <section class="v93-component">
        <div class="v93-component-head"><div><small>${esc(x.kind||'Componente')}</small><strong>${esc(x.label)}</strong></div><b>${x.used}/${x.total} · ${x.percent}%</b></div>
        <div class="v91-bar"><span style="width:${Math.min(100,x.percent)}%"></span></div>
        ${(x.axes||[]).length?`<div class="v93-axes">${x.axes.map(a=>`<div><span>${esc(a.axis)}</span><strong>${a.used}/${a.total} · ${a.percent}%</strong></div>`).join('')}</div>`:''}
      </section>`).join('')}</div>`;
  }

  function resultMeta(result){
    if(result?.basis==='trajectory'&&result?.component==='FO'&&!result?.levelBasisAvailable){
      return result.trajectoryTotal?
        `${result.trajectoryUsed} de ${result.trajectoryTotal} contenidos de la trayectoria orientada`:
        'La fuente orientada todavía no informa un universo por nivel.';
    }
    return result?.total?`${result.used} de ${result.total} contenidos prescriptos de ${result.year}.º`:'Sin universo prescripto calculable.';
  }

  function summary(result,title,subtitle=''){
    const value=pct(result);
    return `<div class="v91-summary">
      <div class="v91-summary-head"><div><span>${esc(title)}</span><strong>${metric(result)}</strong></div><small>${esc(subtitle||resultMeta(result))}</small></div>
      ${progress(result)}
      ${result?.offLevel?`<div class="v91-offlevel">${result.offLevel} contenido${result.offLevel===1?'':'s'} de otro nivel utilizado${result.offLevel===1?'':'s'} · no suma${result.offLevel===1?'':'n'} al porcentaje.</div>`:''}
      ${subjectBars(result)}
      ${componentBars(result)}
    </div>`;
  }

  function contentRows(group,plan,editable){
    const ids=group.data.contents||[];
    if(!ids.length)return '<div class="v91-empty">Primero distribuí contenidos al espacio desde la bolsa curricular.</div>';
    return `<div class="v91-plan-contents">${ids.map(id=>{
      const c=phase()?.findContent?.(id);
      if(!c)return'';
      const checked=plan.contents.includes(id);
      return `<label class="v91-plan-content"><input type="checkbox" data-v91-content="${esc(id)}" ${checked?'checked':''} ${editable?'':'disabled'}><span><small>${esc(c.subject||c.component||'Contenido')}${c.axis?' · '+esc(c.axis):''}</small>${esc(c.text||'')}</span></label>`;
    }).join('')}</div>`;
  }

  function planCard(group,plan,editable){
    const result=coverage()?.coverageForIds?.(group,plan.contents)||{total:0,used:0,percent:null,year:group.year,bySubject:[],byComponent:[],offLevel:0};
    const value=pct(result);
    return `<article class="v91-plan-card" data-v91-plan="${plan.number}">
      <div class="v91-plan-head">
        <div><span>Plan ${plan.number} · Nivel ${group.year}</span><input data-v91-field="name" value="${esc(plan.name)}" ${editable?'':'disabled'}></div>
        <strong>${metric(result)}</strong>
      </div>
      <div class="v93-plan-basis">Cobertura del plan respecto del 100% prescripto del nivel.</div>
      <label class="v91-field"><span>Objetivos del plan</span><textarea data-v91-field="objectives" ${editable?'':'disabled'}>${esc(plan.objectives)}</textarea></label>
      <label class="v91-field"><span>Criterios colegiados de evaluación</span><textarea data-v91-field="criteria" placeholder="Un criterio por línea" ${editable?'':'disabled'}>${esc(plan.criteria)}</textarea></label>
      <div class="v91-plan-section"><strong>Contenidos del plan</strong><span>${plan.contents.length} seleccionados</span></div>
      ${contentRows(group,plan,editable)}
      ${summary(result,`Cobertura Plan ${plan.number}`)}
    </article>`;
  }

  function miniMetric(label,result,detail=''){
    const value=pct(result);
    return `<article class="v93-metric"><span>${esc(label)}</span><strong>${metric(result)}</strong><small>${esc(detail||resultMeta(result))}</small>${progress(result)}</article>`;
  }

  function decorateGroup(card,group){
    if(!card||!group)return;
    card.querySelector('.v91-plans-block')?.remove();

    card.querySelectorAll('.v28-field').forEach(label=>{
      const title=label.querySelector(':scope > span')?.textContent||'';
      if(/^Planes \/ proyectos/i.test(title))label.style.display='none';
    });

    const c=coverage(),allGroups=phase()?.groups?.()||[];
    const editable=!!phase()?.canEditGroup?.(group);
    const plans=allPlans(group);
    const nums=visiblePlanNumbers(group);
    const trajectory=c?.trajectoryCoverage?.(group.area,allGroups)||{total:0,used:0,percent:null};
    const level=c?.groupingLevelCoverage?.(group,allGroups)||{total:0,used:0,percent:null};
    const formatType=c?.formatTypeCoverage?.(group,allGroups)||{total:0,used:0,percent:null};
    const space=c?.formatCoverage?.(group)||{total:0,used:0,percent:null,year:group.year,bySubject:[],byComponent:[],offLevel:0};

    const block=document.createElement('section');
    block.className='v91-plans-block';
    block.innerHTML=`
      <div class="v93-coverage-head">
        <div><span>Cobertura curricular</span><h4>${esc(group.data?.name||group.name||'Espacio curricular')}</h4><p>Primero se distribuyen contenidos en el espacio; después esos contenidos se organizan dentro de los planes.</p></div>
      </div>
      <div class="v93-metrics">
        ${miniMetric('Agrupamiento · trayectoria',trajectory,'Unión de contenidos utilizados en 1.º–5.º.')}
        ${miniMetric('Agrupamiento · nivel '+group.year,level,'Unión de todos los espacios del agrupamiento en este nivel.')}
        ${miniMetric(formatLabel(group)+' · nivel '+group.year,formatType,'Unión de todos los espacios de este formato en el nivel.')}
        ${miniMetric('Este espacio',space,'Contenidos ubicados en este espacio respecto del mismo 100% del nivel.')}
      </div>
      <div class="v91-format">
        <div class="v91-title"><div><span>Distribución interna del espacio</span><h4>${esc(formatLabel(group))} · Nivel ${group.year}</h4></div><b>${metric(space)}</b></div>
        ${summary(space,'Cobertura del espacio')}
      </div>
      <div class="v91-plans-title"><div><span>Planes del espacio</span><h4>Distribución de los contenidos ya asignados</h4></div><small>${nums.length===4?'Formato anual · Planes 1–4':nums[0]===1?'Primer cuatrimestre · Planes 1 y 2':'Segundo cuatrimestre · Planes 3 y 4'}</small></div>
      <div class="v91-plans-grid">${plans.filter(p=>nums.includes(p.number)).map(p=>planCard(group,p,editable)).join('')}</div>
    `;
    card.appendChild(block);

    block.querySelectorAll('[data-v91-plan]').forEach(planEl=>{
      const n=Number(planEl.dataset.v91Plan),plan=plans.find(p=>p.number===n);if(!plan)return;
      planEl.querySelectorAll('[data-v91-field]').forEach(el=>{
        const saveValue=()=>{if(!editable)return;plan[el.dataset.v91Field]=el.value;phase()?.save?.()};
        el.addEventListener('change',saveValue);el.addEventListener('blur',saveValue);
      });
      planEl.querySelectorAll('[data-v91-content]').forEach(cb=>cb.addEventListener('change',()=>{
        if(!editable)return;
        const id=cb.dataset.v91Content;
        if(cb.checked&&!plan.contents.includes(id))plan.contents.push(id);
        if(!cb.checked)plan.contents=plan.contents.filter(x=>x!==id);
        phase()?.save?.();
        decorateGroup(card,group);
      }));
    });
  }

  async function decorate(){
    const p=phase(),c=coverage();if(!p||!c)return;
    try{await c.ready()}catch(e){console.error('[V93 plans coverage]',e);return}
    document.querySelector('#v28board > .v28-coverage')?.setAttribute('hidden','hidden');
    document.querySelectorAll('#v28groups [data-g]').forEach(card=>{
      const group=p.gb?.(card.dataset.g);
      if(group)decorateGroup(card,group);
    });
  }

  const style=document.createElement('style');
  style.textContent=`
    .v91-plans-block{margin-top:16px;padding-top:16px;border-top:2px solid #edf3f8;display:grid;gap:16px}
    .v93-coverage-head{padding:14px 16px;border:1px solid #d8e1e8;border-radius:16px;background:#f8fbfd}.v93-coverage-head span{color:#126e65;font-size:.62rem;font-weight:900;text-transform:uppercase;letter-spacing:.06em}.v93-coverage-head h4{margin:3px 0 4px;font-size:1rem}.v93-coverage-head p{margin:0;color:#5f7382;font-size:.64rem}
    .v93-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.v93-metric{padding:11px;border:1px solid #d8e1e8;border-radius:14px;background:#fff}.v93-metric>span{display:block;color:#5f7382;font-size:.54rem;font-weight:850}.v93-metric>strong{display:block;margin:4px 0 2px;color:#126e65;font-size:1.2rem}.v93-metric>small{display:block;min-height:30px;color:#6b7d89;font-size:.49rem;line-height:1.35}
    .v91-format{padding:14px;border:1px solid #d8e1e8;border-radius:16px;background:#f8fbfd}
    .v91-title,.v91-plans-title,.v91-plan-head,.v91-plan-section{display:flex;align-items:center;justify-content:space-between;gap:12px}
    .v91-title span,.v91-plans-title span,.v91-plan-head span{display:block;color:#126e65;font-size:.62rem;font-weight:900;text-transform:uppercase;letter-spacing:.06em}
    .v91-title h4,.v91-plans-title h4{margin:3px 0 0;font-size:.9rem}.v91-title b{font-size:1.45rem}.v91-plans-title small{color:#5f7382;font-weight:750}
    .v91-plans-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.v91-plan-card{padding:14px;border:1px solid #d8e1e8;border-radius:16px;background:#fff}
    .v91-plan-head input{width:100%;margin-top:5px;padding:8px 9px;border:1px solid #d8e1e8;border-radius:10px;font-weight:850;color:#12395c}.v91-plan-head>div{flex:1}.v91-plan-head>strong{font-size:1.2rem;color:#126e65}.v93-plan-basis{margin:7px 0;padding:6px 8px;border-radius:8px;background:#edf7f5;color:#126e65;font-size:.55rem;font-weight:750}
    .v91-field{display:block;margin-top:10px}.v91-field>span{display:block;margin-bottom:4px;color:#3a5d7e;font-size:.68rem;font-weight:850}.v91-field textarea{width:100%;min-height:66px;padding:9px;border:1px solid #d8e1e8;border-radius:10px;resize:vertical;color:#12395c;background:#fff}
    .v91-plan-section{margin-top:12px;font-size:.68rem}.v91-plan-section span{color:#5f7382}.v91-plan-contents{display:grid;gap:6px;margin-top:7px;max-height:230px;overflow:auto}.v91-plan-content{display:grid;grid-template-columns:18px 1fr;gap:8px;align-items:start;padding:8px;border:1px solid #e2e8ed;border-radius:10px;background:#f9fbfc;font-size:.7rem;line-height:1.35}.v91-plan-content input{width:16px;height:16px;margin-top:2px}.v91-plan-content small{display:block;color:#5f7382;margin-bottom:2px}
    .v91-summary{margin-top:12px;padding:10px;border-radius:12px;background:#edf7f5}.v91-summary-head>div{display:flex;justify-content:space-between;gap:10px;align-items:center}.v91-summary-head span{font-size:.66rem;font-weight:850}.v91-summary-head strong{font-size:1rem;color:#126e65}.v91-summary-head small{display:block;margin-top:2px;color:#5f7382;font-size:.6rem}
    .v91-bar{height:6px;border-radius:999px;background:#dce7e8;overflow:hidden}.v91-bar span{display:block;height:100%;background:#126e65}.v91-main{margin:7px 0}.v91-subjects{display:grid;gap:6px;margin-top:8px}.v91-subject>div:first-child{display:flex;justify-content:space-between;gap:8px;font-size:.59rem}.v91-subject>div:first-child span{color:#5f7382}.v91-subject .v91-bar{margin-top:3px;height:4px}
    .v93-components{display:grid;gap:7px;margin-top:9px}.v93-component{padding:8px;border:1px solid #d7e8e4;border-radius:10px;background:#fff}.v93-component-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.v93-component-head small,.v93-component-head strong{display:block}.v93-component-head small{color:#126e65;font-size:.48rem;text-transform:uppercase;font-weight:900}.v93-component-head strong{margin-top:2px;font-size:.61rem}.v93-component-head b{font-size:.72rem;color:#126e65}.v93-axes{display:grid;gap:3px;margin-top:6px;padding-left:8px;border-left:2px solid #dceceb}.v93-axes div{display:flex;justify-content:space-between;gap:8px;font-size:.5rem}.v93-axes span{color:#5f7382}
    .v91-offlevel{margin-top:7px;padding:6px 8px;border-radius:8px;background:#fff5dc;color:#805700;font-size:.58rem;font-weight:750}.v91-empty{padding:8px;color:#5f7382;font-size:.62rem}
    @media(max-width:980px){.v93-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:820px){.v91-plans-grid{grid-template-columns:1fr}.v91-title,.v91-plans-title{align-items:flex-start}.v91-plans-title{flex-direction:column}}@media(max-width:560px){.v93-metrics{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  window.PCIPlansCoverageV91={decorate,allPlans,visiblePlanNumbers};
  window.addEventListener('pci-phase2-groups-rendered',()=>setTimeout(decorate,0));
  window.addEventListener('pci-app-ready',()=>setTimeout(decorate,1200));
})();
