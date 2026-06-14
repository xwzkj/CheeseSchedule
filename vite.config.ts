import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import UnoCSS from 'unocss/vite'
import Icons from 'unplugin-icons/vite'
import autoprefixer from 'autoprefixer'
// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

/**
 * PostCSS 插件：把 UnoCSS wind4 的 color-mix() 提取为原始色值
 */
const postcssStripColorMix = () => {
  // color-mix(in oklab, <color> var(--un-*), transparent) 转为 <color>
  const RE = /color-mix\(.*,(.*)var\(.*\)\s*,\s*transparent\s*\)/g
  return {
    postcssPlugin: 'postcss-strip-color-mix',
    Declaration(decl: { value: string }) {
      if (!decl.value.includes('color-mix')) return
      decl.value = decl.value.replace(RE, (_: string, colorStr: string) => {
        return colorStr
      })
    },
  }
}
postcssStripColorMix.postcss = true

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [vue(), UnoCSS(),
  Icons({
    compiler: 'vue3',
    autoInstall: true,
  })],
  css: {
    postcss: {
      plugins: [
        postcssStripColorMix(),
        autoprefixer({
          overrideBrowserslist: [
            'Chrome > 76',
          ]
        })],
    },
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
        protocol: "ws",
        host,
        port: 1421,
      }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
