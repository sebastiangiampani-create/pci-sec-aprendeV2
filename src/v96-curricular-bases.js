(()=>{
  const BASE='data/curriculum_v96/';
  const VERSION='20260925-v96';
  let manifestCache=null,fgCache=null;
  const foCache=new Map();

  async function manifest(){
    if(manifestCache)return manifestCache;
    const r=await fetch(BASE+'manifest.json?v='+VERSION,{cache:'no-store'});
    if(!r.ok)throw new Error('No se pudo cargar el manifiesto curricular V96.');
    manifestCache=await r.json();
    return manifestCache;
  }

  async function unpackFiles(files=[]){
    if(!files.length)return[];
    const parts=await Promise.all(files.map(async name=>{
      const r=await fetch(BASE+name+'?v='+VERSION,{cache:'force-cache'});
      if(!r.ok)throw new Error('No se pudo cargar '+name+'.');
      return (await r.text()).trim();
    }));
    const bytes=Uint8Array.from(atob(parts.join('')),c=>c.charCodeAt(0));
    const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    return JSON.parse(await new Response(stream).text());
  }

  function fgRow(x){
    return {id:x[0],year:Number(x[1])||0,component:'FG',area:x[2]||'',subject:x[3]||'',axis:x[4]||'',subaxis:x[5]||'',text:x[6]||''};
  }
  function foRow(x){
    return {id:x[0],year:0,component:'FO',area:'Formación Orientada',orientation:x[1]||'',suborientation:x[2]||'',block:x[3]||'',subject:x[3]||'Formación Orientada',axis:x[4]||'',subaxis:x[5]||'',text:x[6]||'',kind:x[7]||'Bloque'};
  }

  async function loadFG(){
    if(fgCache)return fgCache;
    const m=await manifest();
    const years=Object.keys(m.fgFiles||{}).sort((a,b)=>Number(a)-Number(b));
    const chunks=await Promise.all(years.map(y=>unpackFiles(m.fgFiles[y]||[])));
    fgCache=chunks.flat().map(fgRow);
    return fgCache;
  }

  async function loadFO(orientation){
    const key=String(orientation||'').trim();
    if(foCache.has(key))return foCache.get(key);
    const m=await manifest(),files=m.foFiles?.[key]||[];
    const rows=(await unpackFiles(files)).map(foRow);
    foCache.set(key,rows);
    return rows;
  }

  const levelKey=row=>row?.component==='FO'?'FO':String(Number(row?.year)||'');
  const levelLabel=row=>row?.component==='FO'?'Trayectoria orientada':String(Number(row?.year)||'—')+'.º año';
  window.PCICurriculumV96={manifest,loadFG,loadFO,levelKey,levelLabel,version:VERSION};
})();