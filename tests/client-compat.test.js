import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const {outputText}=ts.transpileModule(fs.readFileSync(new URL('../src/fetchWithTimeout.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext}});
const {fetchWithTimeout}=await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
test('Safari-compatible fetch clears its timer after success',async()=>{
 const oldFetch=globalThis.fetch;let cleared=false;
 globalThis.window={setTimeout:()=>42,clearTimeout:id=>{assert.equal(id,42);cleared=true;}};
 globalThis.fetch=async(_url,options)=>{assert.ok(options.signal instanceof AbortSignal);return new Response('ok');};
 try{const r=await fetchWithTimeout('/api/contact',{method:'POST'},1000);assert.equal(await r.text(),'ok');assert.equal(cleared,true);}finally{globalThis.fetch=oldFetch;delete globalThis.window;}
});
test('Safari-compatible fetch aborts stalled requests without AbortSignal.timeout',async()=>{
 const oldFetch=globalThis.fetch;globalThis.window={setTimeout,clearTimeout};
 globalThis.fetch=(_url,options)=>new Promise((_,reject)=>options.signal.addEventListener('abort',()=>reject(new DOMException('Timed out','AbortError'))));
 try{await assert.rejects(fetchWithTimeout('/api/smile',{},5),{name:'AbortError'});}finally{globalThis.fetch=oldFetch;delete globalThis.window;}
});
