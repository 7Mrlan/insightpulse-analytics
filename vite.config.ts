import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import Components from "unplugin-vue-components/vite";
import { AntDesignVueResolver } from "unplugin-vue-components/resolvers";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig(({ mode }) => {
  // 加载当前 mode 下的环境变量
  const env = loadEnv(mode, process.cwd(), "");
  return {
    base: env.VITE_BASE_URL, // 基于环境变量设置 base
    server: {
      hmr: { timeout: 5000 },
      proxy: {
        "/api": {
          target: "http://localhost:3000",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    plugins: [
      vue(),
      Components({
        resolvers: [
          AntDesignVueResolver({
            importStyle: "less",
            resolveIcons: true,
          }),
        ],
      }),
      visualizer({
        open: true,
        filename: "bundle-analysis.html",
        gzipSize: true,
        brotliSize: true,
      }),
    ],
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          modifyVars: {
            "primary-color": "#2F54EB",
            "border-radius-base": "4px",
          },
          additionalData: `@import "${path.resolve(__dirname, "src/styles/variables.less")}";`,
        },
      },
    },
    build: {
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            // 精细化vendor拆分
            if (id.includes("node_modules")) {
              if (id.includes("ant-design-vue")) {
                return "vendor_antd";
              }
              if (id.includes("echarts")) {
                return "vendor_echarts";
              }
              if (id.includes("lodash")) {
                return "vendor_lodash";
              }
              if (id.includes("vue")) {
                return "vendor_vue";
              }
              if (id.includes("date-fns")) {
                return "vendor_datefns";
              }
              return "vendor_others";
            }

            // 业务代码分割（可选）
            if (id.includes("src/views")) {
              const name = id.split("views/")[1].split("/")[0];
              if (name) return `views_${name}`;
            }
          },
        },
      },
      cssCodeSplit: true,
      reportCompressedSize: false,
    },
  };
});
