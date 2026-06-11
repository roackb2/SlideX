import { spawn } from 'child_process';
import readline from 'readline';

console.log('🚀 正在透過 npx 下載並啟動 @z7589xxz758/slidex-mcp-server@latest ...');
const server = spawn('npx', ['-y', '@z7589xxz758/slidex-mcp-server@latest']);

const rl = readline.createInterface({
  input: server.stdout,
  terminal: false
});

let messageId = 1;

function send(method, params = {}) {
  const req = {
    jsonrpc: "2.0",
    id: messageId++,
    method,
    params
  };
  server.stdin.write(JSON.stringify(req) + '\n');
}

rl.on('line', (line) => {
  try {
    const msg = JSON.parse(line);
    if (msg.method) {
      // Server sent a notification or request
    } else if (msg.id) {
      if (msg.id === 1) {
        console.log('✅ NPM 版本伺服器初始化成功！正在查詢功能列表...');
        server.stdin.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + '\n');
        
        send("tools/list");       // ID = 2
        send("resources/list");   // ID = 3
        send("prompts/list");     // ID = 4
      } else {
        if (msg.id === 2) {
          console.log('\n🛠️  可用的 Tools (工具):');
          console.dir(msg.result, { depth: null, colors: true });
        } else if (msg.id === 3) {
          console.log('\n📄 可用的 Resources (資源):');
          console.dir(msg.result, { depth: null, colors: true });
        } else if (msg.id === 4) {
          console.log('\n💬 可用的 Prompts (提示詞):');
          console.dir(msg.result, { depth: null, colors: true });
          
          setTimeout(() => server.kill(), 500);
        }
      }
    }
  } catch (e) {
    // ignore
  }
});

server.stderr.on('data', (data) => {
  console.error('⚠️ npx 伺服器日誌:', data.toString());
});

server.on('error', (err) => {
  console.error('❌ 無法啟動 npx:', err);
});

// 發送初始化請求
send("initialize", {
  protocolVersion: "2024-11-05",
  capabilities: {},
  clientInfo: { name: "npx-sandbox", version: "1.0.0" }
});
