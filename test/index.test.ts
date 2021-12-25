import { build } from 'esbuild'
import path from 'path'
import vue from '../src'

test('basic', async () => {
  const result = await build({
    bundle: true,
    write: false,
    outdir: path.join(__dirname, './fixtures/dist'),
    entryPoints: [
      path.join(__dirname, './fixtures/a.vue')
    ],
    plugins: [vue()],
    external: ['vue']
  });

  for (const file of result.outputFiles) {
    expect(file.text).toMatchSnapshot()
  }
});
