import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

const server = spawn('node', ['dist/server.mjs']);
const rl = readline.createInterface({ input: server.stdout, terminal: false });

let messageId = 1;
function send(method, params = {}) {
  server.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: messageId++, method, params }) + '\n');
}

// 這是一段測試用的 SlideX MDX 語法
const sampleMdx = `
<Slide>
  <Text h={20} w={80} x={10} y={40} fontSize={60} fontWeight="bold" color="#ffffff">
    Sandbox Test Successful 🚀
  </Text>
  <Text h={10} w={80} x={10} y={60} fontSize={30} color="#aaaaaa">
    Generated via SlideX MCP Server tools/call
  </Text>
</Slide>
`;

rl.on('line', (line) => {
  try {
    const msg = JSON.parse(line);
    if (msg.id === 1) {
      server.stdin.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + '\n');
      console.log('✅ 伺服器初始化成功！正在測試工具：slidex_export_html ...');
      
      // 呼叫 MCP 的匯出工具
      send("tools/call", {
        name: "slidex_export_html",
        arguments: {
          source: sampleMdx,
          title: "Sandbox Test Presentation"
        }
      });
    } else if (msg.id === 2) {
      if (msg.result && msg.result.content && msg.result.content.length > 0) {
        // MCP 工具回傳的是 JSON 字串，需要先 Parse 才能拿到真正的 html 屬性
        const toolResult = JSON.parse(msg.result.content[0].text);
        const html = toolResult.html;
        
        // 將結果寫入桌面
        const outPath = path.join(process.env.HOME, 'Desktop', 'sandbox-test.html');
        fs.writeFileSync(outPath, html);
        console.log('\\n🎉 成功透過 MCP 匯出簡報！');
        console.log('檔案已儲存至：' + outPath);
      } else {
        console.log('❌ 生成失敗', JSON.stringify(msg, null, 2));
      }
      setTimeout(() => server.kill(), 500);
    }
  } catch (e) {}
});

server.stderr.on('data', (data) => {
  // console.error('⚠️ STDERR:', data.toString());
});

// 開始初始化
send("initialize", {
  protocolVersion: "2024-11-05",
  capabilities: {},
  clientInfo: { name: "sandbox", version: "1.0.0" }
});
