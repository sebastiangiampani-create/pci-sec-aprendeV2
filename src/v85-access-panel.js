(() => {
  const KEY='pci-v85-access-session';
  const AREAS=[
    'Lengua y Literatura','Matemática','Lenguas Adicionales','Ciencias Naturales',
    'Ciencias Sociales','Artes','Tecnologías','Educación Física',
    'Formación Orientada','Otros formatos pedagógicos'
  ];
  let overlay=null,profileChip=null;

  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function institutional(){
    state.institutional=state.institutional||{};
    state.institutional.teachers=state.institutional.teachers||{};
    state.institutional.teacherProfiles=state.institutional.teacherProfiles||{};
    return state.institutional;
  }

  function teachers(){
    const root=institutional();
    return Object.values(root.teachers||{}).map(t=>({
      id:String(t.id||''),
      name:String(t.name||t.fullName||t.nombre||t.email||t.id||'Docente'),
      email:String(t.email||root.teacherProfiles?.[t.id]?.email||'')
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
      api.setSession({role:'coordinator',coordinatorAreas:[...(profile.coordinatorAreas||[])]});
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
    profileChip=document.createElement('button');
    profileChip.type='button';
    profileChip.className='v85-profile-chip';
    const extra=profile.role==='coordinator'&&profile.coordinatorAreas?.length
      ? ' · '+profile.coordinatorAreas.join(', ')
      : profile.role==='teacher'&&profile.name
        ? ' · '+profile.name
        : '';
    profileChip.textContent=labelOf(profile)+extra+' · Cambiar';
    profileChip.onclick=()=>{clearProfile();showPanel()};
    document.body.appendChild(profileChip);
  }

  function coordinatorOptions(){
    return AREAS.map(a=>`<label class="v85-check"><input type="checkbox" value="${esc(a)}"><span>${esc(a)}</span></label>`).join('');
  }

  function teacherOptions(){
    const rows=teachers();
    if(!rows.length)return '<option value="">Todavía no hay docentes cargados</option>';
    return '<option value="">Seleccionar docente</option>'+rows.map(t=>`<option value="${esc(t.id)}" data-email="${esc(t.email)}">${esc(t.name)}${t.email?' · '+esc(t.email):''}</option>`).join('');
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
          <h2>Elegí el área asignada</h2>
          <p>Para esta etapa de prueba el ámbito se selecciona acá. Luego lo asignará conducción desde el backend de permisos.</p>
        </div>
        <div class="v85-area-grid">${coordinatorOptions()}</div>
        <button class="v85-enter" id="v85EnterCoordinator" disabled>Entrar como coordinador</button>`;
      const checks=[...detail.querySelectorAll('input[type="checkbox"]')];
      const enter=detail.querySelector('#v85EnterCoordinator');
      const refresh=()=>enter.disabled=!checks.some(x=>x.checked);
      checks.forEach(x=>x.onchange=refresh);
      enter.onclick=()=>{
        const coordinatorAreas=checks.filter(x=>x.checked).map(x=>x.value);
        if(!coordinatorAreas.length)return;
        applyProfile({role:'coordinator',coordinatorAreas});
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
    .v85-eye{margin:0 0 6px;color:#126e65;font-size:.72rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase}
    .v85-card-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;padding:22px 22px 0}
    .v85-role-card{display:grid;gap:8px;min-height:168px;padding:20px;border:1px solid #d8e1e8;border-radius:20px;background:#fff;text-align:left;color:#12395c;box-shadow:0 10px 26px rgba(18,57,92,.05)}
    .v85-role-card:hover,.v85-role-card.selected{border-color:#126e65;box-shadow:0 14px 34px rgba(18,110,101,.12)}.v85-role-card.selected{background:#f4fbf9}
    .v85-role-card strong{font-size:1rem}.v85-role-card small{color:#5f7382;line-height:1.45}.v85-role-number{font-size:.62rem;font-weight:900;color:#126e65}
    .v85-detail{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:16px;align-items:end;margin:18px 22px 0;padding:20px;border:1px solid #d8e1e8;border-radius:20px;background:#f9fbfc}
    .v85-detail h2{margin:4px 0 6px}.v85-detail p{margin:0;color:#5f7382;line-height:1.45}
    .v85-area-grid{grid-column:1/-1;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
    .v85-check{display:flex;gap:8px;align-items:center;padding:10px 12px;border:1px solid #d8e1e8;border-radius:12px;background:#fff;font-size:.78rem;font-weight:750}.v85-check input{width:18px;height:18px}
    .v85-select-wrap{display:grid;gap:6px}.v85-select-wrap span{font-size:.7rem;font-weight:900;color:#3a5d7e}.v85-select-wrap select{min-width:280px;padding:11px;border:1px solid #d8e1e8;border-radius:12px;background:#fff;color:#12395c}
    .v85-enter{min-height:42px;padding:10px 18px;border:0;border-radius:999px;background:#12395c;color:#fff;font-weight:900}.v85-enter:disabled{opacity:.4}
    .v85-empty-note{grid-column:1/-1;padding:10px 12px;border-radius:12px;background:#fff5dc;color:#805700!important;font-size:.75rem}
    .v85-warning{margin:18px 22px 22px;padding:14px 16px;border:1px solid #f0daa2;border-radius:16px;background:#fffaf0;color:#805700;font-size:.74rem;line-height:1.45}
    .v85-profile-chip{position:fixed;right:14px;top:14px;z-index:9998;max-width:min(560px,calc(100vw - 28px));padding:8px 12px;border:1px solid rgba(18,57,92,.14);border-radius:999px;background:rgba(255,255,255,.94);color:#12395c;box-shadow:0 8px 22px rgba(18,57,92,.12);font-size:.66rem;font-weight:850}
    @media(max-width:760px){.v85-overlay{padding:0}.v85-shell{border-radius:0;min-height:100vh}.v85-hero{padding:28px 20px}.v85-card-grid{grid-template-columns:1fr;padding:16px 16px 0}.v85-role-card{min-height:auto}.v85-detail{grid-template-columns:1fr;margin:16px 16px 0}.v85-area-grid{grid-template-columns:1fr}.v85-select-wrap select{min-width:0;width:100%}.v85-warning{margin:16px}.v85-profile-chip{top:auto;bottom:12px}}
  `;
  document.head.appendChild(style);

  window.PCIAccessPanelV85={show:showPanel,applyProfile,clear:()=>{clearProfile();showPanel()},teachers};
  window.addEventListener('pci-app-ready',()=>setTimeout(start,250));
  setTimeout(()=>{if(!overlay&&!profileChip)start()},1500);
})();