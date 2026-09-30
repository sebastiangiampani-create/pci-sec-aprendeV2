import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('V116 ordena planes por orientacion nivel comision espacio y numero de plan',()=>{
  const source=fs.readFileSync('src/v114-plan-criteria-excel.js','utf8');
  for(const needle of [
    'function contextOrder(a,b)',
    "localeCompare(String(b.orientation||''),'es')",
    'Number(a.group?.year||0)-Number(b.group?.year||0)',
    "localeCompare(String(b.commission?.course||''),'es',{numeric:true})",
    'Number(a.planNumber||0)-Number(b.planNumber||0)',
    ').sort(contextOrder)'
  ]) assert.ok(source.includes(needle),needle);
});

test('V116 mantiene orden Inicio Desarrollo Curricular PCI Gestion Calificaciones',()=>{
  const source=fs.readFileSync('src/v114-plan-criteria-excel.js','utf8');
  assert.ok(source.includes("management.after(card)"));
  assert.ok(source.includes("pciList.after(card)"));
  assert.equal(source.includes('curricular.after(card)'),false);
});

test('V116 descarga Excel con loader recuperable y CDN alternativo',()=>{
  const source=fs.readFileSync('src/v114-plan-criteria-excel.js','utf8');
  for(const needle of [
    'let excelLoaderPromise=null',
    'waitExcelScript',
    'cdn.jsdelivr.net/npm/exceljs@4.4.0',
    'unpkg.com/exceljs@4.4.0',
    "prior.remove()",
    "loadExcelJS().catch(()=>{})"
  ]) assert.ok(source.includes(needle),needle);
});

test('V116 boton Excel da feedback y descarga blob xlsx',()=>{
  const source=fs.readFileSync('src/v114-plan-criteria-excel.js','utf8');
  for(const needle of [
    "trigger.textContent='Generando Excel…'",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    'URL.createObjectURL(blob)',
    'a.click()',
    "toast('No se pudo descargar el Excel. '",
    "trigger.textContent=originalText"
  ]) assert.ok(source.includes(needle),needle);
});

test('V116 conserva las tres hojas PLAN CRITERIOS CARGA',()=>{
  const source=fs.readFileSync('src/v114-plan-criteria-excel.js','utf8');
  for(const sheet of ["wb.addWorksheet('PLAN')","wb.addWorksheet('CRITERIOS')","wb.addWorksheet('CARGA')"])assert.ok(source.includes(sheet),sheet);
});
