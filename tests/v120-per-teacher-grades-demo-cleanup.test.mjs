import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('V120 CARGA genera una columna por criterio y por docente',()=>{
  const source=fs.readFileSync('src/v114-plan-criteria-excel.js','utf8');
  assert.ok(source.includes("const gradeTeachers=teachers.length?teachers"));
  assert.ok(source.includes("const criterionLoadColumns=visibleCriteria.flatMap((c,i)=>gradeTeachers.map((t,j)=>({"));
  assert.ok(source.includes("header:`Criterio ${i+1} · ${c.text} · ${t.name||'Docente'}`"));
  assert.ok(source.includes("key:`c${i+1}_t${j+1}`"));
  assert.ok(source.includes("const statusCol=5+criterionLoadColumns.length+1"));
});

test('V120 informa que CARGA tiene casillero por criterio y docente',()=>{
  const source=fs.readFileSync('src/v114-plan-criteria-excel.js','utf8');
  assert.ok(source.includes('Listado de estudiantes con un casillero por criterio y por docente.'));
});

test('V120 limpia alumnos persistidos solo en Escuela Muestra una sola vez',()=>{
  const source=fs.readFileSync('src/v72-students-commissions.js','utf8');
  assert.ok(source.includes('function clearDemoStudentsOnce()'));
  assert.ok(source.includes("if(r.demoStudentsClearedV120)return 0"));
  assert.ok(source.includes("if(norm(state.school)!=='escuela muestra')return 0"));
  assert.ok(source.includes('r.students={}'));
  assert.ok(source.includes('c.students=[]'));
  assert.ok(source.includes('r.demoStudentsClearedV120=true'));
});

test('V120 no altera futuras importaciones reales de estudiantes',()=>{
  const source=fs.readFileSync('src/v72-students-commissions.js','utf8');
  assert.ok(source.includes('async function importStudents(key,file)'));
  assert.ok(source.includes('root().students[dni]'));
  assert.ok(source.includes('commission.students=[...new Set(newIds)]'));
});
