import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('V85 panel de acceso queda cargado y conserva los tres perfiles nuevos',()=>{
  const app=fs.readFileSync('app.html','utf8');
  const panel=fs.readFileSync('src/v85-access-panel.js','utf8');
  assert.match(app,/src\/v80-access-control\.js/);
  assert.match(app,/src\/v85-access-panel\.js/);
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


test('V95 coordinaciones se originan en Gestion y el acceso consume esos permisos',()=>{
  const panel=fs.readFileSync('src/v85-access-panel.js','utf8');
  const access=fs.readFileSync('src/v80-access-control.js','utf8');
  const management=fs.readFileSync('src/v71-lean-management.js','utf8');
  assert.match(panel,/Ingresar con coordinaciones de Gestión/);
  assert.match(panel,/coordinatorOptions/);
  assert.match(access,/coordinatorEditableAreasByOrientation/);
  assert.match(management,/Coordinación de área/);
  assert.match(management,/Coordinación de orientación/);
  assert.doesNotMatch(management,/Otros formatos pedagógicos/);
});
