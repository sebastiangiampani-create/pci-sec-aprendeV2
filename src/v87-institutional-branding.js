(() => {
  const SCHOOL_LOGO='assets/logo-escuela-maestros.svg';
  const SCHOOL_LOGO_WHITE='assets/logo-escuela-maestros-blanco.svg';
  const BA_LOGO='assets/ba-logo.png';
  const BA_FOOTER='assets/ba-ciudad-footer.png';
  const FOOTER_ID='pciInstitutionalFooter';

  function ensureStyles(){
    if(document.getElementById('pciV89BrandStyles'))return;
    const style=document.createElement('style');
    style.id='pciV89BrandStyles';
    style.textContent=`
      .top .brand.pci-v89-brand{display:flex!important;align-items:center!important;min-width:250px!important}
      .top .brand.pci-v89-brand img{display:block!important;width:min(285px,52vw)!important;height:48px!important;object-fit:contain!important;object-position:left center!important}
      .top .brand.pci-v89-brand small,.top .brand.pci-v89-brand strong{display:none!important}
      .top .row.pci-v89-top-row{align-items:center!important}
      .top .row.pci-v89-top-row .pci-v89-ba{display:block;height:32px;width:auto;margin-right:4px}

      #${FOOTER_ID}{margin-top:28px;display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap;padding:34px 5vw;background:#0d3550;color:#fff;border-radius:24px 24px 0 0}
      #${FOOTER_ID} .pci-v89-footer-school{display:block;width:min(210px,50vw);height:auto}
      #${FOOTER_ID} .pci-v89-footer-right{display:flex;align-items:center;gap:16px}
      #${FOOTER_ID} .pci-v89-footer-right strong{font-size:.9rem}
      #${FOOTER_ID} .pci-v89-sep{width:1px;height:30px;background:#ffffff66}
      #${FOOTER_ID} .pci-v89-footer-ba{display:block;height:44px;width:auto}

      #v85AccessPanel .v89-access-brand-row{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:0 0 18px}
      #v85AccessPanel .v89-access-school{display:block;width:min(285px,66vw);height:54px;object-fit:contain;object-position:left center}
      #v85AccessPanel .v89-access-ba{display:block;height:30px;width:auto}
      #v85AccessPanel #${FOOTER_ID}{margin-top:22px;border-radius:0 0 28px 28px;padding:30px 28px}

      @media(max-width:700px){
        .top .brand.pci-v89-brand{min-width:0!important}
        .top .brand.pci-v89-brand img{width:min(230px,58vw)!important;height:42px!important}
        .top .row.pci-v89-top-row .pci-v89-ba{height:28px}
        #${FOOTER_ID}{padding:28px 22px;gap:14px}
        #${FOOTER_ID} .pci-v89-footer-right{gap:10px;flex-wrap:wrap}
        #${FOOTER_ID} .pci-v89-footer-ba{height:40px}
        #v85AccessPanel .v89-access-brand-row{align-items:flex-start}
        #v85AccessPanel .v89-access-school{width:min(235px,64vw);height:48px}
        #v85AccessPanel .v89-access-ba{height:26px}
        #v85AccessPanel #${FOOTER_ID}{padding:26px 20px}
      }
    `;
    document.head.appendChild(style);
  }

  function cleanupLegacyBranding(){
    document.getElementById('pciV87InstitutionalFooter')?.remove();
    document.getElementById('pciV88InstitutionalFooter')?.remove();
    document.querySelectorAll('.v87-access-brand,.v87-access-footer,.v88-access-brand-row,.v88-access-footer').forEach(el=>el.remove());
  }

  function installHeader(){
    const brand=document.querySelector('.top .brand');
    if(brand){
      brand.classList.remove('pci-v87-brand','pci-v88-brand');
      brand.classList.add('pci-v89-brand');
      brand.dataset.pciV89Brand='1';
      if(!brand.querySelector('img[src*="logo-escuela-maestros.svg"]')){
        brand.innerHTML='<img src="'+SCHOOL_LOGO+'" alt="Escuela de Maestros">';
      }
    }

    const row=document.querySelector('.top .row');
    if(row){
      row.classList.remove('pci-v88-top-row');
      row.classList.add('pci-v89-top-row');
      row.querySelectorAll('.pci-v88-ba,.pci-v89-ba').forEach((el,index)=>{if(index>0)el.remove()});
      if(!row.querySelector('.pci-v89-ba')){
        row.querySelector('.pci-v88-ba')?.remove();
        const ba=document.createElement('img');
        ba.className='pci-v89-ba';
        ba.src=BA_LOGO;
        ba.alt='BA · Gobierno de la Ciudad de Buenos Aires';
        row.prepend(ba);
      }
    }
  }

  function ensureFooter(){
    let footer=document.getElementById(FOOTER_ID);
    if(!footer){
      footer=document.createElement('footer');
      footer.id=FOOTER_ID;
      footer.setAttribute('aria-label','Identidad institucional');
      footer.innerHTML='<img class="pci-v89-footer-school" src="'+SCHOOL_LOGO_WHITE+'" alt="Escuela de Maestros">'
        +'<div class="pci-v89-footer-right"><strong>Ministerio de Educación</strong><span class="pci-v89-sep"></span><img class="pci-v89-footer-ba" src="'+BA_FOOTER+'" alt="Buenos Aires Ciudad"></div>';
    }
    return footer;
  }

  function installAccessHeader(){
    const panel=document.getElementById('v85AccessPanel');
    if(!panel)return;
    const hero=panel.querySelector('.v85-hero');
    if(hero && !hero.querySelector('.v89-access-brand-row')){
      hero.querySelectorAll('.v87-access-brand,.v88-access-brand-row').forEach(el=>el.remove());
      const row=document.createElement('div');
      row.className='v89-access-brand-row';
      row.innerHTML='<img class="v89-access-school" src="'+SCHOOL_LOGO+'" alt="Escuela de Maestros"><img class="v89-access-ba" src="'+BA_LOGO+'" alt="BA · Gobierno de la Ciudad de Buenos Aires">';
      hero.prepend(row);
    }
  }

  function placeSingleFooter(){
    const footer=ensureFooter();
    const panel=document.getElementById('v85AccessPanel');
    const shell=panel?.querySelector('.v85-shell');

    if(shell){
      if(footer.parentElement!==shell) shell.appendChild(footer);
      return;
    }

    const cc=document.getElementById('ccLicenseFooter');
    if(cc){
      if(footer.nextElementSibling!==cc) cc.before(footer);
    }else if(footer.parentElement!==document.body){
      document.body.appendChild(footer);
    }
  }

  function removeDuplicateCanonicalFooters(){
    const all=[...document.querySelectorAll('#'+FOOTER_ID)];
    all.slice(1).forEach(el=>el.remove());
  }

  function install(){
    ensureStyles();
    cleanupLegacyBranding();
    removeDuplicateCanonicalFooters();
    installHeader();
    installAccessHeader();
    placeSingleFooter();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();

  let scheduled=false;
  const observer=new MutationObserver(()=>{
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;install()});
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('pci-app-ready',()=>setTimeout(install,120));

  window.PCIInstitutionalBrandingV89={install};
})();