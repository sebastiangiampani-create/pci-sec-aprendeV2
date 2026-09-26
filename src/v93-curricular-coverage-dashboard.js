(() => {
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const phase=()=>window.PCIPhase2V28;
  const coverage=()=>window.PCICoverageV91;
  const typeLabel=t=>({troncal:'Troncal',laboratorio:'Laboratorio',taller:'Taller',proyecto:'Proyecto',seminario:'Seminario',asignatura:'Asignatura'})[t]||'Espacio';
  const valueMetric=r=>Number(r?.total)?`${Number(r.used||0)}/${Number(r.total)} · ${Number(r.percent||0)}%`:'—';

  function visibleGroups(){
    const p=phase();if(!p?.groups)return[];
    const groups=p.groups()||[];
    const scope=p.getAccessScope?.()||{role:'admin',allowedAreasByOrientation:{}};
    if(['admin','coordinator'].includes(scope.role))return groups;
    if(scope.role!=='teacher')return[];
    const allowed=new Set(scope.allowedAreasByOrientation?.[state.active]||[]);
    return groups.filter(g=>allowed.has(g.area));
  }

  function subjectRows(result,compact=false){
    const rows=result?.bySubject||[];
    if(!rows.length)return'';
    return `<div class="v97d-subjects ${compact?'compact':''}">${rows.map(x=>`
      <div class="v97d-subject">
        <div><small>Materia</small><strong>${esc(x.subject)}</strong></div>
        <div class="v97d-value"><b>${Number(x.used||0)}/${Number(x.total||0)}</b><span>${Number(x.percent||0)}%</span></div>
        <div class="v97d-bar"><i style="width:${Math.min(100,Number(x.percent||0))}%"></i></div>
      </div>`).join('')}</div>`;
  }

  function componentRows(result,compact=false){
    if(result?.basis==='trajectory'&&result?.component==='FO'&&!result?.levelBasisAvailable){
      return '<div class="v97d-pending">La base orientada actual no informa todavía un universo anual por nivel. Esta cobertura se completará al reemplazar la base curricular.</div>';
    }
    const rows=result?.byComponent||[];
    if(!rows.length)return'';
    return `<div class="v97d-subjects ${compact?'compact':''}">${rows.map(x=>`
      <div class="v97d-subject">
        <div><small>${esc(x.kind||'Componente')}</small><strong>${esc(x.label)}</strong></div>
        <div class="v97d-value"><b>${Number(x.used||0)}/${Number(x.total||0)}</b><span>${Number(x.percent||0)}%</span></div>
        <div class="v97d-bar"><i style="width:${Math.min(100,Number(x.percent||0))}%"></i></div>
      </div>`).join('')}</div>`;
  }

  function groupName(g){return String(g?.data?.name||g?.name||'Espacio curricular')}

  function groupingCard(g){
    const r=coverage()?.formatCoverage?.(g)||{};
    const term=phase()?.termText?.(g)||String(g?.term||'');
    return `<article class="v97d-group">
      <header><div><span>${esc(typeLabel(g.type))}${term?' · '+esc(term):''}</span><h5>${esc(groupName(g))}</h5></div><em>Nivel ${esc(g.year)}</em></header>
      ${subjectRows(r,true)||componentRows(r,true)||'<div class="v97d-pending">Sin contenidos oficiales calculables.</div>'}
    </article>`;
  }

  function levelCard(area,year,areaGroups,allGroups){
    const levelGroups=areaGroups.filter(g=>Number(g.year)===Number(year));
    if(!levelGroups.length)return'';
    const rep=levelGroups[0];
    const result=coverage()?.groupingLevelCoverage?.(rep,allGroups)||{};
    return `<article class="v97d-level">
      <header class="v97d-level-head">
        <div><span>Cobertura anual por materia</span><h4>Nivel ${esc(year)}</h4><p>Unión de contenidos utilizados en los agrupamientos de este nivel. Cada contenido se cuenta una sola vez.</p></div>
      </header>
      ${subjectRows(result)||componentRows(result)||'<div class="v97d-pending">Sin cobertura calculable para este nivel.</div>'}
      <div class="v97d-group-title"><strong>Agrupamientos del nivel</strong><span>Cada uno se coteja contra el prescripto anual de las materias que lo conforman.</span></div>
      <div class="v97d-groups">${levelGroups.map(groupingCard).join('')}</div>
    </article>`;
  }

  function areaCard(area,allGroups){
    const groups=allGroups.filter(g=>g.area===area);
    const levels=[1,2,3,4,5].filter(y=>groups.some(g=>Number(g.year)===y));
    return `<section class="v97d-area">
      <header class="v97d-area-head"><div><span>Área / agrupamiento</span><h3>${esc(area)}</h3><p>La lectura se realiza por materia y por nivel; no se repite aquí el total general de la bolsa.</p></div></header>
      <div class="v97d-levels">${levels.map(y=>levelCard(area,y,groups,allGroups)).join('')}</div>
    </section>`;
  }

  function ensure(){
    let root=$('v93CoverageDashboard');
    if(root)return root;
    root=document.createElement('div');
    root.id='v93CoverageDashboard';root.hidden=true;
    root.innerHTML=`
      <div class="v97d-backdrop" data-v93d-close></div>
      <section class="v97d-shell" role="dialog" aria-modal="true">
        <header class="v97d-head">
          <div><div class="v97d-eye">Desarrollo Curricular</div><h1>Panel de cobertura curricular</h1><p>Cobertura anual por materia, nivel y agrupamiento construido en el Mapa de la Oferta.</p></div>
          <button type="button" data-v93d-close aria-label="Cerrar">×</button>
        </header>
        <div id="v93dBody" class="v97d-body"></div>
      </section>`;
    document.body.appendChild(root);
    root.querySelectorAll('[data-v93d-close]').forEach(x=>x.addEventListener('click',close));
    return root;
  }

  async function render(){
    const body=$('v93dBody');if(!body)return;
    body.innerHTML='<div class="v97d-loading">Calculando coberturas por materia…</div>';
    try{await coverage()?.ready?.()}catch(e){
      body.innerHTML=`<div class="v97d-loading">No se pudo cargar la base prescripta: ${esc(e?.message||e)}</div>`;return;
    }
    const groups=visibleGroups();
    const areas=[...new Set(groups.map(g=>g.area).filter(Boolean))];
    body.innerHTML=`
      <div class="v97d-context"><strong>${esc(state.school||'Escuela')}</strong><span>${esc(state.active||'PCI')}</span></div>
      <div class="v97d-rule"><strong>Cómo leerlo:</strong> el denominador es el total anual prescripto de cada materia para ese nivel. La conformación real de cada laboratorio, taller o troncal proviene del Mapa de la Oferta. Los contenidos repetidos se cuentan una sola vez.</div>
      ${areas.length?areas.map(a=>areaCard(a,groups)).join(''):'<div class="v97d-loading">No hay agrupamientos visibles para este perfil.</div>'}`;
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
    .v97d-backdrop{position:absolute;inset:0;background:rgba(15,37,54,.56)}.v97d-shell{position:absolute;inset:3vh 3vw;background:#fff;border-radius:22px;box-shadow:0 30px 90px rgba(0,0,0,.28);display:flex;flex-direction:column;overflow:hidden}
    .v97d-head{display:flex;justify-content:space-between;gap:20px;align-items:flex-start;padding:22px 24px;background:#edf3f8;border-bottom:1px solid #d8e1e8}.v97d-eye{color:#126e65;font-size:.72rem;font-weight:900;letter-spacing:.09em;text-transform:uppercase}.v97d-head h1{margin:3px 0 6px;font-size:clamp(1.55rem,3vw,2.35rem)}.v97d-head p{margin:0;color:#5f7382;max-width:920px}.v97d-head button{border:0;background:#fff;border-radius:999px;width:42px;height:42px;font-size:1.7rem;color:#12395c}
    .v97d-body{padding:18px 22px 28px;overflow:auto}.v97d-context{display:flex;justify-content:space-between;gap:12px;margin-bottom:10px;padding:11px 14px;border-radius:13px;background:#f6f9fb}.v97d-context span{color:#5f7382}.v97d-rule{padding:11px 14px;margin-bottom:14px;border-radius:13px;background:#fff5dc;color:#77580f;font-size:.72rem;line-height:1.45}
    .v97d-area{display:grid;gap:12px;padding:16px;margin-bottom:16px;border:1px solid #d8e1e8;border-radius:20px;background:#fff;box-shadow:0 8px 22px rgba(18,57,92,.05)}.v97d-area-head span,.v97d-level-head span{color:#126e65;font-size:.55rem;font-weight:900;text-transform:uppercase;letter-spacing:.06em}.v97d-area-head h3,.v97d-level-head h4{margin:3px 0}.v97d-area-head p,.v97d-level-head p{margin:0;color:#5f7382;font-size:.6rem;line-height:1.4}
    .v97d-levels{display:grid;gap:10px}.v97d-level{padding:13px;border:1px solid #e1e7eb;border-radius:15px;background:#f9fbfc}.v97d-level-head{margin-bottom:9px}
    .v97d-subjects{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:7px}.v97d-subjects.compact{grid-template-columns:1fr}
    .v97d-subject{display:grid;grid-template-columns:minmax(120px,1fr) auto;gap:5px 9px;align-items:center;padding:9px 10px;border:1px solid #d8e1e8;border-radius:11px;background:#fff}.v97d-subject small,.v97d-subject strong{display:block}.v97d-subject small{color:#126e65;font-size:.44rem;font-weight:900;text-transform:uppercase}.v97d-subject strong{margin-top:1px;font-size:.62rem}.v97d-value{display:flex;align-items:baseline;gap:5px;white-space:nowrap}.v97d-value b{font-size:.68rem}.v97d-value span{color:#126e65;font-size:.58rem;font-weight:900}.v97d-bar{grid-column:1/-1;height:4px;border-radius:999px;background:#dce7e8;overflow:hidden}.v97d-bar i{display:block;height:100%;background:#126e65}
    .v97d-group-title{display:flex;justify-content:space-between;gap:12px;align-items:baseline;margin:13px 0 7px;padding-top:10px;border-top:1px solid #e1e7eb}.v97d-group-title strong{font-size:.68rem}.v97d-group-title span{color:#5f7382;font-size:.53rem}
    .v97d-groups{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:7px}.v97d-group{padding:10px;border:1px solid #dce4e8;border-radius:12px;background:#fff}.v97d-group>header{display:flex;justify-content:space-between;gap:8px;align-items:flex-start;margin-bottom:7px}.v97d-group>header span{color:#126e65;font-size:.48rem;font-weight:900;text-transform:uppercase}.v97d-group h5{margin:2px 0 0;font-size:.67rem}.v97d-group em{font-style:normal;color:#5f7382;font-size:.5rem;font-weight:800;white-space:nowrap}
    .v97d-pending{padding:9px 10px;border:1px dashed #cbd8dc;border-radius:10px;background:#fff;color:#6b7f89;font-size:.6rem;line-height:1.4}.v97d-loading{padding:30px;text-align:center;color:#5f7382}
    @media(max-width:700px){.v97d-shell{inset:1.5vh 2vw}.v97d-head{padding:16px}.v97d-body{padding:12px}.v97d-group-title{align-items:flex-start;flex-direction:column}.v97d-subjects,.v97d-groups{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  window.addEventListener('pci-phase2-groups-rendered',refresh);
  window.addEventListener('pci-app-ready',()=>setTimeout(start,1400));
  setTimeout(start,2200);
  window.PCICoverageDashboardV93={open,close,render,visibleGroups,valueMetric};
})();
