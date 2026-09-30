import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('V117 no depende de lastCell.address para autofiltros Excel',()=>{
  const source=fs.readFileSync('src/v114-plan-criteria-excel.js','utf8');
  assert.equal(source.includes('lastCell.address'),false);
  assert.ok(source.includes("crit.autoFilter={from:'A1',to:excelColumnName(crit.columnCount)+'1'}"));
  assert.ok(source.includes("load.autoFilter={from:'A1',to:excelColumnName(load.columnCount)+'1'}"));
});

test('V117 calcula columnas Excel mas alla de Z',()=>{
  const source=fs.readFileSync('src/v114-plan-criteria-excel.js','utf8');
  assert.ok(source.includes('function excelColumnName(number)'));
  assert.ok(source.includes('String.fromCharCode(65+(n%26))'));
});
