(() => {
  const DATA_URL='data/contenidos-prescriptos-fg.json';
  let rows=null,loading=null;

  const norm=v=>String(v??'')
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();

  const subjectAliases=new Map([
    ['formacion etica ciudadana','formacion etica y ciudadana'],
    ['educacion artistica artes visuales','artes visuales'],
    ['tecnologia de la informacion','tecnologias de la informacion']
  ]);
  const subjectKey=v=>{
    const k=norm(v).replace(/\by\b/g,' y ').replace(/\s+/g,' ').trim();
    return subjectAliases.get(k)||k;
  };

  async function load(){
    if(rows)return rows;
    if(loading)return loading;
    loading=fetch(DATA_URL,{cache:'no-store'}).then(r=>{
      if(!r.ok)throw new Error('No se pudo cargar la base de contenidos prescriptos por año.');
      return r.json();
    }).then(data=>{
      rows=(Array.isArray(data)?data:data.rows||[]).map(x=>({
        ...x,
        year:Number(x.year)||0,
        _subject:subjectKey(x.subject),
        _text:norm(x.text)
      }));
      return rows;
    }).finally(()=>{loading=null});
    return loading;
  }

  function memberSubjects(group){
    const phase=window.PCIPhase2V28;
    const members=phase?.members?.(group)||[];
    const names=members.map(x=>String(x?.name||'').trim()).filter(Boolean);
    if(names.length)return [...new Set(names)];
    return [];
  }

  function universeForGroup(group){
    if(!rows||!group)return[];
    const year=Number(group.year)||0;
    const keys=new Set(memberSubjects(group).map(subjectKey));
    if(!keys.size)return[];
    return rows.filter(x=>x.year===year&&keys.has(x._subject));
  }

  function matchesContent(content,candidate){
    if(!content||!candidate)return false;
    if(subjectKey(content.subject)!==candidate._subject)return false;
    const text=norm(content.text);
    if(!text||!candidate._text)return false;
    if(text===candidate._text)return true;
    if(text.length>=18&&candidate._text.includes(text))return true;
    if(candidate._text.length>=18&&text.includes(candidate._text))return true;
    return false;
  }

  function canonicalForContent(content,year=null){
    if(!rows||!content||content.component!=='FG')return[];
    const subset=rows.filter(x=>(!year||x.year===Number(year))&&subjectKey(content.subject)===x._subject);
    return subset.filter(x=>matchesContent(content,x));
  }

  function coverageForIds(group,ids=[]){
    const phase=window.PCIPhase2V28;
    const universe=universeForGroup(group);
    const universeIds=new Set(universe.map(x=>x.id));
    const used=new Map(),offLevel=new Set(),unmatched=new Set();

    for(const id of [...new Set(ids||[])]){
      const content=phase?.findContent?.(id);
      if(!content||content.component!=='FG')continue;
      const target=canonicalForContent(content,group?.year).filter(x=>universeIds.has(x.id));
      if(target.length){
        target.forEach(x=>used.set(x.id,x));
        continue;
      }
      const other=canonicalForContent(content,null).filter(x=>x.year!==Number(group?.year));
      if(other.length)offLevel.add(id); else unmatched.add(id);
    }

    const bySubject={};
    for(const row of universe){
      const key=row.subject;
      bySubject[key]=bySubject[key]||{subject:key,total:0,used:0,percent:0};
      bySubject[key].total++;
    }
    for(const row of used.values()){
      const x=bySubject[row.subject];if(x)x.used++;
    }
    for(const x of Object.values(bySubject))x.percent=x.total?Math.round(x.used/x.total*1000)/10:0;

    return {
      year:Number(group?.year)||0,
      total:universe.length,
      used:used.size,
      percent:universe.length?Math.round(used.size/universe.length*1000)/10:0,
      bySubject:Object.values(bySubject).sort((a,b)=>a.subject.localeCompare(b.subject,'es')),
      offLevel:offLevel.size,
      unmatched:unmatched.size,
      universe,
      usedRows:[...used.values()]
    };
  }

  function formatCoverage(group){
    return coverageForIds(group,group?.data?.contents||[]);
  }

  async function ready(){await load();return api}

  const api={
    ready,load,
    rows:()=>rows||[],
    normalize:norm,
    subjectKey,
    memberSubjects,
    universeForGroup,
    canonicalForContent,
    coverageForIds,
    formatCoverage
  };
  window.PCICoverageV91=api;
  window.addEventListener('pci-app-ready',()=>ready().catch(e=>console.error('[V91 coverage]',e)));
})();