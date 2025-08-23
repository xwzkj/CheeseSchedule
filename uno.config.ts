// uno.config.ts
import { defineConfig, presetAttributify } from 'unocss'
import presetWind4 from '@unocss/preset-wind4'

export default defineConfig({
  presets: [
    presetAttributify({
      /* preset 选项 */
    }),
    presetWind4()
    // ...自定义 presets
  ]
})
