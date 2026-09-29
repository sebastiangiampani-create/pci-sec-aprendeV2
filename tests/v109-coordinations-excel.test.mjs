import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('V109 Excel masivo incluye coordinaciones de area y orientacion',()=>{
  const source=fs.readFileSync('src/v71-simple-assignment-excel.js','utf8');
  for(const needle of [
    "wb.addWorksheet('COORDINACIONES')",
    "Tipo de coordinación",
    "Ámbito",
    "Turno",
    "COORDINATION_TYPES=['Área','Orientación']",
    "COORDINATION_SHIFTS=['Sin especificar','Mañana','Tarde','Vespertino','Jornada completa']",
    "r.coordinations=Array.isArray(r.coordinations)?r.coordinations:[]",
    "coordinationKind",
    "r.coordinations.push",
    "teacherId:t.id,kind,scope,shift",
    "podés repetir un docente en varias filas"
  ]) assert.ok(source.includes(needle),needle);
});

test('V109 evita duplicar la misma coordinacion exacta al reimportar',()=>{
  const source=fs.readFileSync('src/v71-simple-assignment-excel.js','utf8');
  assert.ok(source.includes("String(x.teacherId)===String(t.id)&&x.kind===kind&&norm(x.scope)===norm(scope)&&norm(x.shift||'Sin especificar')===norm(shift)"));
});

test('V109 conserva separadas coordinacion y cargo docente',()=>{
  const source=fs.readFileSync('src/v71-simple-assignment-excel.js','utf8');
  assert.ok(source.includes("wb.addWorksheet('PLANTA DOCENTE')"));
  assert.ok(source.includes("wb.addWorksheet('ASIGNACIONES')"));
  assert.ok(source.includes("wb.addWorksheet('COORDINACIONES')"));
  assert.ok(source.includes("CARGO_OPTIONS"));
  assert.ok(source.includes("COORDINATION_TYPES"));
});
