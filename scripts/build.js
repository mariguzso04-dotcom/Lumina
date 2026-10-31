const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🌙 [LÚMINA] Iniciando compilación para Netlify y producción...');

const rootDir = path.resolve(__dirname, '..');
const clientDir = path.join(rootDir, 'client');
const clientDist = path.join(clientDir, 'dist');
const rootDist = path.join(rootDir, 'dist');

// 1. Asegurar instalación de dependencias en client si no existen
if (!fs.existsSync(path.join(clientDir, 'node_modules'))) {
  console.log('📦 Instalando dependencias de frontend (client)...');
  execSync('npm install', { cwd: clientDir, stdio: 'inherit' });
}

// 2. Compilar frontend con Vite
console.log('⚡ Compilando aplicación con Vite...');
execSync('npm run build', { cwd: clientDir, stdio: 'inherit' });

// 3. Copiar client/dist a la carpeta dist de la raíz
console.log('📂 Sincronizando carpeta dist en la raíz...');
if (!fs.existsSync(rootDist)) {
  fs.mkdirSync(rootDist, { recursive: true });
}

function copyRecursive(src, dest) {
  if (fs.statSync(src).isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const child of fs.readdirSync(src)) {
      copyRecursive(path.join(src, child), path.join(dest, child));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

copyRecursive(clientDist, rootDist);

// 4. Copiar _redirects tanto a dist/ como a la raíz
const redirectsContent = '/*    /index.html   200\n';
fs.writeFileSync(path.join(rootDist, '_redirects'), redirectsContent);
fs.writeFileSync(path.join(clientDist, '_redirects'), redirectsContent);
fs.writeFileSync(path.join(rootDir, '_redirects'), redirectsContent);

// 5. Copiar index.html, favicon y assets a la carpeta raíz para máxima compatibilidad
if (fs.existsSync(path.join(rootDist, 'index.html'))) {
  fs.copyFileSync(path.join(rootDist, 'index.html'), path.join(rootDir, 'index.html'));
  console.log('✨ [LÚMINA] index.html sincronizado en la carpeta raíz.');
}

if (fs.existsSync(path.join(rootDist, 'favicon.svg'))) {
  fs.copyFileSync(path.join(rootDist, 'favicon.svg'), path.join(rootDir, 'favicon.svg'));
}

if (fs.existsSync(path.join(rootDist, 'assets'))) {
  copyRecursive(path.join(rootDist, 'assets'), path.join(rootDir, 'assets'));
  console.log('✨ [LÚMINA] Carpeta assets sincronizada en la raíz.');
}

console.log('✅ [LÚMINA] Compilación completada con éxito.');
console.log(`   - Carpeta dist raíz:   ${rootDist}`);
console.log(`   - index.html en raíz:  ${path.join(rootDir, 'index.html')}`);
