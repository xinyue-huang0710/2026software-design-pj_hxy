import {spawnSync} from 'node:child_process';
import {mkdirSync,mkdtempSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import assert from 'node:assert/strict';
const root=resolve(import.meta.dirname,'..'),update=process.argv.includes('--update'),out=join(root,'doc/transcript/phase2');
mkdirSync(join(root,'tmp'),{recursive:true});
const cwd=mkdtempSync(join(root,'tmp','replay-'));
for(const name of ['docs','examples','plugins'])mkdirSync(join(cwd,name));
writeFileSync(join(cwd,'.hidden'),'fixture');writeFileSync(join(cwd,'file.txt'),'fixture');
writeFileSync(join(cwd,'examples/other.svg'),readFileSync(join(root,'examples/other.svg')));
const cases=[['session','doc/transcript/phase1/session.txt','examples/demo.svg'],['flowchart','doc/transcript/phase1/flowchart.txt','examples/flowchart.svg'],['box','doc/transcript/phase2/box.txt','examples/flowchart-box.svg'],['commands','doc/transcript/phase2/commands.txt','examples/commands.svg']];
const results=[];
for(const[name,file,saved]of cases){
 const input=readFileSync(join(root,file));
 assert.doesNotMatch(input.toString(),/^svg>/m,'input must contain commands only');
 const run=args=>{
  const p=spawnSync(process.execPath,[join(root,'packages/host/dist/main.js'),...args],{cwd,input});
  assert.equal(p.status,0,p.stderr?.toString());return {stdout:p.stdout,svg:readFileSync(join(cwd,saved))};
 };
 const a=run([]),b=run(['--config',join(root,'plugins.config.json')]);assert.deepEqual(a,b,'assembly mismatch: '+name);
 const text=a.stdout.toString();
 if(name==='box'){assert.match(text,/box#n2 label restored: "处理数据"/);assert.match(text,/g#n1 \(box\) \*/);assert.match(text,/rect: 2  text: 2  line: 1  \(total 5, containers 3\)/);assert.match(a.svg.toString(),/data-kind="box"/);}
 if(name==='commands'){assert.match(text,/\[DIR\]  docs\n\[DIR\]  examples\n\[DIR\]  plugins\n\[FILE\]  \.hidden\n\[FILE\]  file.txt/);assert.match(text,/circle: 1  rect: 1  \(total 2, containers 1\)/);}
 if(name!=='session')assert.doesNotMatch(text,/^error:/m);
 if(update){writeFileSync(join(out,name+'.expected.txt'),a.stdout);writeFileSync(join(out,name+'.expected.svg'),a.svg);}
 else{assert.deepEqual(a.stdout,readFileSync(join(out,name+'.expected.txt')));assert.deepEqual(a.svg,readFileSync(join(out,name+'.expected.svg')));}
 results.push({name,assemblies:['code','config'],stdoutBytes:a.stdout.length,svgBytes:a.svg.length,identical:true});
}
console.log(JSON.stringify(results,null,2));
if(update)writeFileSync(join(root,'doc/validation/dual-assembly.json'),JSON.stringify({scope:'compiled CLI, same cwd and plugin order; logs outside cwd; fixtures unchanged at directory-listing level',results},null,2)+'\n');
