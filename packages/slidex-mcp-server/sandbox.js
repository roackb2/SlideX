import { spawn } from 'child_process';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const server = spawn('node', [join(__dirname, 'dist/server.mjs')]);

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
        console.log('✅ 伺服器初始化成功！正在查詢功能列表...');
        // 發送 initialized 通知
        server.stdin.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + '\n');
        
        // 依次查詢功能
        send("tools/list");       // ID = 2
        send("resources/list");   // ID = 3
        send("prompts/list");     // ID = 4
        send("prompts/get", { name: "skill_high_end_visual_design", arguments: { request: "幫我設計一張頂級卡片" } }); // ID = 5
      } else {
        if (msg.id === 2) {
          console.log('\n🛠️  可用的 Tools (工具):');
          console.dir(msg.result, { depth: null, colors: true });
        } else if (msg.id === 3) {
          console.log('\n📄 可用的 Resources (資源):');
          console.dir(msg.result, { depth: null, colors: true });
        } else if (msg.id === 4) {
          console.log('\n💬 可用的 Prompts (提示詞):');
          console.log('... (省略部分列表，因為剛剛已經看過了) ...');
        } else if (msg.id === 5) {
          console.log('\n✨ 測試讀取動態 Skill Prompt (skill_high_end_visual_design):');
          console.dir(msg.result, { depth: null, colors: true });
          
          // 全部查詢完畢，關閉伺服器
          setTimeout(() => server.kill(), 500);
        }
      }
    }
  } catch (e) {
    // 忽略非 JSON 的 log 輸出
  }
});

server.stderr.on('data', (data) => {
  console.error('⚠️ 伺服器日誌:', data.toString());
});

// 發送初始化請求
send("initialize", {
  protocolVersion: "2024-11-05",
  capabilities: {},
  clientInfo: { name: "sandbox", version: "1.0.0" }
});
