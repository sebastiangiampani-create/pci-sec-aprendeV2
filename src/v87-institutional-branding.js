(() => {
  const SCHOOL_LOGO='assets/logo-escuela-maestros.svg';
  const SCHOOL_LOGO_WHITE='assets/logo-escuela-maestros-blanco.svg';
  const BA_LOGO='assets/ba-logo.png';
  const BA_FOOTER='assets/ba-ciudad-footer.png';

  function ensureStyles(){
    if(document.getElementById('pciV88BrandStyles'))return;
    const style=document.createElement('style');
    style.id='pciV88BrandStyles';
    style.textContent=`
      .top .brand.pci-v88-brand{display:flex!important;align-items:center!important;min-width:250px!important}
      .top .brand.pci-v88-brand img{display:block!important;width:min(285px,52vw)!important;height:48px!important;object-fit:contain!important;object-position:left center!important}
      .top .brand.pci-v88-brand small,.top .brand.pci-v88-brand strong{display:none!important}
      .top .row.pci-v88-top-row{align-items:center!important}
      .top .row.pci-v88-top-row .pci-v88-ba{display:block;height:32px;width:auto;margin-right:4px}

      #pciV88InstitutionalFooter{margin-top:28px;display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap;padding:38px 5vw;background:#0d3550;color:#fff;border-radius:24px 24px 0 0}
      #pciV88InstitutionalFooter .pci-v88-footer-school{display:block;width:min(210px,50vw);height:auto}
      #pciV88InstitutionalFooter .pci-v88-footer-right{display:flex;align-items:center;gap:16px}
      #pciV88InstitutionalFooter .pci-v88-footer-right strong{font-size:.9rem}
      #pciV88InstitutionalFooter .pci-v88-sep{width:1px;height:30px;background:#ffffff66}
      #pciV88InstitutionalFooter .pci-v88-footer-ba{display:block;height:44px;width:auto}

      #v85AccessPanel .v88-access-brand-row{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:0 0 18px}
      #v85AccessPanel .v88-access-school{display:block;width:min(285px,66vw);height:54px;object-fit:contain;object-position:left center}
      #v85AccessPanel .v88-access-ba{display:block;height:30px;width:auto}
      #v85AccessPanel .v88-access-footer{margin-top:22px;display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap;padding:30px 28px;background:#0d3550;color:#fff;border-radius:0 0 28px 28px}
      #v85AccessPanel .v88-access-footer .v88-access-footer-school{display:block;width:min(205px,48vw);height:auto}
      #v85AccessPanel .v88-access-footer-right{display:flex;align-items:center;gap:14px}
      #v85AccessPanel .v88-access-footer-right strong{font-size:.82rem}
      #v85AccessPanel .v88-access-footer-right .v88-sep{width:1px;height:28px;background:#ffffff66}
      #v85AccessPanel .v88-access-footer-right img{display:block;height:42px;width:auto}

      @media(max-width:700px){
        .top .brand.pci-v88-brand{min-width:0!important}
        .top .brand.pci-v88-brand img{width:min(230px,58vw)!important;height:42px!important}
        .top .row.pci-v88-top-row .pci-v88-ba{height:28px}
        #pciV88InstitutionalFooter{padding:30px 22px}
        #pciV88InstitutionalFooter .pci-v88-footer-right{gap:10px;flex-wrap:wrap}
        #pciV88InstitutionalFooter .pci-v88-footer-ba{height:42px}
        #v85AccessPanel .v88-access-brand-row{align-items:flex-start}
        #v85AccessPanel .v88-access-school{width:min(235px,64vw);height:48px}
        #v85AccessPanel .v88-access-ba{height:26px}
        #v85AccessPanel .v88-access-footer{padding:26px 20px;gap:14px}
        #v85AccessPanel .v88-access-footer-right{gap:10px;flex-wrap:wrap}
        #v85AccessPanel .v88-access-footer-right img{height:38px}
      }
    `;
    document.head.appendChild(style);
  }

  function installHeader(){
    const brand=document.querySelector('.top .brand');
    if(brand && brand.dataset.pciV88Brand!=='1'){
      brand.dataset.pciV88Brand='1';
      brand.classList.add('pci-v88-brand');
      brand.innerHTML='<img src="'+SCHOOL_LOGO+'" alt="Escuela de Maestros">';
    }
    const row=document.querySelector('.top .row');
    if(row && !row.querySelector('.pci-v88-ba')){
      row.classList.add('pci-v88-top-row');
      const ba=document.createElement('img');
      ba.className='pci-v88-ba';
      ba.src=BA_LOGO;
      ba.alt='BA · Gobierno de la Ciudad de Buenos Aires';
      row.prepend(ba);
    }
  }

  function installGlobalFooter(){
    let footer=document.getElementById('pciV88InstitutionalFooter');
    if(!footer){
      footer=document.createElement('footer');
      footer.id='pciV88InstitutionalFooter';
      footer.setAttribute('aria-label','Identidad institucional');
      footer.innerHTML='<img class="pci-v88-footer-school" src="'+SCHOOL_LOGO_WHITE+'" alt="Escuela de Maestros">'
        +'<div class="pci-v88-footer-right"><strong>Ministerio de Educación</strong><span class="pci-v88-sep"></span><img class="pci-v88-footer-ba" src="'+BA_FOOTER+'" alt="Buenos Aires Ciudad"></div>';
    }
    const cc=document.getElementById('ccLicenseFooter');
    if(cc && footer.nextElementSibling!==cc)cc.before(footer);
    else if(!footer.isConnected)document.body.appendChild(footer);
  }

  function installAccessBranding(){
    const panel=document.getElementById('v85AccessPanel');
    if(!panel)return;
    const hero=panel.querySelector('.v85-hero');
    if(hero && !hero.querySelector('.v88-access-brand-row')){
      hero.querySelector('.v87-access-brand')?.remove();
      const row=document.createElement('div');
      row.className='v88-access-brand-row';
      row.innerHTML='<img class="v88-access-school" src="'+SCHOOL_LOGO+'" alt="Escuela de Maestros"><img class="v88-access-ba" src="'+BA_LOGO+'" alt="BA · Gobierno de la Ciudad de Buenos Aires">';
      hero.prepend(row);
    }
    const shell=panel.querySelector('.v85-shell');
    shell?.querySelector('.v87-access-footer')?.remove();
    if(shell && !shell.querySelector('.v88-access-footer')){
      const footer=document.createElement('footer');
      footer.className='v88-access-footer';
      footer.innerHTML='<img class="v88-access-footer-school" src="'+SCHOOL_LOGO_WHITE+'" alt="Escuela de Maestros">'
        +'<div class="v88-access-footer-right"><strong>Ministerio de Educación</strong><span class="v88-sep"></span><img src="'+BA_FOOTER+'" alt="Buenos Aires Ciudad"></div>';
      shell.appendChild(footer);
    }
  }

  function cleanupV87(){
    document.getElementById('pciV87InstitutionalFooter')?.remove();
    document.querySelectorAll('.v87-access-brand,.v87-access-footer').forEach(el=>el.remove());
  }

  function install(){
    ensureStyles();
    cleanupV87();
    installHeader();
    installGlobalFooter();
    installAccessBranding();
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

  window.PCIInstitutionalBrandingV88={install};
})();