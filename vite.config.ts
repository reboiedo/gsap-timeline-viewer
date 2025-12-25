import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      include: ['src'],
      rollupTypes: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'GSAPTimelineViewer',
      fileName: 'gsap-timeline-viewer',
      formats: ['es', 'umd', 'iife'],
    },
    rollupOptions: {
      external: ['gsap'],
      output: {
        globals: {
          gsap: 'gsap',
        },
      },
    },
  },
});
