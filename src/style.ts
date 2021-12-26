import { compileStyle } from '@vue/component-compiler-utils';
import { getDescriptor } from './utils/descriptorCache';

export function transformStyle(
  filename: string,
  id: string,
  index: number,
) {
  const descriptor = getDescriptor(filename);
  const block = descriptor.styles[index];

  const { code, errors } = compileStyle({
    source: block.content,
    filename,
    id: `data-v-${id}`,
    scoped: !!block.scoped,
    trim: true,
  });

  if (errors.length) {
    errors.forEach((error) => {
      console.error(`transform error. message: ${error}`);
    });
  }

  return {
    code,
    loader: block.lang,
  };
}
