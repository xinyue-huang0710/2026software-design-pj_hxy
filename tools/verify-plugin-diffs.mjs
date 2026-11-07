import {execFileSync} from 'node:child_process';import {mkdirSync,writeFileSync} from 'node:fs';import {resolve,join} from 'node:path';import assert from 'node:assert/strict';
const root=resolve(import.meta.dirname,'..'),git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8'});
const proofs=[{mode:'A',commit:'e00d2ff',allowed:'packages/host/src/composition/codePlugins.ts'},{mode:'B',commit:'dbcfd3a',allowed:'plugins.config.json'}];
const result=proofs.map(({mode,commit,allowed})=>{
 const full=git('rev-parse',commit).trim(),parent=git('rev-parse',commit+'^').trim();
 const directories=['packages/core','packages/host/src/loading','plugins/builtin-shapes','plugins/builtin-commands','plugins/command-stats','plugins/command-dir'];
 for(const dir of directories){git('cat-file','-e',parent+':'+dir);git('cat-file','-e',full+':'+dir);}
 const changes=git('diff','--name-status',parent,full).trim().split('\n').map(line=>{const[status,...path]=line.split('\t');return {status,path:path.join('\t')};});
 for(const change of changes){
  if(change.path.startsWith('plugins/shape-box/')){assert.equal(change.status,'A');continue;}
  if(change.path===allowed||change.path==='package-lock.json'||change.path.endsWith('package.json')||change.path.startsWith('tests/')||change.path.startsWith('doc/'))continue;
  assert.fail('unexpected modification: '+change.path);
 }
 assert.equal(git('diff',parent,full,'--',...directories),'');
 if(mode==='B')assert.equal(git('diff',parent,full,'--','packages/host'),'');
 return {mode,commit:full,parent,changes,existingKernelLoaderAndPluginsChanged:false,verifiedDirectories:directories,newPluginTree:git('rev-parse',full+':plugins/shape-box').trim()};
});
assert.equal(result[0].parent,result[1].parent);assert.equal(result[0].newPluginTree,result[1].newPluginTree);
mkdirSync(join(root,'doc/validation'),{recursive:true});writeFileSync(join(root,'doc/validation/plugin-diff-proof.json'),JSON.stringify(result,null,2)+'\n');console.log('A/B commit proofs verified; same base and identical plugin tree.');
