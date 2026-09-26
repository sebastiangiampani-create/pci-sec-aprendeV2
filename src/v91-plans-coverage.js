(() => {
  const phase=()=>window.PCIPhase2V28;
  const coverage=()=>window.PCICoverageV91;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const metric=x=>Number(x?.total)?`${Number(x.used||0)}/${Number(x.total)} · ${Number(x.percent||0)}%`:'—';
  const isDual=g=>['laboratorio','taller'].includes(String(g?.type||'').toLowerCase());
  const typeLabel=g=>({
    troncal:'Troncal',
    laboratorio:'Laboratorio',
    taller:'Taller',
    proyecto:'Proyecto',
    seminario:'Seminario',
    asignatura:'Asignatura'
  })[String(g?.type||'').toLowerCase()]||'Espacio curricular';

  function hideLegacyPlanField(card){
    card.querySelectorAll('.v28-field').forEach(label=>{
      const title=label.querySelector(':scope > span')?.textContent||'';
      if(/^Planes \/ proyectos/i.test(title))label.style.display='none';
    });
  }

  function subjectRows(result){
    const rows=result?.bySubject||[];
    if(!rows.length)return'';
    return `<div class="v97-group-rows">${rows.map(x=>`
      <div class="v97-group-row">
        <div><small>Materia</small><strong>${esc(x.subject)}</strong></div>
        <div class="v97-group-value"><b>${Number(x.used||0)}/${Number(x.total||0)}</b><span>${Number(x.percent||0)}%</span></div>
        <div class="v97-group-bar"><i style="width:${Math.min(100,Number(x.percent||0))}%"></i></div>
      </div>`).join('')}</div>`;
  }

  function componentRows(result){
    if(result?.basis==='trajectory'&&result?.component==='FO'&&!result?.levelBasisAvailable){
      return '<div class="v97-group-pending">La base orientada actual todavía no permite calcular cobertura anual por nivel. Este bloque se completará con la base corregida.</div>';
    }
    const rows=result?.byComponent||[];
    if(!rows.length)return'';
    return `<div class="v97-group-rows">${rows.map(x=>`
      <div class="v97-group-row">
        <div><small>${esc(x.kind||'Componente')}</small><strong>${esc(x.label)}</strong></div>
        <div class="v97-group-value"><b>${Number(x.used||0)}/${Number(x.total||0)}</b><span>${Number(x.percent||0)}%</span></div>
        <div class="v97-group-bar"><i style="width:${Math.min(100,Number(x.percent||0))}%"></i></div>
      </div>`).join('')}</div>`;
  }

  function groupCoverageBlock(group,result){
    const dual=isDual(group);
    const term=phase()?.termText?.(group)||String(group?.term||'');
    const title=dual?'Cobertura del agrupamiento':'Cobertura anual del espacio';
    const helper=dual
      ?`Cada materia se coteja con su total anual prescripto de ${Number(group.year)||''}.º. Los contenidos repetidos no se vuelven a contar.`
      :`La materia se coteja con su total anual prescripto de ${Number(group.year)||''}.º. La cobertura acumulada usa contenidos únicos.`;

    return `<section class="v97-group-coverage">
      <header class="v97-group-head">
        <div><span>${esc(title)}</span><h4>${esc(typeLabel(group))} · Nivel ${esc(group.year)}${term?' · '+esc(term):''}</h4></div>
        <span class="v97-group-chip">${esc(dual?'Por materia':'Anual')}</span>
      </header>
      <p class="v97-group-help">${esc(helper)}</p>
      ${subjectRows(result)||componentRows(result)||'<div class="v97-group-pending">Todavía no hay contenidos oficiales calculables para este espacio.</div>'}
    </section>`;
  }

  function decorateGroup(card,group){
    if(!card||!group)return;
    card.querySelector('.v97-group-coverage')?.remove();
    card.querySelector('.v91-plans-block')?.remove();
    hideLegacyPlanField(card);

    const result=coverage()?.formatCoverage?.(group);
    if(!result)return;

    const host=document.createElement('div');
    host.innerHTML=groupCoverageBlock(group,result);
    const block=host.firstElementChild;
    const assigned=card.querySelector('.v28-assigned-wrap');
    if(assigned)assigned.insertAdjacentElement('afterend',block);
    else card.appendChild(block);
  }

  async function decorate(){
    const p=phase(),c=coverage();if(!p||!c)return;
    try{await c.ready()}catch(e){console.error('[V97 group coverage]',e);return}
    document.querySelectorAll('#v28groups [data-g]').forEach(card=>{
      const group=p.gb?.(card.dataset.g);
      if(group)decorateGroup(card,group);
    });
  }

  const style=document.createElement('style');
  style.textContent=`
    .v97-group-coverage{margin-top:12px;padding:12px;border:1px solid #d8e1e8;border-radius:14px;background:#f8fbfd}
    .v97-group-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}
    .v97-group-head>div>span{display:block;color:#126e65;font-size:.56rem;font-weight:900;text-transform:uppercase;letter-spacing:.06em}
    .v97-group-head h4{margin:3px 0 0;color:#12395c;font-size:.82rem}
    .v97-group-chip{display:inline-flex;flex:0 0 auto;padding:4px 7px;border-radius:999px;background:#e7f8f5;color:#126e65;font-size:.52rem;font-weight:900}
    .v97-group-help{margin:7px 0 9px;color:#5f7382;font-size:.58rem;line-height:1.4}
    .v97-group-rows{display:grid;gap:6px}
    .v97-group-row{display:grid;grid-template-columns:minmax(130px,1fr) auto;gap:5px 10px;align-items:center;padding:8px 9px;border:1px solid #e1e8ec;border-radius:10px;background:#fff}
    .v97-group-row>div:first-child small,.v97-group-row>div:first-child strong{display:block}
    .v97-group-row>div:first-child small{color:#126e65;font-size:.45rem;font-weight:900;text-transform:uppercase}
    .v97-group-row>div:first-child strong{margin-top:1px;color:#12395c;font-size:.62rem}
    .v97-group-value{display:flex;align-items:baseline;gap:5px;white-space:nowrap}.v97-group-value b{font-size:.67rem;color:#12395c}.v97-group-value span{font-size:.57rem;color:#126e65;font-weight:900}
    .v97-group-bar{grid-column:1/-1;height:4px;border-radius:999px;background:#dce7e8;overflow:hidden}.v97-group-bar i{display:block;height:100%;background:#126e65}
    .v97-group-pending{padding:9px 10px;border:1px dashed #cbd8dc;border-radius:10px;background:#fff;color:#6b7f89;font-size:.6rem;line-height:1.4}
    @media(max-width:560px){.v97-group-head{align-items:flex-start}.v97-group-row{grid-template-columns:1fr auto}.v97-group-help{font-size:.62rem}}
  `;
  document.head.appendChild(style);

  window.PCIPlansCoverageV91={decorate};
  window.addEventListener('pci-phase2-groups-rendered',()=>setTimeout(decorate,0));
  window.addEventListener('pci-app-ready',()=>setTimeout(decorate,1200));
})();
