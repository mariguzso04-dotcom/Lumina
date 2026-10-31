const { spawn } = require('child_process');
const path = require('path');

console.log('🌙 Iniciando LÚMINA en modo desarrollo...');
console.log('🌱 Backend (API + Base de datos): http://localhost:5000');
console.log('✨ Frontend (Interfaz Web):       http://localhost:5173');
console.log('----------------------------------------------------');

const server = spawn('node', ['src/server.js'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit',
  shell: true,
  env: process.env
});

const client = spawn('npm', ['run', 'dev', '--', '--host', '0.0.0.0', '--port', '5173'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'inherit',
  shell: true,
  env: process.env
});

function cleanup() {
  console.log('\n🌙 Deteniendo servidores de LÚMINA...');
  try { server.kill(); } catch (e) {}
  try { client.kill(); } catch (e) {}
  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
