import {execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const [base='a51d6f9',target='HEAD',output='doc/validation/diamond-diff-proof.json']=process.argv.slice(2);
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const before=git('rev-parse',base+'^{}'),after=git('rev-parse',target+'^{}');
git('cat-file','-e',after+':plugins/shape-diamond');
const existing=git('ls-tree','--name-only',before+':plugins').split('\n').map(n=>'plugins/'+n);
const unchanged=['packages/core','packages/host/src/loading','packages/host/src/cli','packages/host/src/io',...existing];
for(const dir of unchanged){git('cat-file','-e',before+':'+dir);git('cat-file','-e',after+':'+dir);}
assert.equal(git('diff',before,after,'--',...unchanged),'');
const changes=git('diff','--name-status',before,after).split('\n').map(l=>{const[status,path]=l.split('\t');return{status,path};});
const changedExistingRuntime=changes.filter(c=>c.path.startsWith('packages/')&&c.path.includes('/src/'));
assert.deepEqual(changedExistingRuntime,[{status:'M',path:'packages/host/src/composition/codePlugins.ts'}]);
assert.ok(changes.some(c=>c.path==='plugins.config.json'));
for(const c of changes.filter(c=>c.path.startsWith('plugins/shape-diamond/')))assert.equal(c.status,'A');
const result={base:before,target:after,unchangedDirectories:unchanged,existingKernelLoaderRendererAndPluginsChanged:false,
 changedExistingRuntime,changes};
mkdirSync('doc/validation',{recursive:true});writeFileSync(output,JSON.stringify(result,null,2)+'\n');
console.log('Diamond proof passed: existing core, loader, renderer and plugins unchanged; only composition runtime changed.');
