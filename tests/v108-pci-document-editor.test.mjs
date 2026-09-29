import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('V108 documento PCI usa datos automaticos y texto manual persistente',()=>{
  const source=fs.readFileSync('src/v108-pci-document-editor.js','utf8');
  const loader=fs.readFileSync('app.html','utf8');

  assert.ok(loader.includes("'src/v108-pci-document-editor.js'"));
  assert.ok(source.includes('PCIPhase2V28'));
  assert.ok(source.includes('printDocumentV108'));
  assert.ok(source.includes('manualSections'));
  assert.ok(source.includes('contenteditable="true"'));
  assert.ok(source.includes('Imprimir / PDF'));
  assert.ok(source.includes('Descargar Word'));
  assert.ok(source.includes('Mallado curricular'));
  assert.ok(source.includes('phase()?.groups?.()'));
  assert.ok(source.includes('phase()?.members?.(g)'));
  assert.ok(source.includes('phase()?.findContent?.(id)'));
  assert.ok(source.includes('plansBimestrales'));
  assert.ok(source.includes('coverage()?.formatCoverage?.(g)'));
});
