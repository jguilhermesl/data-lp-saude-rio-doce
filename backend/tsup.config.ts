import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'], // Entry point principal
  outDir: 'dist',
  format: ['cjs'], // CommonJS (conforme package.json type: "commonjs")
  clean: true, // Limpa o diretório dist antes de compilar
  sourcemap: true,
  minify: false,
  splitting: false,
  dts: false, // Não gera arquivos de definição de tipos
  shims: true, // Adiciona shims para __dirname e __filename em ESM
  target: 'es2020',
  noExternal: [/.*/], // Bundle todas as dependências (funciona bem com bcryptjs)
  onSuccess: 'echo "✅ Build concluído com sucesso!"',
});
