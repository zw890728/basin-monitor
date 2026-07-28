import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  base: process.env.VITE_BASE || './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        format: 'iife',
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash][extname]'
      }
    }
  },
  // IIFE 构建后 HTML 中仍会输出 type="module"，用插件修正为普通 script 标签
  plugins: [
    {
      name: 'iife-html-fix',
      apply: 'build',
      enforce: 'post',
      transformIndexHtml: {
        order: 'post',
        handler(html) {
          return html.replace(
            /<script type="module" crossorigin src="(.*?)"><\/script>/g,
            '<script src="$1"></script>'
          );
        }
      }
    }
  ]
});
