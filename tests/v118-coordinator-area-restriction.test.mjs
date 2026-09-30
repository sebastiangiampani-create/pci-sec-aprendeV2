import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('V118 deriva el area de coordinacion desde materias asignadas',()=>{
  const source=fs.readFileSync('src/v71-lean-management.js','utf8');
  for(const needle of [
    "if(name==='lengua y literatura')return 'Lengua y Literatura'",
    "if(name==='matematica')return 'Matemática'",
    "return 'Ciencias Naturales'",
    "return 'Ciencias Sociales'",
    "return 'Tecnologías'",
    "if(String(row?.origin||'').toUpperCase()==='FO')return 'Formación Orientada'"
  ]) assert.ok(source.includes(needle),needle);
});

test('V118 bloquea coordinacion de area incompatible en el guardado',()=>{
  const source=fs.readFileSync('src/v71-lean-management.js','utf8');
  assert.ok(source.includes("if(kind==='area'&&!areaCoordinationCompatible(teacherId,scope))"));
  assert.ok(source.includes('no puede coordinar'));
  assert.ok(source.includes('Áreas habilitadas:'));
});

test('V118 el selector de area muestra solo areas habilitadas para el docente',()=>{
  const source=fs.readFileSync('src/v71-lean-management.js','utf8');
  assert.ok(source.includes('const coords=teacherCoordinationRows(t.id),allowedAreas=coordinationAreasForTeacher(t.id)'));
  assert.ok(source.includes('Sin áreas habilitadas por asignación'));
  assert.ok(source.includes("const refreshAreaScope=()=>"));
});

test('V118 no borra coordinaciones viejas incompatibles y las marca para revisar',()=>{
  const source=fs.readFileSync('src/v71-lean-management.js','utf8');
  assert.ok(source.includes('Revisar pertenencia curricular'));
  assert.ok(source.includes('Revisar: el área no coincide con sus asignaciones curriculares actuales.'));
  assert.equal(source.includes('coordinations=(r.coordinations||[]).filter(x=>coordinationCompatibility(x).ok)'),false);
});

test('V118 Excel rechaza coordinaciones de area incompatibles',()=>{
  const source=fs.readFileSync('src/v71-simple-assignment-excel.js','utf8');
  assert.ok(source.includes("if(kind==='area'&&!coordinationAreasForTeacher(t.id).includes(scope)){coordinationRejected++;continue}"));
  assert.ok(source.includes('coordinaciones rechazadas por área incompatible'));
});

test('V118 mantiene coordinacion de orientacion como circuito separado',()=>{
  const source=fs.readFileSync('src/v71-lean-management.js','utf8');
  assert.ok(source.includes("if(coord?.kind!=='area')return{ok:true,allowed:[]}"));
  assert.ok(source.includes("kind=kind==='orientation'?'orientation':'area'"));
});
