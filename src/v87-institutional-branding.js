(() => {
  const SCHOOL_LOGO='assets/brand-escuela-maestros.svg';
  const MINISTRY_LOGO='assets/brand-ministerio.svg';

  function ensureStyles(){
    if(document.getElementById('pciV87BrandStyles'))return;
    const style=document.createElement('style');
    style.id='pciV87BrandStyles';
    style.textContent=`
      .top .brand.pci-v87-brand{display:flex!important;align-items:center!important;gap:12px!important;min-width:250px!important}
      .top .brand.pci-v87-brand img{display:block!important;width:min(290px,42vw)!important;height:auto!important;max-height:50px!important;object-fit:contain!important;object-position:left center!important}
      .top .brand.pci-v87-brand small,.top .brand.pci-v87-brand strong{display:none!important}

      #pciV87InstitutionalFooter{margin-top:26px;background:#fff;border-top:1px solid rgba(18,57,92,.12)}
      #pciV87InstitutionalFooter .pci-v87-upper{padding:28px 24px 22px;display:flex;justify-content:flex-start}
      #pciV87InstitutionalFooter .pci-v87-upper img{display:block;width:min(360px,78vw);height:auto}
      #pciV87InstitutionalFooter .pci-v87-lower{background:#103d5c;padding:28px 24px;display:flex;justify-content:flex-start;align-items:center}
      #pciV87InstitutionalFooter .pci-v87-lower img{display:block;width:min(760px,92vw);height:auto;max-height:150px;object-fit:contain;object-position:left center}

      #v85AccessPanel .v87-access-brand{display:flex;align-items:center;margin:0 0 18px}
      #v85AccessPanel .v87-access-brand img{display:block;width:min(320px,72vw);height:auto;max-height:66px;object-fit:contain;object-position:left center;border-radius:12px}
      #v85AccessPanel .v87-access-footer{margin-top:22px;border-top:1px solid #d8e1e8;background:#fff}
      #v85AccessPanel .v87-access-footer-upper{padding:22px 28px 18px}
      #v85AccessPanel .v87-access-footer-upper img{display:block;width:min(300px,72vw);height:auto}
      #v85AccessPanel .v87-access-footer-lower{padding:22px 28px;background:#103d5c}
      #v85AccessPanel .v87-access-footer-lower img{display:block;width:min(720px,92%);height:auto;max-height:132px;object-fit:contain;object-position:left center}
      #v85AccessPanel .v87-access-footer-legal{padding:11px 28px 16px;background:#f8fafb;color:#5f7382;font-size:.66rem;line-height:1.45}
      #v85AccessPanel .v87-access-footer-legal strong{color:#12395c}

      @media(max-width:700px){
        .top .brand.pci-v87-brand{min-width:0!important}
        .top .brand.pci-v87-brand img{width:min(230px,58vw)!important;max-height:42px!important}
        #pciV87InstitutionalFooter .pci-v87-upper{padding:22px 20px 18px}
        #pciV87InstitutionalFooter .pci-v87-lower{padding:24px 20px}
        #v85AccessPanel .v87-access-brand{margin-bottom:14px}
        #v85AccessPanel .v87-access-brand img{width:min(265px,74vw);max-height:58px}
        #v85AccessPanel .v87-access-footer-upper{padding:18px 20px 14px}
        #v85AccessPanel .v87-access-footer-lower{padding:18px 20px}
        #v85AccessPanel .v87-access-footer-legal{padding:10px 20px 14px}
      }
    `;
    document.head.appendChild(style);
  }

  function installHeaderLogo(){
    const brand=document.querySelector('.top .brand');
    if(!brand||brand.dataset.pciV87Brand==='1')return;
    brand.dataset.pciV87Brand='1';
    brand.classList.add('pci-v87-brand');
    brand.innerHTML='<img src="'+SCHOOL_LOGO+'" alt="Escuela de Maestros">';
  }

  function installGlobalFooter(){
    let footer=document.getElementById('pciV87InstitutionalFooter');
    if(!footer){
      footer=document.createElement('section');
      footer.id='pciV87InstitutionalFooter';
      footer.setAttribute('aria-label','Identidad institucional');
      footer.innerHTML='<div class="pci-v87-upper"><img src="'+SCHOOL_LOGO+'" alt="Escuela de Maestros"></div>'
        +'<div class="pci-v87-lower"><img src="'+MINISTRY_LOGO+'" alt="Ministerio de Educación · Buenos Aires Ciudad"></div>';
    }
    const cc=document.getElementById('ccLicenseFooter');
    if(cc&&footer.nextElementSibling!==cc)cc.before(footer);
    else if(!footer.isConnected)document.body.appendChild(footer);
  }

  function installAccessBranding(){
    const panel=document.getElementById('v85AccessPanel');
    if(!panel)return;
    const hero=panel.querySelector('.v85-hero');
    if(hero&&!hero.querySelector('.v87-access-brand')){
      const brand=document.createElement('div');
      brand.className='v87-access-brand';
      brand.innerHTML='<img src="'+SCHOOL_LOGO+'" alt="Escuela de Maestros">';
      hero.prepend(brand);
    }
    const shell=panel.querySelector('.v85-shell');
    if(shell&&!shell.querySelector('.v87-access-footer')){
      const footer=document.createElement('footer');
      footer.className='v87-access-footer';
      footer.innerHTML='<div class="v87-access-footer-upper"><img src="'+SCHOOL_LOGO+'" alt="Escuela de Maestros"></div>'
        +'<div class="v87-access-footer-lower"><img src="'+MINISTRY_LOGO+'" alt="Ministerio de Educación · Buenos Aires Ciudad"></div>'
        +'<div class="v87-access-footer-legal"><strong>© 2026 Sebastián Giampani</strong> · Creative Commons BY-NC-ND 4.0</div>';
      shell.appendChild(footer);
    }
  }

  function install(){
    ensureStyles();
    installHeaderLogo();
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

  window.PCIInstitutionalBrandingV87={install};
})();