const { spawn } = require("child_process");

console.log("🚀 Đang khởi động Server và Cloudflare Tunnel...");

// 1. Chạy server (index.js)
const server = spawn("node", ["index.js"]);

server.stdout.on("data", (data) => {
  process.stdout.write(`[Server] ${data}`);
});

server.stderr.on("data", (data) => {
  process.stderr.write(`[Server Error] ${data}`);
});

// 2. Chạy Cloudflare tunnel
const tunnel = spawn("npx", [
  "cloudflared",
  "tunnel",
  "--url",
  "http://localhost:3000",
]);

let tunnelUrl = null;

tunnel.stderr.on("data", (data) => {
  const output = data.toString();
  // Regex để tìm URL của Cloudflare tunnel
  const match = output.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);

  if (match && !tunnelUrl) {
    tunnelUrl = match[0];
    console.log("\n" + "=".repeat(50));
    console.log("✨ MÁY CHỦ ĐÃ ĐƯỢC PUBLIC THÀNH CÔNG! ✨");
    console.log(`🔗 URL của bạn: ${tunnelUrl}`);
    console.log(`📖 Swagger UI : ${tunnelUrl}/docs`);
    console.log(`📄 Swagger JSON: ${tunnelUrl}/swagger.json`);
    console.log("=".repeat(50) + "\n");
  }

  // Nếu muốn xem log chi tiết của cloudflared thì có thể uncomment dòng dưới
  // process.stdout.write(`[Tunnel] ${output}`);
});

tunnel.on("close", (code) => {
  console.log(`Tunnel process exited with code ${code}`);
  server.kill();
  process.exit(code);
});

process.on("SIGINT", () => {
  console.log("\nStopping server and tunnel...");
  server.kill();
  tunnel.kill();
  process.exit();
});
