import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import zlib from 'node:zlib';

function decodeFg(){
  const files=Array.from({length:9},(_,i)=>`data/curriculum_v96/fg-all-p${i+1}.txt`);
  const encoded=files.map(f=>fs.readFileSync(f,'utf8').trim()).join('');
  return JSON.parse(zlib.gunzipSync(Buffer.from(encoded,'base64')).toString('utf8'));
}
function decodeFo(){
  const files=['data/curriculum_v96/fo_all.txt',...Array.from({length:10},(_,i)=>`data/curriculum_v96/fo_part${String(i+2).padStart(2,'0')}.txt`)];
  const encoded=files.map(f=>fs.readFileSync(f,'utf8').trim()).join('');
  return JSON.parse(zlib.gunzipSync(Buffer.from(encoded,'base64')).toString('utf8'));
}

test('V96 Formación General usa 979 contenidos y Tutoría solo 1º y 2º',()=>{
  const fg=decodeFg();
  assert.equal(fg.length,979);
  const byYear=Object.fromEntries([1,2,3,4,5].map(y=>[y,fg.filter(x=>Number(x.year)===y).length]));
  assert.deepEqual(byYear,{1:218,2:205,3:217,4:198,5:141});
  const tutor=fg.filter(x=>x.subject==='Tutoría');
  assert.equal(tutor.length,19);
  assert.deepEqual([...new Set(tutor.map(x=>Number(x.year)))].sort(),[1,2]);
  assert.equal(tutor.some(x=>Number(x.year)>=3),false);
});

test('V96 Formación General conserva año materia eje subeje y contenido',()=>{
  const fg=decodeFg();
  const normalized=fg.map(row=>{
    if(Array.isArray(row)){
      if(row.length>=7)return{year:row[1],area:row[2],subject:row[3],axis:row[4],subaxis:row[5],text:row[6]};
      return{year:row[0],subject:row[1],axis:row[2],subaxis:row[3],text:row[4]};
    }
    return{year:row.year??row.anio??row['Año'],area:row.area,subject:row.subject??row.materia??row['Materia'],axis:row.axis??row.eje??row['Eje'],subaxis:row.subaxis??row.subeje??row['Subeje'],text:row.text??row.contenido??row['Contenido']};
  });
  assert.ok(normalized.every(x=>Number(x.year)>=1&&Number(x.year)<=5&&String(x.subject||'').trim()&&String(x.text||'').trim()));
  assert.ok(normalized.some(x=>String(x.subaxis||'').trim()));
});
test('V96 Formación Orientada usa 860 contenidos únicos e incluye Historia y Tecnología',()=>{
  const fo=decodeFo().slice(0,860);
  assert.equal(fo.length,860);
  assert.equal(new Set(fo.map(x=>JSON.stringify(x))).size,860);
  assert.equal(fo.filter(x=>/historia.*orientad/i.test(String(x[2]||''))).length,98);
  assert.equal(fo.filter(x=>/tecnolog/i.test(String(x[2]||''))).length,91);
  assert.ok(fo.every(x=>String(x[0]||'').trim()&&String(x[2]||'').trim()&&String(x[3]||'').trim()&&String(x[5]||'').trim()));
});

test('V96 Bolsa curricular muestra Nivel y encadena Nivel Materia Eje Subeje',()=>{
  const source=fs.readFileSync('src/v47-phase2-matrix.js','utf8');
  for(const needle of [
    'id="v28level"','<span>Nivel</span>','Buscar por nivel, contenido, materia, eje o subeje',
    'const atLevel=base.filter','const atSubject=atLevel.filter','const atAxis=atSubject.filter',
    'id="v28subaxis"','<span>Subeje</span>','contentMeta(c)','Trayectoria orientada'
  ]) assert.ok(source.includes(needle),needle);
});

test('V96 impide asignar Formación General a otro nivel',()=>{
  const source=fs.readFileSync('src/v47-phase2-matrix.js','utf8');
  assert.ok(source.includes("Number(c.year)!==Number(g.year)"));
  assert.ok(source.includes('Este contenido corresponde a'));
  assert.ok(source.includes('el espacio es de'));
});

test('V96 cobertura consume el mismo catálogo FG de la bolsa',()=>{
  const coverage=fs.readFileSync('src/v91-coverage-core.js','utf8');
  assert.ok(coverage.includes('p?.loadCurriculum'));
  assert.ok(coverage.includes('p.getFGCatalog'));
  assert.equal(coverage.includes('data/contenidos-prescriptos-fg.json'),false);
  assert.ok(coverage.includes('String(x.id)===String(content.id)'));
});

test('V96 Tutoría legacy deja de estar activa',()=>{
  const app=fs.readFileSync('app.html','utf8');
  assert.equal(app.includes("'src/v69-tutoria-contents.js'"),false);
  assert.ok(app.includes('id="v28level"'));
  assert.ok(app.includes('loadCurriculum'));
});

test('V96 manifiesto documenta 979 FG y 860 FO',()=>{
  const manifest=JSON.parse(fs.readFileSync('data/curriculum_v96/manifest.json','utf8'));
  assert.equal(manifest.fgCount,979);
  assert.equal(manifest.foCount,860);
  assert.equal(manifest.historiaOrientadaCount,98);
  assert.equal(manifest.tecnologiasInformacionOrientadaCount,91);
  assert.deepEqual(manifest.tutoria.includedYears,[1,2]);
  assert.equal(manifest.historiaYTecnologiaIncludedInFo,true);
  assert.equal(manifest.foHasExplicitYear,false);
});