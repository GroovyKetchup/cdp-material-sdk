import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(scriptDir, '..');

await build({
  configFile: false,
  root: packageRoot,
  publicDir: false,
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    copyPublicDir: false,
    lib: {
      entry: {
        index: resolve(packageRoot, 'src/index.ts'),
        portable: resolve(packageRoot, 'src/portable.ts'),
        'host-react': resolve(packageRoot, 'src/host-react.ts'),
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', 'zustand'],
    },
  },
});
