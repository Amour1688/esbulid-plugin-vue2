import { getDescriptor } from './utils/descriptorCache';
import { compileTemplate } from '@vue/component-compiler-utils';
import hash from 'hash-sum';

const vueTemplateCompiler = require('vue-template-compiler');


export function transformRequireToImport(code: string): string {
  const imports: { [key: string]: string } = {};
  let strImports = '';

  code = code.replace(/require\(("(?:[^"\\]|\\.)+"|'(?:[^'\\]|\\.)+')\)/g, (_, name): any => {
    if (!(name in imports)) {
      imports[name] = `__$_require_${hash(name)}__`;
      strImports += `import ${imports[name]} from ${name}\n`;
    }

    return imports[name];
  });

  return strImports + code;
}

export function transformTemplate(
  filename: string,
) {
  const descriptor = getDescriptor(filename);

  const { template } = descriptor;

  if (!template) {
    return '';
  }


  const { code, tips = [], errors = [] } = compileTemplate({
    source: template.content,
    filename,
    compiler: vueTemplateCompiler,
    isFunctional: !!template.attrs.functional,
    optimizeSSR: false,
    prettify: false,
    preprocessLang: template.lang,
  });


  if (tips.length) {
    tips.forEach((tip) => {
      console.warn(typeof tip === 'object' ? tip.msg : tip);
    });
  }

  if (errors.length) {
    errors.forEach((error) => {
      console.error(error.toString());
    });
  }

  return `${transformRequireToImport(code)}\nexport { render, staticRenderFns }\n`;
}
