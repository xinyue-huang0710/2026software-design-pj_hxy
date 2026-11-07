import {test} from 'node:test';
import assert from 'node:assert/strict';
import BoxPlugin from '../../plugins/shape-box/src/index.js';
import {EditorRuntime} from '../../packages/host/src/EditorRuntime.js';
import {CliApplication} from '../../packages/host/src/cli/CliApplication.js';
import {CommandDispatcher} from '../../packages/host/src/cli/CommandDispatcher.js';
import {TreeFormatter} from '../../packages/host/src/cli/TreeFormatter.js';
test('box roundtrip, nesting, geometry, protected children, derived id collisions and atomic read failures',async()=>{
  let file='';const r=new EditorRuntime({read:async()=>file,write:async(_p,s)=>{file=s;}});
  assert.deepEqual(r.installer.install(BoxPlugin,{name:'box',contributes:{shapes:['box'],attributes:['box-fill','box-label']}}),[]);
  const cli=new CliApplication(new CommandDispatcher(r.registry.commands,r.context),r.invoker,new TreeFormatter());
  await cli.executeLine('init');assert.deepEqual(await cli.executeLine('create box n 120 100 160 60 "开始"'),['box#n created (g#n + rect#n-rect + text#n-label)']);
  await cli.executeLine('create box inner 0 0 10 10 "nested" in n');
  const snapshot=()=>JSON.stringify(r.session.contentSnapshot());
  const original=snapshot();await cli.executeLine('move n 10 20');assert.notEqual(snapshot(),original);
  await cli.executeLine('undo');assert.equal(snapshot(),original);
  await cli.executeLine('scale n 2');await cli.executeLine('undo');assert.equal(snapshot(),original);
  for(const command of ['delete n-rect','addto inner n-label','group stolen n-rect']){
    const hs=r.history.state;assert.match((await cli.executeLine(command))[0]!,/^error: invalid box structure/);
    assert.equal(snapshot(),original);assert.deepEqual(r.history.state,hs);
  }
  assert.deepEqual(await cli.executeLine('ungroup n'),['error: cannot ungroup composite shape: n']);
  for(const command of ['set n fill red','set n label "v2"']){
    const before=snapshot(),count=r.history.state.undo;
    assert.ok(!(await cli.executeLine(command))[0]!.startsWith('error:'));
    const after=snapshot();assert.equal(r.history.state.undo,count+1);
    await cli.executeLine('undo');assert.equal(snapshot(),before);await cli.executeLine('redo');assert.equal(snapshot(),after);
  }
  await cli.executeLine('create g clash-rect');const collision=snapshot(),hs=r.history.state;
  assert.deepEqual(await cli.executeLine('create box clash 0 0 10 10 "x"'),['error: id already exists: clash-rect']);
  assert.equal(snapshot(),collision);assert.deepEqual(r.history.state,hs);
  await cli.executeLine('save box.svg');assert.match(file,/data-kind="box"/);
  const saved=snapshot();await cli.executeLine('read box.svg');assert.equal(snapshot(),saved);
  const ordinary=new EditorRuntime().reader.read(file).document;assert.equal(ordinary.findShape('n').typeKey,'g');
  for(const invalid of [
    '<svg><g id="bad" data-kind="box"><rect id="bad-rect"/></g></svg>',
    '<svg><g id="bad" data-kind="box"><text id="bad-rect"/><text id="bad-label"/></g></svg>',
    '<svg><g id="bad" data-kind="box"><rect id="bad-rect"/><text id="bad-label"/><rect id="bad-rect"/></g></svg>'
  ]){file=invalid;const h=r.history.state;assert.match((await cli.executeLine('read bad.svg'))[0]!,/^error:/);assert.equal(snapshot(),saved);assert.deepEqual(r.history.state,h);}
  await cli.executeLine('delete n');assert.equal(r.session.snapshot().size,1);await cli.executeLine('undo');assert.equal(snapshot(),saved);
});
