import fs from 'fs';
import path from 'path';
import { Loader, Plugin as ESBuildPlugin } from 'esbuild';
import hash from 'hash-sum';
import { transformSFC } from './sfc';
import { componentNormalizerPath, normalizeComponentCode } from './runtime/componentNormalizer';
import { transformTemplate } from './template';
import { getDescriptor } from './utils/descriptorCache';
import { transformStyle } from './style';

const NAME = 'esbuild-plugin-vue2';


const removeQuery = (p: string) => p.replace(/\?.+$/, '');
export interface Options {
  sourceRoot?: string;
}

export default (ops: Options = {}): ESBuildPlugin => {
  const sourceRoot = ops.sourceRoot || process.cwd();

  return {
    name: NAME,

    setup(build) {
      build.onResolve({ filter: /\?virtual/ }, (args) => {
        return {
          path: args.path,
          namespace: 'vue:virtual',
        };
      });

      build.onResolve({ filter: /\.vue$/ }, args => {
        return {
          path: args.path,
          namespace: 'vue',
        };
      });


      build.onResolve({ filter: /\?vue&type=template/ }, (args) => {
        return {
          path: args.path,
          namespace: 'vue',
        };
      });

      build.onResolve({ filter: /\?vue&type=script/ }, args => {
        return {
          path: args.path,
          namespace: 'vue',
        };
      });

      build.onResolve({ filter: /\?vue&type=style/ }, args => {
        return {
          path: args.path,
          namespace: 'vue',
        };
      });

      build.onLoad({ filter: /\?virtual/, namespace: 'vue:virtual' }, (args) => {
        if (args.path === componentNormalizerPath) {
          return {
            contents: normalizeComponentCode,
          };
        }
      });

      build.onLoad({ filter: /\.vue$/, namespace: 'vue' }, args => {
        const content = fs.readFileSync(args.path, 'utf-8').toString();

        const shortFilePath = path
          .relative(sourceRoot, args.path)
          .replace(/^(\.\.[\/\\])+/, '')
          .replace(/\\/g, '/');

        const scopeId = hash(shortFilePath);

        const { code } = transformSFC(args.path, content, sourceRoot, scopeId);

        return {
          contents: code,
          resolveDir: path.dirname(args.path),
        };
      });

      build.onLoad({ filter: /\?vue&type=template/, namespace: 'vue' }, args => {
        const originPath = removeQuery(args.path);
        const code = transformTemplate(originPath);

        return {
          contents: code,
          loader: 'js',
        };
      });

      build.onLoad({ filter: /\?vue&type=script/, namespace: 'vue' }, args => {
        const originPath = removeQuery(args.path);
        const descriptor = getDescriptor(originPath);

        return {
          contents: descriptor.script.content,
          loader: descriptor.script.lang as Loader,
        };
      });

      build.onLoad({ filter: /\?vue&type=style/, namespace: 'vue' }, args => {
        const originPath = removeQuery(args.path);

        const { code, loader = 'css' } =  transformStyle(originPath, 'x', 0);

        return {
          contents: code,
          loader: loader as Loader,
        };
      });
    },
  };
};
