import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
export function createTypeScriptLoader(overrides = {}) {
const cache = new Map();
function loadTypeScript(url) {
  const filename = url instanceof URL ? fileURLToPath(url) : path.resolve(url);
  if (cache.has(filename)) return cache.get(filename).exports;
  const module = { exports: {} }; cache.set(filename, module);
  const nativeRequire = createRequire(filename);
  const require = name => {
    if (Object.hasOwn(overrides, name)) return overrides[name];
    if (name.startsWith('.')) {
      const base = path.resolve(path.dirname(filename), name);
      const target = base.endsWith('.js') ? base.slice(0, -3) + '.ts' : path.extname(base) ? base : base + '.ts';
      if (fs.existsSync(target)) return loadTypeScript(target);
    }
    return nativeRequire(name);
  };
  const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  new Function('require', 'exports', 'module', output)(require, module.exports, module);
  return module.exports;
}

return loadTypeScript;
}
export const loadTypeScript = createTypeScriptLoader();
