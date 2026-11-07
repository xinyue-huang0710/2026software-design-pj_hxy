import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';import {join,resolve} from 'node:path';import {spawnSync} from 'node:child_process';
import type {DirectoryEntry,DirectoryReader} from '@svgframe/core';
import {DirCommand} from '../../plugins/command-dir/src/DirCommand.js';
import {NodeDirectoryAdapter} from '../../plugins/command-dir/src/NodeDirectoryAdapter.js';
import {EditorRuntime} from '../../packages/host/src/EditorRuntime.js';
import {CliApplication} from '../../packages/host/src/cli/CliApplication.js';
import {CommandDispatcher} from '../../packages/host/src/cli/CommandDispatcher.js';
import {TreeFormatter} from '../../packages/host/src/cli/TreeFormatter.js';
test('dir standalone substitute handles sorting, hidden names, empty, special entries and failure',async()=>{
  const entries:DirectoryEntry[]=[{name:'z',kind:'file'},{name:'b',kind:'directory'},{name:'.hidden',kind:'file'},{name:'a',kind:'directory'},{name:'ln',kind:'link'},{name:'pipe',kind:'other'}];
  const reader:DirectoryReader={currentDirectory:()=>'/fixed',read:async p=>{assert.equal(p,'/fixed');return entries;}};
  assert.deepEqual((await new DirCommand(reader).execute()).lines,['[DIR]  a','[DIR]  b','[FILE]  .hidden','[FILE]  z','[LINK]  ln','[OTHER]  pipe']);
  assert.equal(entries[0]!.name,'z');
  assert.deepEqual((await new DirCommand({...reader,read:async()=>[]}).execute()).lines,['(empty directory)']);
  assert.deepEqual((await new DirCommand({...reader,read:async()=>{throw Error('denied');}}).execute()).lines,['error: cannot read directory: /fixed']);
});
test('dir real adapter runs without document, never changes history, document or process cwd on success/failure',async()=>{
  const cwd=process.cwd(),folder=mkdtempSync(join(tmpdir(),'svg-dir-'));mkdirSync(join(folder,'b'));writeFileSync(join(folder,'.hidden'),'');writeFileSync(join(folder,'a.svg'),'');
  const reader=new NodeDirectoryAdapter(()=>folder),r=new EditorRuntime(),cli=new CliApplication(new CommandDispatcher(r.registry.commands,r.context),r.invoker,new TreeFormatter());
  assert.deepEqual((await r.invoker.executeCommand(new DirCommand(reader))).lines,['[DIR]  b','[FILE]  .hidden','[FILE]  a.svg']);
  assert.deepEqual(r.history.state,{undo:0,redo:0,blocked:true});
  await cli.executeLine('init');await cli.executeLine('create g a');await cli.executeLine('undo');
  const content=JSON.stringify(r.session.contentSnapshot()),hs=r.history.state;
  for(const port of [reader,new NodeDirectoryAdapter(()=>join(folder,'missing'))]){
    await r.invoker.executeCommand(new DirCommand(port));
    assert.equal(JSON.stringify(r.session.contentSnapshot()),content);assert.deepEqual(r.history.state,hs);assert.equal(process.cwd(),cwd);
  }
  assert.deepEqual(await cli.executeLine('redo'),['redone: g#a created']);
});
test('two assemblies expose both commands/help and produce byte-identical dir output in fixed cwd',()=>{
  const folder=mkdtempSync(join(tmpdir(),'svg-modes-'));mkdirSync(join(folder,'d'));writeFileSync(join(folder,'.h'),'');writeFileSync(join(folder,'a'),'');
  const main=resolve('packages/host/dist/main.js'),input='dir\nhelp\ninit\nstats\ncreate g g\nstats\ndir\n';
  const run=(args:string[])=>{const r=spawnSync(process.execPath,[main,...args],{cwd:folder,input,encoding:'utf8'});assert.equal(r.status,0,r.stderr);return r.stdout;};
  const a=run([]),b=run(['--config',resolve('plugins.config.json')]);assert.equal(a,b);
  assert.match(a,/\[DIR\]  d\n\[FILE\]  \.h\n\[FILE\]  a/);
  assert.match(a,/stats —/);assert.match(a,/dir —/);
  const off=run(['--builtin-only']);assert.match(off,/error: unknown command: dir/);assert.match(off,/error: unknown command: stats/);
  assert.doesNotMatch(off,/stats —|dir —/);
});
