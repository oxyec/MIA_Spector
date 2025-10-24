import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// ===============================
// Vite 配置：前后端联调
// ===============================
export default defineConfig({
  plugins: [react()],

  // 前端开发服务器配置
  server: {
    port: 5173, // Vite 默认端口
    strictPort: true, // 如果 5173 被占用，不要换端口，直接报错
    host: "localhost", // 可改成 0.0.0.0 以便局域网访问

    // 代理规则（关键部分）
    proxy: {
      // 所有以 /api 开头的请求都转发到 FastAPI 后端
      "/api": {
        target: "http://127.0.0.1:8080", // 后端地址
        changeOrigin: true,              // 改写源（必要）
        rewrite: (path) => path.replace(/^\/api/, ""), // 去掉 /api 前缀
      },
    },
  },

  // 构建配置
  build: {
    outDir: "dist", // 构建输出目录
    sourcemap: true, // 保留 source map 方便调试
  },
});
