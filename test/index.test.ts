import { build } from 'esbuild'
import vue from '../src'

test('basic', async () => {
  const result = await build({
    absWorkingDir: process.cwd(),
    bundle: true,
    write: false,
    outdir: './test/fixtures/dist',
    entryPoints: [
      './test/fixtures/a.vue'
    ],
    plugins: [vue()],
    external: ['vue']
  });

  for (const file of result.outputFiles) {
    expect(file.text).toMatchSnapshot()
  }
});
