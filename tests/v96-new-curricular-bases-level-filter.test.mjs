import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import zlib from 'node:zlib';

const decode=encoded=>JSON.parse(zlib.gunzipSync(Buffer.from(encoded.trim(),'base64')).toString('utf8'));

test('V96 Formación General usa exactamente 979 contenidos y Tutoría solo en 1.º y 2.º',()=>{
  const rows=decode(fs.readFileSync('data/curriculum_v96/fg_all.txt','utf8'));
  assert.equal(rows.length,979);
  const byYear=Object.fromEntries([1,2,3,4,5].map(y=>[y,rows.filter(x=>Number(x[0])===y).length]));
  assert.deepEqual(byYear,{1:218,2:205,3:217,4:198,5:141});
  const tutor=rows.filter(x=>x[1]==='Tutoría');
  assert.equal(tutor.length,19);
  assert.deepEqual([...new Set(tutor.map(x=>Number(x[0])))].sort(),[1,2]);
});

test('V96 Formación Orientada reconstruye 1049 contenidos sin inventar año',()=>{
  const files=['fo_all.txt',...Array.from({length:10},(_,i)=>`fo_part${String(i+2).padStart(2,'0')}.txt`)];
  const encoded=files.map(f=>fs.readFileSync('data/curriculum_v96/'+f,'utf8').trim()).join('');
  const rows=decode(encoded);
  assert.equal(rows.length,1049);
  assert.ok(rows.every(x=>x.length===6));
  assert.ok(rows.some(x=>x[2]==='Historia orientada'));
  assert.ok(rows.some(x=>x[2]==='Tecnologías de la Información orientada'));
  const orientations=[...new Set(rows.map(x=>x[0]))].sort();
  assert.deepEqual(orientations,['Agro y Ambiente','Arte','Ciencias Sociales y Humanidades','Comunicación','Economía y Administración','Educación Física','Energía y Sustentabilidad','Lenguas','Literatura','Turismo'].sort());
});

test('V96 Bolsa curricular muestra y filtra Nivel, eje y subeje',()=>{
  const source=fs.readFileSync('src/v47-phase2-matrix.js','utf8');
  for(const needle of [
    'id="v28level"',
    '<span>Nivel</span>',
    'Buscar por nivel, contenido, materia, eje o subeje',
    'Eje / subeje',
    'Trayectoria orientada',
    'levelKey',
    'levelLabel',
    'subaxis',
    'contentMeta'
  ]) assert.ok(source.includes(needle),needle);
});

test('V96 filtros son encadenados y el buscador incluye genealogía curricular',()=>{
  const source=fs.readFileSync('src/v47-phase2-matrix.js','utf8');
  for(const needle of [
    'const atLevel=base.filter',
    'const atSubject=atLevel.filter',
    "kind==='subaxis'?c.subaxis===value:c.axis===value",
    "${c.subaxis||''}",
    "${levelLabel(c)} nivel"
  ]) assert.ok(source.includes(needle),needle);
});

test('V96 impide asignar contenidos FG de otro nivel',()=>{
  const source=fs.readFileSync('src/v47-phase2-matrix.js','utf8');
  assert.ok(source.includes("Number(c.year)!==Number(g.year)"));
  assert.ok(source.includes("Este contenido corresponde a"));
  assert.ok(source.includes("el espacio es de"));
});

test('V96 Tutoría legacy deja de estar activa',()=>{
  const app=fs.readFileSync('app.html','utf8');
  assert.equal(app.includes("'src/v69-tutoria-contents.js'"),false);
  assert.ok(app.includes('id="v28level"'));
  assert.ok(app.includes('loadCurriculum'));
});

test('V96 cobertura consume el mismo catálogo FG de la bolsa',()=>{
  const coverage=fs.readFileSync('src/v91-coverage-core.js','utf8');
  assert.ok(coverage.includes('p?.loadCurriculum'));
  assert.ok(coverage.includes('p.getFGCatalog'));
  assert.equal(coverage.includes("data/contenidos-prescriptos-fg.json"),false);
  assert.ok(coverage.includes("String(x.id)===String(content.id)"));
});
