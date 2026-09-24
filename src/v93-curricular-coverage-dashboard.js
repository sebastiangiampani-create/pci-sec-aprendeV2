(() => {
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const phase=()=>window.PCIPhase2V28;
  const coverage=()=>window.PCICoverageV91;
  const typeLabel=t=>({troncal:'Troncal',laboratorio:'Laboratorios',taller:'Talleres',proyecto:'Proyecto',seminario:'Seminarios',asignatura:'Asignaturas'})[t]||'Formato';
  const pct=r=>Number.isFinite(Number(r?.percent))?Number(r.percent):null;

  function visibleGroups(){
    const p=phase();if(!p?.groups)return[];
    const groups=p.groups()||[];
    const scope=p.getAccessScope?.()||{role:'admin',allowedAreasByOrientation:{}};
    if(['admin','coordinator'].includes(scope.role))return groups;
    if(scope.role!=='teacher')return[];
    const allowed=new Set(scope.allowedAreasByOrientation?.[state.active]||[]);
    return groups.filter(g=>allowed.has(g.area));
  }

  function metric(label,result,detail=''){
    const value=pct(result);
    return `<article class="v93d-metric"><span>${esc(label)}</span><strong>${value==null?'—':value+'%'}</strong><small>${esc(detail)}</small>${value==null?'':`<div class="v93d-bar"><i style="width:${Math.min(100,value)}%"></i></div>`}</article>`;
  }

  function subjectRows(result){
    const rows=result?.bySubject||[];
    if(!rows.length)return'';
    return `<div class="v93d-breakdown">${rows.map(x=>`<div><span>${esc(x.subject)}</span><strong>${x.used}/${x.total} · ${x.percent}%</strong></div>`).join('')}</div>`;
  }

  function componentRows(result){
    const rows=result?.byComponent||[];
    if(!rows.length)return'';
    return `<div class="v93d-components">${rows.map(x=>`<section><header><div><small>${esc(x.kind||'Componente')}</small><strong>${esc(x.label)}</strong></div><b>${x.percent}%</b></header>${(x.axes||[]).length?`<div class="v93d-axes">${x.axes.map(a=>`<div><span>${esc(a.axis)}</span><strong>${a.used}/${a.total} · ${a.percent}%</strong></div>`).join('')}</div>`:''}</section>`).join('')}</div>`;
  }

  function groupName(g){return String(g?.data?.name||g?.name||'Espacio curricular')}
  function formatRows(rep,levelGroups,allGroups){
    const types=[...new Set(levelGroups.map(g=>g.type))];
    return types.map(type=>{
      const sample=levelGroups.find(g=>g.type===type);
      const result=coverage()?.formatTypeCoverage?.(sample,allGroups)||{};
      const spaces=levelGroups.filter(g=>g.type===type);
      return `<section class="v93d-format">
        <div class="v93d-format-head"><div><span>${esc(typeLabel(type))}</span><small>${spaces.length} espacio${spaces.length===1?'':'s'}</small></div><strong>${pct(result)==null?'—':pct(result)+'%'}</strong></div>
        <div class="v93d-space-list">${spaces.map(g=>{
          const r=coverage()?.formatCoverage?.(g)||{};
          return `<div><span>${esc(groupName(g))}</span><strong>${pct(r)==null?'—':pct(r)+'%'}</strong></div>`;
        }).join('')}</div>
      </section>`;
    }).join('');
  }

  function levelCard(area,year,areaGroups,allGroups){
    const levelGroups=areaGroups.filter(g=>Number(g.year)===Number(year));
    if(!levelGroups.length)return'';
    const rep=levelGroups[0];
    const result=coverage()?.groupingLevelCoverage?.(rep,allGroups)||{};
    const value=pct(result);
    const basis=result?.basis==='trajectory'&&result?.component==='FO'&&!result?.levelBasisAvailable
      ?'La fuente orientada todavía no permite fijar un 100% específico para este nivel.'
      :`Unión de todos los espacios de ${year}.º respecto del 100% prescripto del nivel.`;
    return `<article class="v93d-level">
      <header class="v93d-level-head"><div><span>Nivel ${year}</span><h4>${esc(area)}</h4><p>${esc(basis)}</p></div><strong>${value==null?'—':value+'%'}</strong></header>
      ${value==null?'':`<div class="v93d-bar large"><i style="width:${Math.min(100,value)}%"></i></div>`}
      ${subjectRows(result)}
      ${componentRows(result)}
      <div class="v93d-formats">${formatRows(rep,levelGroups,allGroups)}</div>
    </article>`;
  }

  function areaCard(area,allGroups){
    const groups=allGroups.filter(g=>g.area===area);
    const trajectory=coverage()?.trajectoryCoverage?.(area,allGroups)||{};
    const levels=[1,2,3,4,5].filter(y=>groups.some(g=>Number(g.year)===y));
    return `<section class="v93d-area">
      <header class="v93d-area-head"><div><span>Agrupamiento · trayectoria</span><h3>${esc(area)}</h3><p>Unión de contenidos utilizados en toda la trayectoria disponible.</p></div><strong>${pct(trajectory)==null?'—':pct(trajectory)+'%'}</strong></header>
      ${pct(trajectory)==null?'':`<div class="v93d-bar large"><i style="width:${Math.min(100,pct(trajectory))}%"></i></div>`}
      ${subjectRows(trajectory)}
      ${componentRows(trajectory)}
      <div class="v93d-levels">${levels.map(y=>levelCard(area,y,groups,allGroups)).join('')}</div>
    </section>`;
  }

  function ensure(){
    let root=$('v93CoverageDashboard');
    if(root)return root;
    root=document.createElement('div');
    root.id='v93CoverageDashboard';root.hidden=true;
    root.innerHTML=`
      <div class="v93d-backdrop" data-v93d-close></div>
      <section class="v93d-shell" role="dialog" aria-modal="true">
        <header class="v93d-head">
          <div><div class="v93d-eye">Desarrollo Curricular</div><h1>Panel de cobertura curricular</h1><p>Lectura de trayectoria, nivel, formato y espacios. Los porcentajes describen cobertura; no bloquean decisiones curriculares.</p></div>
          <button type="button" data-v93d-close aria-label="Cerrar">×</button>
        </header>
        <div id="v93dBody" class="v93d-body"></div>
      </section>`;
    document.body.appendChild(root);
    root.querySelectorAll('[data-v93d-close]').forEach(x=>x.addEventListener('click',close));
    return root;
  }

  async function render(){
    const body=$('v93dBody');if(!body)return;
    body.innerHTML='<div class="v93d-loading">Calculando coberturas…</div>';
    try{await coverage()?.ready?.()}catch(e){
      body.innerHTML=`<div class="v93d-loading">No se pudo cargar la base prescripta: ${esc(e?.message||e)}</div>`;return;
    }
    const groups=visibleGroups();
    const areas=[...new Set(groups.map(g=>g.area).filter(Boolean))];
    body.innerHTML=`
      <div class="v93d-context"><strong>${esc(state.school||'Escuela')}</strong><span>${esc(state.active||'PCI')}</span></div>
      <div class="v93d-rule"><strong>Regla de cálculo:</strong> dentro de cada nivel, el 100% prescripto permanece fijo. Cambia solamente el conjunto de contenidos que entra en el numerador.</div>
      ${areas.length?areas.map(a=>areaCard(a,groups)).join(''):'<div class="v93d-loading">No hay agrupamientos visibles para este perfil.</div>'}`;
  }

  async function open(){const root=ensure();root.hidden=false;document.body.classList.add('v93d-open');await render()}
  function close(){const root=$('v93CoverageDashboard');if(root)root.hidden=true;document.body.classList.remove('v93d-open')}

  function decorate(){
    const proposal=$('proposal');if(!proposal||!proposal.classList.contains('active'))return;
    proposal.querySelectorAll('#v28home .v28-hero,#v28board .v28-hero').forEach(hero=>{
      const row=hero.querySelector('.v28-row');if(!row||row.querySelector('[data-v93-dashboard]'))return;
      const b=document.createElement('button');b.type='button';b.className='v28-btn accent';b.dataset.v93Dashboard='1';b.textContent='Panel de cobertura curricular';b.addEventListener('click',open);row.appendChild(b);
    });
  }

  let observer=null,timer=null;
  function refresh(){clearTimeout(timer);timer=setTimeout(decorate,60)}
  function start(){ensure();decorate();const proposal=$('proposal');if(proposal&&!observer){observer=new MutationObserver(refresh);observer.observe(proposal,{childList:true,subtree:true})}}

  const style=document.createElement('style');
  style.textContent=`
    body.v93d-open{overflow:hidden}#v93CoverageDashboard[hidden]{display:none!important}#v93CoverageDashboard{position:fixed;inset:0;z-index:100000;color:#12395c;font-family:inherit}
    .v93d-backdrop{position:absolute;inset:0;background:rgba(15,37,54,.56)}.v93d-shell{position:absolute;inset:3vh 3vw;background:#fff;border-radius:22px;box-shadow:0 30px 90px rgba(0,0,0,.28);display:flex;flex-direction:column;overflow:hidden}
    .v93d-head{display:flex;justify-content:space-between;gap:20px;align-items:flex-start;padding:22px 24px;background:#edf3f8;border-bottom:1px solid #d8e1e8}.v93d-eye{color:#126e65;font-size:.72rem;font-weight:900;letter-spacing:.09em;text-transform:uppercase}.v93d-head h1{margin:3px 0 6px;font-size:clamp(1.55rem,3vw,2.35rem)}.v93d-head p{margin:0;color:#5f7382;max-width:920px}.v93d-head button{border:0;background:#fff;border-radius:999px;width:42px;height:42px;font-size:1.7rem;color:#12395c}
    .v93d-body{padding:18px 22px 28px;overflow:auto}.v93d-context{display:flex;justify-content:space-between;gap:12px;margin-bottom:10px;padding:11px 14px;border-radius:13px;background:#f6f9fb}.v93d-context span{color:#5f7382}.v93d-rule{padding:11px 14px;margin-bottom:14px;border-radius:13px;background:#fff5dc;color:#77580f;font-size:.72rem}
    .v93d-area{display:grid;gap:12px;padding:16px;margin-bottom:16px;border:1px solid #d8e1e8;border-radius:20px;background:#fff;box-shadow:0 8px 22px rgba(18,57,92,.05)}.v93d-area-head,.v93d-level-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}.v93d-area-head span,.v93d-level-head span{color:#126e65;font-size:.55rem;font-weight:900;text-transform:uppercase;letter-spacing:.06em}.v93d-area-head h3,.v93d-level-head h4{margin:3px 0 3px}.v93d-area-head p,.v93d-level-head p{margin:0;color:#5f7382;font-size:.58rem}.v93d-area-head>strong,.v93d-level-head>strong{font-size:1.45rem;color:#126e65}
    .v93d-bar{height:5px;border-radius:999px;background:#dce7e8;overflow:hidden}.v93d-bar.large{height:8px}.v93d-bar i{display:block;height:100%;background:#126e65}.v93d-breakdown{display:flex;gap:6px;flex-wrap:wrap}.v93d-breakdown>div{display:flex;gap:6px;padding:5px 7px;border:1px solid #d8e1e8;border-radius:999px;font-size:.52rem}.v93d-breakdown span{color:#5f7382}
    .v93d-levels{display:grid;gap:10px}.v93d-level{padding:13px;border:1px solid #e1e7eb;border-radius:15px;background:#f9fbfc}.v93d-formats{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:7px;margin-top:10px}.v93d-format{padding:9px;border:1px solid #dce4e8;border-radius:11px;background:#fff}.v93d-format-head{display:flex;justify-content:space-between;gap:8px}.v93d-format-head span,.v93d-format-head small{display:block}.v93d-format-head span{font-size:.58rem;font-weight:900}.v93d-format-head small{margin-top:2px;color:#5f7382;font-size:.48rem}.v93d-format-head>strong{color:#126e65;font-size:.78rem}.v93d-space-list{display:grid;gap:4px;margin-top:7px}.v93d-space-list>div{display:flex;justify-content:space-between;gap:8px;font-size:.5rem;color:#5f7382}.v93d-space-list strong{color:#12395c}
    .v93d-components{display:grid;gap:6px}.v93d-components section{padding:8px;border:1px solid #d7e8e4;border-radius:10px;background:#fff}.v93d-components header{display:flex;justify-content:space-between;gap:8px}.v93d-components small,.v93d-components strong{display:block}.v93d-components small{color:#126e65;font-size:.46rem;text-transform:uppercase;font-weight:900}.v93d-components header strong{font-size:.58rem}.v93d-components b{color:#126e65;font-size:.7rem}.v93d-axes{display:grid;gap:3px;margin-top:5px;padding-left:8px;border-left:2px solid #dceceb}.v93d-axes div{display:flex;justify-content:space-between;gap:8px;font-size:.48rem}.v93d-axes span{color:#5f7382}
    .v93d-loading{padding:30px;text-align:center;color:#5f7382}@media(max-width:700px){.v93d-shell{inset:1.5vh 2vw}.v93d-head{padding:16px}.v93d-body{padding:12px}.v93d-area-head,.v93d-level-head{flex-direction:column}.v93d-formats{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);
  window.addEventListener('pci-phase2-groups-rendered',refresh);
  window.addEventListener('pci-app-ready',()=>setTimeout(start,1400));
  setTimeout(start,2200);
  window.PCICoverageDashboardV93={open,close,render,visibleGroups};
})();
