import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('V85 panel de acceso queda cargado y conserva los tres perfiles nuevos',()=>{
  const safe=fs.readFileSync('app-safe.html','utf8');
  const panel=fs.readFileSync('src/v85-access-panel.js','utf8');
  assert.match(safe,/src\/v80-access-control\.js','src\/v85-access-panel\.js'/);
  assert.match(panel,/Equipo de conducción/);
  assert.match(panel,/Coordinador/);
  assert.match(panel,/Docente/);
  assert.match(panel,/sessionStorage/);
  assert.match(panel,/Acceso de prueba/);
});

test('V85 coordinador ve todo Desarrollo Curricular y edita solo sus areas',()=>{
  const access=fs.readFileSync('src/v80-access-control.js','utf8');
  const phase2=fs.readFileSync('src/v47-phase2-matrix.js','utf8');
  assert.match(access,/['"]coordinator['"]/);
  assert.match(access,/editableAreasByOrientation/);
  assert.match(phase2,/editableAreasFor/);
  assert.match(phase2,/canViewArea/);
  assert.match(phase2,/canEditArea/);
  assert.match(phase2,/Área en modo consulta/);
});

test('V85 no reemplaza la autenticacion de backend',()=>{
  const panel=fs.readFileSync('src/v85-access-panel.js','utf8');
  assert.match(panel,/autenticación real por usuario\/email/);
  assert.doesNotMatch(panel,/password\s*=/i);
});


test('V86 coordinacion se genera desde orientaciones y excluye Otros formatos pedagogicos',()=>{
  const panel=fs.readFileSync('src/v85-access-panel.js','utf8');
  const access=fs.readFileSync('src/v80-access-control.js','utf8');
  assert.match(panel,/function orientations\(\)/);
  assert.match(panel,/state\.selected/);
  assert.match(panel,/Coordinadores por orientación/);
  assert.match(panel,/coordinatorOrientation/);
  assert.doesNotMatch(panel,/Formación Orientada','Otros formatos pedagógicos/);
  assert.match(access,/coordinatorOrientation/);
  assert.match(access,/\{\[coordinatorOrientation\]:\[\.\.\.coordinatorAreas\]\}/);
});
