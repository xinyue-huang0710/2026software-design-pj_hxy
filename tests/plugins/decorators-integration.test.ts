import {test} from 'node:test';import assert from 'node:assert/strict';
import BoxPlugin from '../../plugins/shape-box/src/index.js';
import BoxTypePlugin from '../../plugins/tree-box-label/src/index.js';
import StarPlugin from '../../plugins/tree-modified/src/index.js';
import {EditorRuntime} from '../../packages/host/src/EditorRuntime.js';
import {CliApplication} from '../../packages/host/src/cli/CliApplication.js';
import {CommandDispatcher} from '../../packages/host/src/cli/CommandDispatcher.js';
import {TreeFormatter} from '../../packages/host/src/cli/TreeFormatter.js';
test('both labels coexist with actual history/save/read; failed operations never update dirty baseline',async()=>{
  let saved='',fail=false;const r=new EditorRuntime({read:async()=>{if(fail)throw Error('read failed');return saved;},write:async(_p,s)=>{if(fail)throw Error('save failed');saved=s;}});
  r.installer.install(BoxPlugin,{name:'box',contributes:{shapes:['box'],attributes:['box-fill','box-label']}});
  r.installer.install(BoxTypePlugin,{name:'label',contributes:{decorators:['box-type-label']}});
  r.installer.install(StarPlugin,{name:'star',contributes:{decorators:['modified-star']}});
  const cli=new CliApplication(new CommandDispatcher(r.registry.commands,r.context),r.invoker,new TreeFormatter());
  await cli.executeLine('init');assert.deepEqual(await cli.executeLine('tree'),['svg (800x600)']);
  await cli.executeLine('create box n 0 0 10 10 "x"');
  assert.ok((await cli.executeLine('tree')).includes('└── g#n (box) *'));
  await cli.executeLine('save saved.svg');const clean=await cli.executeLine('tree');
  assert.ok(clean.includes('└── g#n (box)'));assert.equal(clean.some(l=>l.endsWith('*')),false);
  await cli.executeLine('set n label "changed"');const dirty=await cli.executeLine('tree');
  assert.ok(dirty[0]!.endsWith('*'));assert.ok(dirty[1]!.endsWith('(box) *'));
  await cli.executeLine('undo');assert.deepEqual(await cli.executeLine('tree'),clean);
  await cli.executeLine('redo');assert.deepEqual(await cli.executeLine('tree'),dirty);
  fail=true;for(const command of ['save bad.svg','read bad.svg','delete n-label']){
    const hs=r.history.state;assert.match((await cli.executeLine(command))[0]!,/^error:/);
    assert.deepEqual(await cli.executeLine('tree'),dirty);assert.deepEqual(r.history.state,hs);
  }
  fail=false;await cli.executeLine('read saved.svg');assert.deepEqual(await cli.executeLine('tree'),clean);
  await cli.executeLine('init');assert.deepEqual(await cli.executeLine('tree'),['svg (800x600)']);
});
