const fs = require('fs');
const path = require('path');

console.log('🔄 Starting conversion from whatsapp-web.js to Baileys...');

// Read source files
const temp = fs.readFileSync('app.js.temp', 'utf8');
const baileys = fs.readFileSync('../wa-socket-baileys/wa-socket-baileys/app.js', 'utf8');

console.log('📄 Files loaded. Starting conversion...');

// Extract Baileys setup (first ~1200 lines)
const baileysSetup = baileys.split('\n').slice(0, 1200).join('\n');

// Start building the new app.js
let result = baileysSetup;

// Extract routes from app.js.temp (starting from line 175 where wa1Router is defined)
const tempLines = temp.split('\n');
const routesStartIndex = tempLines.findIndex(line => line.includes('const wa1Router = express.Router()'));
const routesEndIndex = tempLines.findIndex((line, idx) => idx > routesStartIndex && line.includes('module.exports'));

if (routesStartIndex !== -1 && routesEndIndex !== -1) {
  const routes = tempLines.slice(routesStartIndex, routesEndIndex).join('\n');

  // Replace whatsapp-web.js specific code with Baileys equivalents
  let convertedRoutes = routes
    .replace(/const \{ Client, LocalAuth, MessageMedia \} = require\('whatsapp-web\.js'\);/g, '// Baileys imports already in setup')
    .replace(/client\.getState\(\)/g, 'connectionState')
    .replace(/await client\.getState\(\)/g, 'connectionState')
    .replace(/client\.sendMessage\(/g, 'sock.sendMessage(')
    .replace(/client\.initialize\(\)/g, 'connectToWhatsApp()')
    .replace(/client\.logout\(\)/g, 'sock ? await sock.logout() : null')
    .replace(/result\.id\._serialized/g, 'result.key.id')
    .replace(/message\.id\._serialized/g, 'msg.key.id')
    .replace(/@c\.us/g, '@s.whatsapp.net')
    .replace(/\.wwebjs_auth/g, 'auth_info_baileys')
    .replace(/new MessageMedia\(/g, '// Baileys: Use buffer directly')
    .replace(/message\.downloadMedia\(\)/g, '// Baileys: Use downloadMediaMessage helper')
    .replace(/client\.on\('message'/g, "// Baileys: Use sock.ev.on('messages.upsert')")
    .replace(/client\.on\('qr'/g, "// Baileys: QR handled in connection.update")
    .replace(/client\.on\('ready'/g, "// Baileys: Ready handled in connection.update")
    .replace(/client\.info/g, 'sock?.user')
    .replace(/client\.pupPage/g, '// Baileys: No puppeteer page')
    .replace(/client\.getContactLidAndPhone/g, '// Baileys: Use sock.onWhatsApp or other methods');

  // Append converted routes
  result += '\n\n// ============================================\n';
  result += '// Routes from wa-socket-v1 (converted to Baileys)\n';
  result += '// ============================================\n\n';
  result += convertedRoutes;

  // Add module.exports
  result += '\n\nmodule.exports = { sock, io };';

  console.log('✅ Conversion completed!');
  console.log('📝 Writing app.js...');

  fs.writeFileSync('app.js', result);

  console.log('✅ File app.js created successfully!');
  console.log(`📊 File size: ${(result.length / 1024).toFixed(2)} KB`);
} else {
  console.error('❌ Could not find routes section in app.js.temp');
  process.exit(1);
}
