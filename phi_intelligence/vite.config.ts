import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  // Load environment variables from current directory
  const env = loadEnv(mode, __dirname, '');
  
  // Filter only VITE_ prefixed variables for client
  const clientEnv = Object.keys(env).reduce((prev, key) => {
    if (key.startsWith('VITE_')) {
      prev[`import.meta.env.${key}`] = JSON.stringify(env[key]);
    }
    return prev;
  }, {} as Record<string, string>);

  return {
    root: path.resolve(__dirname, "client"),
    publicDir: path.resolve(__dirname, "client", "public"),
    appType: "spa",
    plugins: [
      react(),
      ...(process.env.NODE_ENV === 'development' ? [runtimeErrorOverlay()] : []),
      ...(process.env.NODE_ENV !== "production" &&
      process.env.REPL_ID !== undefined
        ? [
            import("@replit/vite-plugin-cartographer").then((m) =>
              m.cartographer(),
            ),
          ]
        : []),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client", "src"),
        "@shared": path.resolve(__dirname, "shared"),
        "@assets": path.resolve(__dirname, "attached_assets"),
        "@three": path.resolve(__dirname, "client", "src", "components", "three"),
        "@config": path.resolve(__dirname, "client", "src", "config"),
      },
    },
    build: {
      outDir: path.resolve(__dirname, "dist"),
      emptyOutDir: true,
      sourcemap: process.env.NODE_ENV === 'development',
      minify: process.env.NODE_ENV === 'production',
      rollupOptions: {
        output: {
          manualChunks: {
            three: ['three', '@react-three/fiber', '@react-three/drei'],
            livekit: ['@livekit/components-react', 'livekit-client'],
            gsap: ['gsap'],
            vendor: ['react', 'react-dom'],
          },
        },
      },
    },
    server: {
      host: true,
      port: 5173,
      strictPort: true,
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
    },
    optimizeDeps: {
      include: ['three', '@react-three/fiber', '@react-three/drei', 'gsap'],
    },
    assetsInclude: ['**/*.glb', '**/*.gltf', '**/*.fbx', '**/*.obj'],
    // Define environment variables for client
    define: clientEnv,
  };
});