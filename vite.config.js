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
  // IIFE 构建后修正 HTML：将 type="module" 改为普通 script，并移至 body 末尾
  plugins: [
    {
      name: 'iife-html-fix',
      apply: 'build',
      enforce: 'post',
      transformIndexHtml: {
        order: 'post',
        handler(html) {
          // 提取 src 路径，然后构建新标签插到 </body> 前
          return html.replace(
            /<script type="module" crossorigin src="(.*?)"><\/script>/g,
            ''
          ).replace(
            '</body>',
            (match) => {
              const srcMatch = html.match(/<script type="module" crossorigin src="(.*?)"><\/script>/);
              const src = srcMatch ? srcMatch[1] : '';
              return `<script src="${src}"></script>\n</body>`;
            }
          );
        }
      }
    }
  ]
});
