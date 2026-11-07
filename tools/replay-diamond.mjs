import {spawnSync} from 'node:child_process';
import {mkdirSync,mkdtempSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root=resolve(import.meta.dirname,'..'),update=process.argv.includes('--update');
mkdirSync(join(root,'tmp'),{recursive:true});
const cwd=mkdtempSync(join(root,'tmp','diamond-'));mkdirSync(join(cwd,'examples'));
const input=readFileSync(join(root,'examples/diamond.txt'));
assert.doesNotMatch(input.toString(),/^svg>/m);
const run=(args,commands=input)=>{
 const p=spawnSync(process.execPath,[join(root,'packages/host/dist/main.js'),...args],{cwd,input:commands});
 assert.equal(p.status,0,p.stderr?.toString());assert.equal(p.stderr.length,0);return p.stdout;
};
const a=run([]),svgA=readFileSync(join(cwd,'examples/diamond.svg'));
const b=run(['--config',join(root,'plugins.config.json')]),svgB=readFileSync(join(cwd,'examples/diamond.svg'));
assert.deepEqual(a,b);assert.deepEqual(svgA,svgB);
const text=a.toString(),xml=svgA.toString();
assert.doesNotMatch(text,/^error:/m);
assert.match(text,/rect: 2  text: 3  diamond: 1  line: 2  \(total 8, containers 4\)/);
assert.match(text,/diamond#condition.*\*/);
assert.doesNotMatch(text.split('read examples/diamond.svg (12 elements)')[1]??assert.fail('read result missing'),/\*/);
assert.match(xml,/<polygon[^>]*data-kind="diamond"[^>]*points="400,170 500,230 400,290 300,230"[^>]*fill="#ffe599"/);
const disabled=JSON.parse(readFileSync(join(root,'plugins.config.json'),'utf8'));
disabled.plugins=disabled.plugins.map(entry=>({...entry,module:entry.module.startsWith('.')?resolve(root,entry.module):entry.module,...(entry.module==='@svgframe/plugin-shape-diamond'?{enabled:false}:{})}));
const config=join(cwd,'disabled.json');writeFileSync(config,JSON.stringify(disabled));
const off=run(['--config',config],'init\ncreate rect keep 0 0 10 10\ncreate diamond d 0 0 10 10\nread examples/diamond.svg\nshow keep\nundo\nstats\n').toString();
assert.match(off,/error: unknown shape type: diamond/);assert.match(off,/error: unknown shape type: polygon/);
assert.match(off,/undone: rect#keep created/);assert.match(off,/\(total 0, containers 0\)/);
const out=join(root,'doc/transcript/optional');mkdirSync(out,{recursive:true});
if(update){
 writeFileSync(join(out,'diamond.expected.txt'),a);writeFileSync(join(out,'diamond.expected.svg'),svgA);
 writeFileSync(join(root,'examples/diamond.svg'),svgA);
}else{
 assert.deepEqual(a,readFileSync(join(out,'diamond.expected.txt')));assert.deepEqual(svgA,readFileSync(join(out,'diamond.expected.svg')));
 assert.deepEqual(svgA,readFileSync(join(root,'examples/diamond.svg')));
}
const result={input:'examples/diamond.txt',assemblies:['code','config'],sameCwd:true,stdoutBytes:a.length,svgBytes:svgA.length,
 stdoutSha256:createHash('sha256').update(a).digest('hex'),svgSha256:createHash('sha256').update(svgA).digest('hex'),
 identical:true,disabledPluginPreservesDocumentAndHistory:true};
if(update)writeFileSync(join(root,'doc/validation/diamond-assembly.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
