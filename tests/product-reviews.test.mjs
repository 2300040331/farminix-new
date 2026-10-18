import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
const require = createRequire(import.meta.url);
const source=ts.transpileModule(fs.readFileSync(new URL('../src/components/ProductReviews.tsx',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
const exports={};new Function('require','exports',source)(require,exports);
const render=reviews=>renderToStaticMarkup(createElement(exports.ProductReviews,{reviews}));
test('empty product reviews render no fabricated content',()=>assert.equal(render([]),''));
test('legacy, incomplete, and disabled reviews stay hidden',()=>{
 const review={id:'unit-test',userName:'Test fixture',comment:'Unit test only',rating:4,date:'',source:'admin'};
 assert.equal(render([{...review,source:undefined}]),'');
 assert.equal(render([{...review,enabled:false}]),'');
 assert.equal(render([{...review,comment:''}]),'');
});
test('admin review renders in a marquee with a hidden duplicate for continuous scrolling',()=>{
 const html=render([{id:'unit-test',userName:'Test fixture',comment:'Unit test only',rating:4,date:'',source:'admin'}]);
 assert.match(html,/review-marquee-track/);assert.match(html,/aria-hidden="true"/);assert.match(html,/4 out of 5 stars/);assert.match(html,/Focus or hover to pause/);
});
