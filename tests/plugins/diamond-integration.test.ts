import {test} from 'node:test';
import assert from 'node:assert/strict';
import {EditorRuntime} from '../../packages/host/src/EditorRuntime.js';
import {CliApplication} from '../../packages/host/src/cli/CliApplication.js';
import {CommandDispatcher} from '../../packages/host/src/cli/CommandDispatcher.js';
import {TreeFormatter} from '../../packages/host/src/cli/TreeFormatter.js';
import {installCodePlugins} from '../../packages/host/src/composition/codePlugins.js';

test('diamond composes with unchanged history, grouping, stats, tree labels and SVG IO',async()=>{
  let xml='';const r=new EditorRuntime({read:async()=>xml,write:async(_p,s)=>{xml=s;}});
  assert.deepEqual(installCodePlugins(r.installer),[]);
  const cli=new CliApplication(new CommandDispatcher(r.registry.commands,r.context),r.invoker,new TreeFormatter());
  const ok=async(command:string)=>{const lines=await cli.executeLine(command);assert.ok(!lines.some(l=>l.startsWith('error:')),lines.join('\n'));return lines;};
  for(const command of ['init','create g flow','create g other','create diamond d 100 80 60 40 gold in flow','create circle peer 10 10 5 in flow'])await ok(command);
  assert.deepEqual(await ok('stats'),['diamond: 1  circle: 1  (total 2, containers 2)']);
  assert.match((await ok('tree')).join('\n'),/diamond#d.*\*/);
  assert.match((await ok('show d')).join('\n'),/diamond#d/);
  const snapshot=()=>JSON.stringify(r.session.contentSnapshot());
  for(const command of ['move d 10 -5','scale d 2','set d width 90','set d fill red','front d','back peer','addto other d','group bundle d peer','delete d']){
    const before=snapshot(),count=r.history.state.undo;await ok(command);
    const after=snapshot();assert.notEqual(after,before,command);assert.equal(r.history.state.undo,count+1);
    await ok('undo');assert.equal(snapshot(),before);await ok('redo');assert.equal(snapshot(),after);
    await ok('undo');assert.equal(snapshot(),before);
  }
  await ok('save diamond.svg');
  assert.match(xml,/<polygon[^>]*data-kind="diamond"/);
  assert.doesNotMatch((await ok('tree')).join('\n'),/\*/);
  const saved=snapshot();await ok('move flow 10 10');
  assert.match((await ok('tree')).join('\n'),/diamond#d.*\*/);
  await ok('undo');assert.equal(snapshot(),saved);assert.doesNotMatch((await ok('tree')).join('\n'),/\*/);
  await ok('read diamond.svg');assert.equal(snapshot(),saved);
  await ok('move d 1 1');const state=snapshot(),history=r.history.state;
  for(const command of ['create diamond d 0 0 10 10','set d width -1','scale d 1e309','create diamond overflow 1.7e308 0 1e308 10']){
    assert.match((await cli.executeLine(command))[0]!,/^error:/);
    assert.equal(snapshot(),state);assert.deepEqual(r.history.state,history);
  }
  xml=xml.replace('data-width="60"','data-width="999"');
  assert.match((await cli.executeLine('read malformed.svg'))[0]!,/^error: diamond points do not match geometry/);
  assert.equal(snapshot(),state);assert.deepEqual(r.history.state,history);
});

test('without diamond plugin create and polygon read fail clearly and preserve the existing document',async()=>{
  const r=new EditorRuntime({read:async()=>'<svg><polygon id="d" data-kind="diamond" data-cx="10" data-cy="10" data-width="10" data-height="10" points="10,5 15,10 10,15 5,10"/></svg>',write:async()=>{}});
  const cli=new CliApplication(new CommandDispatcher(r.registry.commands,r.context),r.invoker,new TreeFormatter());
  await cli.executeLine('init');await cli.executeLine('create g preserved');
  const before=JSON.stringify(r.session.contentSnapshot()),history=r.history.state;
  assert.match((await cli.executeLine('create diamond d 0 0 10 10'))[0]!,/^error: unknown shape type: diamond/);
  assert.match((await cli.executeLine('read diamond.svg'))[0]!,/^error: unknown shape type: polygon/);
  assert.equal(JSON.stringify(r.session.contentSnapshot()),before);assert.deepEqual(r.history.state,history);
});
