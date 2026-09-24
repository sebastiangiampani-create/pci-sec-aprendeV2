(() => {
  const KEY='pci-v85-access-session';
  const AREAS=[
    'Lengua y Literatura','Matemática','Lenguas Adicionales','Ciencias Naturales',
    'Ciencias Sociales','Artes','Tecnologías','Educación Física',
    'Formación Orientada'
  ];
  let overlay=null,profileChip=null;

  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function institutional(){
    state.institutional=state.institutional||{};
    state.institutional.teachers=state.institutional.teachers||{};
    state.institutional.teacherProfiles=state.institutional.teacherProfiles||{};
    return state.institutional;
  }

  const cargoHours={TC:36,TP1:30,TP2:24,TP3:18,TP4:12};
  function cargoSummary(t={}){
    const cargos=Array.isArray(t.cargos)&&t.cargos.length?t.cargos:[{type:t.cargoType||'',manualHours:t.manualHours||0}];
    const labels=cargos.map(c=>{
      const type=String(c.type||'').trim();
      if(!type)return'';
      if(type==='POR_HORAS')return `${Number(c.manualHours)||0} HC`;
      return cargoHours[type]?`${type} · ${cargoHours[type]} HC`:type;
    }).filter(Boolean);
    return labels.join(' + ')||'Sin cargo informado';
  }
  function teachers(){
    const root=institutional();
    return Object.values(root.teachers||{}).map(t=>({
      id:String(t.id||''),
      name:String(t.name||t.fullName||t.nombre||t.email||t.id||'Docente'),
      email:String(t.email||root.teacherProfiles?.[t.id]?.email||''),
      cargos:Array.isArray(t.cargos)?t.cargos:[],
      cargoType:t.cargoType||'',
      manualHours:t.manualHours||0,
      cargoLabel:cargoSummary(t)
    })).filter(t=>t.id).sort((a,b)=>a.name.localeCompare(b.name,'es'));
  }

  function labelOf(profile){
    if(profile.role==='admin')return 'Equipo de conducción';
    if(profile.role==='coordinator')return 'Coordinador';
    if(profile.role==='teacher')return 'Docente';
    return 'Acceso';
  }

  function saveProfile(profile){
    try{sessionStorage.setItem(KEY,JSON.stringify(profile))}catch{}
  }

  function loadProfile(){
    try{return JSON.parse(sessionStorage.getItem(KEY)||'null')}catch{return null}
  }

  function clearProfile(){
    try{sessionStorage.removeItem(KEY)}catch{}
  }

  function applyProfile(profile,{persist=true}={}){
    const api=window.PCIAppAccessV80;
    if(!api)return false;
    if(profile.role==='admin'){
      api.setSession({role:'admin'});
    }else if(profile.role==='coordinator'){
      api.setSession({role:'coordinator',coordinatorOrientation:String(profile.coordinatorOrientation||''),coordinatorAreas:[...(profile.coordinatorAreas||[])]});
    }else if(profile.role==='teacher'){
      api.setSession({role:'teacher',teacherId:String(profile.teacherId||''),email:String(profile.email||'')});
    }else return false;
    if(persist)saveProfile(profile);
    document.body.classList.remove('v85-access-pending');
    overlay?.remove();overlay=null;
    renderChip(profile);
    return true;
  }

  function renderChip(profile){
    profileChip?.remove();
    const root=institutional();
    const teacher=profile.role==='teacher'?teachers().find(t=>t.id===String(profile.teacherId||'')):null;
    const displayName=teacher?.name||labelOf(profile);
    const initials=displayName.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]?.toUpperCase()).join('')||'U';
    const assigned=profile.role==='teacher'?Object.values(root.assignments||{}).filter(v=>String(v)===String(profile.teacherId||'')).length:0;
    const meta=profile.role==='teacher'
      ? `${teacher?.cargoLabel||'Sin cargo informado'} · ${assigned} asignación${assigned===1?'':'es'}`
      : profile.role==='coordinator'
        ? `${profile.coordinatorOrientation||'Orientación'} · ${(profile.coordinatorAreas||[]).join(', ')||'Sin áreas'}`
        : 'Acceso institucional completo';

    profileChip=document.createElement('div');
    profileChip.className='v91-profile';
    profileChip.innerHTML=`
      <button type="button" class="v91-profile-main" aria-expanded="false">
        <span class="v91-avatar">${esc(initials)}</span>
        <span class="v91-profile-copy"><small>${esc(labelOf(profile))}</small><strong>${esc(displayName)}</strong><em>${esc(meta)}</em></span>
        <span class="v91-profile-chevron">⌄</span>
      </button>
      <div class="v91-profile-menu" hidden>
        <div><small>Perfil actual</small><strong>${esc(labelOf(profile))}</strong><span>${esc(meta)}</span></div>
        <button type="button" data-v91-change>Salir / cambiar perfil</button>
      </div>`;
    const main=profileChip.querySelector('.v91-profile-main');
    const menu=profileChip.querySelector('.v91-profile-menu');
    main.onclick=()=>{
      const open=menu.hidden;
      menu.hidden=!open;
      main.setAttribute('aria-expanded',String(open));
    };
    profileChip.querySelector('[data-v91-change]').onclick=()=>{clearProfile();showPanel()};
    document.body.appendChild(profileChip);
  }

  function orientations(){
    return Array.isArray(state.selected)?state.selected.map(v=>String(v||'').trim()).filter(Boolean):[];
  }

  function coordinatorOrientationOptions(){
    const rows=orientations();
    if(!rows.length)return '<p class="v85-empty-note">Todavía no hay orientaciones definidas en la escuela.</p>';
    return rows.map(o=>`<button type="button" class="v85-orientation-card" data-v85-orientation="${esc(o)}"><span class="v85-role-number">Coordinador de orientación</span><strong>${esc(o)}</strong><small>Ver toda la escuela · editar su orientación</small></button>`).join('');
  }

  function coordinatorAreaOptions(){
    return AREAS.map(a=>`<label class="v85-check"><input type="checkbox" value="${esc(a)}"><span>${esc(a)}</span></label>`).join('');
  }

  function teacherOptions(){
    const rows=teachers();
    if(!rows.length)return '<option value="">Todavía no hay docentes cargados</option>';
    return '<option value="">Seleccionar docente</option>'+rows.map(t=>`<option value="${esc(t.id)}" data-email="${esc(t.email)}">${esc(t.name)} · ${esc(t.cargoLabel)}${t.email?' · '+esc(t.email):''}</option>`).join('');
  }

  function showPanel(){
    document.body.classList.add('v85-access-pending');
    profileChip?.remove();profileChip=null;
    overlay?.remove();

    overlay=document.createElement('div');
    overlay.id='v85AccessPanel';
    overlay.className='v85-overlay';
    overlay.innerHTML=`
      <main class="v85-shell" role="dialog" aria-modal="true" aria-labelledby="v85Title">
        <section class="v85-hero">
          <div class="access-brand-row"><img class="access-school-logo" src="assets/logo-escuela-maestros.svg" alt="Escuela de Maestros"><img class="access-ba-logo" src="assets/ba-logo.png" alt="BA · Gobierno de la Ciudad de Buenos Aires"></div>
          <p class="v85-eye">PCI Secundaria Aprende</p>
          <h1 id="v85Title">Acceso a la plataforma</h1>
          <p>Elegí el perfil con el que querés ingresar. Esta pantalla prepara la lógica de permisos del nuevo sistema sin modificar la estética curricular existente.</p>
        </section>

        <section class="v85-card-grid">
          <button class="v85-role-card" data-v85-role="admin">
            <span class="v85-role-number">01</span>
            <strong>Equipo de conducción</strong>
            <small>Ve y edita toda la propuesta curricular de la escuela.</small>
          </button>
          <button class="v85-role-card" data-v85-role="coordinator">
            <span class="v85-role-number">02</span>
            <strong>Coordinador</strong>
            <small>Ve todo y edita únicamente el área que tenga asignada.</small>
          </button>
          <button class="v85-role-card" data-v85-role="teacher">
            <span class="v85-role-number">03</span>
            <strong>Docente</strong>
            <small>Ve el área vinculada a sus asignaciones y opera sobre su ámbito docente.</small>
          </button>
        </section>

        <section id="v85Detail" class="v85-detail" hidden></section>

        <aside class="v85-warning">
          <strong>Acceso de prueba.</strong>
          La selección de perfil funciona localmente. La autenticación real por usuario/email y los permisos persistentes se conectarán al backend cuando armemos la base.
        </aside>
        <footer class="access-institutional-footer" aria-label="Identidad institucional"><img class="access-footer-school" src="assets/logo-escuela-maestros-blanco.svg" alt="Escuela de Maestros"><div class="access-footer-right"><strong>Ministerio de Educación</strong><span class="access-footer-sep"></span><img src="assets/ba-ciudad-footer.png" alt="Buenos Aires Ciudad"></div></footer>
        <div class="access-cc-footer"><a href="https://creativecommons.org/licenses/by-nc-nd/4.0/" target="_blank" rel="license noopener noreferrer"><img src="https://licensebuttons.net/l/by-nc-nd/4.0/88x31.png" alt="Creative Commons BY-NC-ND 4.0"></a><div><strong>© 2026 Sebastián Giampani</strong><span>Creative Commons BY-NC-ND 4.0 · Atribución · No Comercial · Sin Derivadas</span></div></div>
      </main>`;

    document.body.appendChild(overlay);
    overlay.querySelectorAll('[data-v85-role]').forEach(btn=>btn.onclick=()=>selectRole(btn.dataset.v85Role));
  }

  function selectRole(role){
    const detail=overlay?.querySelector('#v85Detail');if(!detail)return;
    overlay.querySelectorAll('[data-v85-role]').forEach(x=>x.classList.toggle('selected',x.dataset.v85Role===role));
    detail.hidden=false;

    if(role==='admin'){
      detail.innerHTML=`
        <div>
          <p class="v85-eye">Equipo de conducción</p>
          <h2>Acceso institucional completo</h2>
          <p>Este perfil mantiene control total sobre Mapa de la Oferta, Desarrollo Curricular y configuración institucional.</p>
        </div>
        <button class="v85-enter" id="v85EnterAdmin">Entrar</button>`;
      detail.querySelector('#v85EnterAdmin').onclick=()=>applyProfile({role:'admin'});
      return;
    }

    if(role==='coordinator'){
      detail.innerHTML=`
        <div class="v85-detail-copy">
          <p class="v85-eye">Coordinación</p>
          <h2>Coordinadores por orientación</h2>
          <p>La cantidad de accesos se genera a partir de las orientaciones definidas por la escuela. Elegí la orientación y luego el área o las áreas que ese coordinador puede editar.</p>
        </div>
        <div class="v85-orientation-grid">${coordinatorOrientationOptions()}</div>
        <div class="v85-coordinator-areas" id="v85CoordinatorAreas" hidden>
          <div class="v85-coordinator-scope">
            <p class="v85-eye">Ámbito de edición</p>
            <h3 id="v85CoordinatorTitle"></h3>
            <p>Puede ver toda la propuesta curricular de la escuela. Solo puede editar las áreas seleccionadas dentro de esta orientación.</p>
          </div>
          <div class="v85-area-grid">${coordinatorAreaOptions()}</div>
        </div>
        <button class="v85-enter" id="v85EnterCoordinator" disabled>Entrar como coordinador</button>`;
      let coordinatorOrientation='';
      const cards=[...detail.querySelectorAll('[data-v85-orientation]')];
      const checks=[...detail.querySelectorAll('.v85-coordinator-areas input[type="checkbox"]')];
      const areas=detail.querySelector('#v85CoordinatorAreas');
      const title=detail.querySelector('#v85CoordinatorTitle');
      const enter=detail.querySelector('#v85EnterCoordinator');
      const refresh=()=>enter.disabled=!coordinatorOrientation||!checks.some(x=>x.checked);
      cards.forEach(card=>card.onclick=()=>{
        coordinatorOrientation=card.dataset.v85Orientation||'';
        cards.forEach(x=>x.classList.toggle('selected',x===card));
        if(areas)areas.hidden=false;
        if(title)title.textContent='Coordinador · '+coordinatorOrientation;
        checks.forEach(x=>x.checked=false);
        refresh();
      });
      checks.forEach(x=>x.onchange=refresh);
      enter.onclick=()=>{
        const coordinatorAreas=checks.filter(x=>x.checked).map(x=>x.value);
        if(!coordinatorOrientation||!coordinatorAreas.length)return;
        applyProfile({role:'coordinator',coordinatorOrientation,coordinatorAreas});
      };
      return;
    }

    const rows=teachers();
    detail.innerHTML=`
      <div class="v85-detail-copy">
        <p class="v85-eye">Docente</p>
        <h2>Ingresar con una asignación existente</h2>
        <p>El perfil docente se vincula al docente cargado en Gestión y utiliza las asignaciones existentes para determinar el ámbito curricular.</p>
      </div>
      <label class="v85-select-wrap">
        <span>Docente</span>
        <select id="v85TeacherSelect">${teacherOptions()}</select>
      </label>
      ${rows.length?'':'<p class="v85-empty-note">Todavía no hay docentes cargados. Ingresá primero como Equipo de conducción y cargá Docentes/Asignaciones.</p>'}
      <button class="v85-enter" id="v85EnterTeacher" disabled>Entrar como docente</button>`;

    const select=detail.querySelector('#v85TeacherSelect');
    const enter=detail.querySelector('#v85EnterTeacher');
    select.onchange=()=>enter.disabled=!select.value;
    enter.onclick=()=>{
      const option=select.selectedOptions[0];
      const row=rows.find(t=>t.id===select.value);
      if(!row)return;
      applyProfile({role:'teacher',teacherId:row.id,email:row.email,name:row.name});
    };
  }

  function start(){
    const stored=loadProfile();
    if(stored&&applyProfile(stored,{persist:false}))return;
    showPanel();
  }

  const style=document.createElement('style');
  style.textContent=`
    body.v85-access-pending{overflow:hidden}
    .v85-overlay{position:fixed;inset:0;z-index:99999;overflow:auto;background:#edf3f8;padding:28px 18px;color:#12395c;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    .v85-shell{width:min(1080px,100%);margin:0 auto;background:#fff;border:1px solid #d8e1e8;border-radius:28px;box-shadow:0 24px 70px rgba(18,57,92,.14);overflow:hidden}
    .v85-hero{position:relative;padding:38px 38px 34px;background:linear-gradient(135deg,#edf3f8 0%,#f8fbfd 62%,#eef8f6 100%);overflow:hidden}
    .v85-hero:after{content:"";position:absolute;width:310px;height:310px;border-radius:50%;right:-120px;bottom:-175px;background:#dce6ea}
    .v85-hero>*{position:relative;z-index:1}.v85-hero h1{margin:4px 0 10px;font-size:clamp(2rem,4vw,3.5rem);letter-spacing:-.04em}.v85-hero p{max-width:820px;margin:0;color:#5f7382;line-height:1.55}
    .access-brand-row{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:0 0 18px}.access-school-logo{display:block;width:min(285px,66vw);height:54px;object-fit:contain;object-position:left center}.access-ba-logo{display:block;height:30px;width:auto}
    .v85-eye{margin:0 0 6px;color:#126e65;font-size:.72rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase}
    .access-institutional-footer{margin-top:22px;display:flex;align-items:center;justify-content:space-between;gap:22px;flex-wrap:wrap;padding:36px 30px;background:#0d3550;color:#fff}.access-footer-school{display:block;width:min(145px,42vw);height:auto}.access-footer-right{display:flex;align-items:center;gap:18px;margin-left:auto}.access-footer-right strong{font-size:1.02rem;font-weight:800;white-space:nowrap}.access-footer-sep{width:2px;height:38px;background:#fff;opacity:.9}.access-footer-right img{display:block;height:48px;width:auto}.access-cc-footer{display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;padding:13px 18px;border-top:1px solid #d8e1e8;background:#f8fafb;color:#12395c;font:600 11px/1.35 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;text-align:left}.access-cc-footer img{display:block;width:88px;height:31px;border:0}.access-cc-footer strong,.access-cc-footer span{display:block}.access-cc-footer span{margin-top:2px;font-weight:500;opacity:.78}
    .v85-card-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;padding:22px 22px 0}
    .v85-role-card{display:grid;gap:8px;min-height:168px;padding:20px;border:1px solid #d8e1e8;border-radius:20px;background:#fff;text-align:left;color:#12395c;box-shadow:0 10px 26px rgba(18,57,92,.05)}
    .v85-role-card:hover,.v85-role-card.selected{border-color:#126e65;box-shadow:0 14px 34px rgba(18,110,101,.12)}.v85-role-card.selected{background:#f4fbf9}
    .v85-role-card strong{font-size:1rem}.v85-role-card small{color:#5f7382;line-height:1.45}.v85-role-number{font-size:.62rem;font-weight:900;color:#126e65}
    .v85-detail{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:16px;align-items:end;margin:18px 22px 0;padding:20px;border:1px solid #d8e1e8;border-radius:20px;background:#f9fbfc}
    .v85-detail h2{margin:4px 0 6px}.v85-detail p{margin:0;color:#5f7382;line-height:1.45}
    .v85-orientation-grid{grid-column:1/-1;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.v85-orientation-card{display:grid;gap:7px;min-height:116px;padding:16px;border:1px solid #d8e1e8;border-radius:18px;background:#fff;text-align:left;color:#12395c;box-shadow:0 10px 26px rgba(18,57,92,.05)}.v85-orientation-card:hover,.v85-orientation-card.selected{border-color:#126e65;box-shadow:0 14px 34px rgba(18,110,101,.12)}.v85-orientation-card.selected{background:#f4fbf9}.v85-orientation-card strong{font-size:.92rem}.v85-orientation-card small{color:#5f7382;line-height:1.4}.v85-coordinator-areas{grid-column:1/-1;display:grid;gap:12px;padding-top:4px}.v85-coordinator-scope{padding:14px 16px;border:1px solid #d8e1e8;border-radius:16px;background:#fff}.v85-coordinator-scope h3{margin:4px 0 6px}.v85-area-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
    .v85-check{display:flex;gap:8px;align-items:center;padding:10px 12px;border:1px solid #d8e1e8;border-radius:12px;background:#fff;font-size:.78rem;font-weight:750}.v85-check input{width:18px;height:18px}
    .v85-select-wrap{display:grid;gap:6px}.v85-select-wrap span{font-size:.7rem;font-weight:900;color:#3a5d7e}.v85-select-wrap select{min-width:280px;padding:11px;border:1px solid #d8e1e8;border-radius:12px;background:#fff;color:#12395c}
    .v85-enter{min-height:42px;padding:10px 18px;border:0;border-radius:999px;background:#12395c;color:#fff;font-weight:900}.v85-enter:disabled{opacity:.4}
    .v85-empty-note{grid-column:1/-1;padding:10px 12px;border-radius:12px;background:#fff5dc;color:#805700!important;font-size:.75rem}
    .v85-warning{margin:18px 22px 22px;padding:14px 16px;border:1px solid #f0daa2;border-radius:16px;background:#fffaf0;color:#805700;font-size:.74rem;line-height:1.45}
    .v91-profile{position:fixed;right:14px;top:14px;z-index:9998;width:min(390px,calc(100vw - 28px));font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.v91-profile-main{width:100%;display:grid;grid-template-columns:42px minmax(0,1fr) 20px;gap:9px;align-items:center;padding:8px 10px;border:1px solid rgba(18,57,92,.14);border-radius:18px;background:rgba(255,255,255,.97);color:#12395c;box-shadow:0 8px 22px rgba(18,57,92,.12);text-align:left}.v91-avatar{display:grid;place-items:center;width:42px;height:42px;border-radius:13px;background:#12395c;color:#fff;font-size:.72rem;font-weight:900}.v91-profile-copy{min-width:0;display:block}.v91-profile-copy small,.v91-profile-copy strong,.v91-profile-copy em{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.v91-profile-copy small{color:#126e65;font-size:.52rem;font-weight:900;text-transform:uppercase;letter-spacing:.05em}.v91-profile-copy strong{margin-top:1px;font-size:.72rem}.v91-profile-copy em{margin-top:2px;color:#5f7382;font-size:.55rem;font-style:normal}.v91-profile-chevron{font-size:1rem}.v91-profile-menu{margin-top:6px;padding:12px;border:1px solid #d8e1e8;border-radius:16px;background:#fff;box-shadow:0 14px 32px rgba(18,57,92,.16)}.v91-profile-menu small,.v91-profile-menu strong,.v91-profile-menu span{display:block}.v91-profile-menu small{color:#5f7382;font-size:.52rem}.v91-profile-menu strong{margin-top:2px;font-size:.72rem}.v91-profile-menu span{margin-top:3px;color:#5f7382;font-size:.58rem}.v91-profile-menu button{width:100%;margin-top:10px;padding:8px 10px;border:1px solid #d8e1e8;border-radius:999px;background:#edf3f8;color:#12395c;font-weight:850}
    @media(max-width:760px){.v85-overlay{padding:0}.v85-shell{border-radius:0;min-height:100vh}.v85-hero{padding:28px 20px}.access-brand-row{align-items:flex-start}.access-school-logo{width:min(235px,64vw);height:48px}.access-ba-logo{height:26px}.v85-card-grid{grid-template-columns:1fr;padding:16px 16px 0}.v85-role-card{min-height:auto}.v85-detail{grid-template-columns:1fr;margin:16px 16px 0}.v85-orientation-grid,.v85-area-grid{grid-template-columns:1fr}.v85-select-wrap select{min-width:0;width:100%}.v85-warning{margin:16px}.access-institutional-footer{padding:30px 20px;gap:14px}.access-footer-school{width:min(130px,42vw)}.access-footer-right{gap:10px;flex-wrap:wrap}.access-footer-right strong{font-size:.88rem}.access-footer-sep{height:32px}.access-footer-right img{height:40px}.access-cc-footer{justify-content:flex-start;padding:12px 20px}.v91-profile{top:auto;bottom:12px}}
  `;
  document.head.appendChild(style);

  window.PCIAccessPanelV85={show:showPanel,applyProfile,clear:()=>{clearProfile();showPanel()},teachers};
  window.addEventListener('pci-app-ready',()=>setTimeout(start,250));
  setTimeout(()=>{if(!overlay&&!profileChip)start()},1500);
})();