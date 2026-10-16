import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { EditorRuntime } from '../../src/EditorRuntime.js';
import { CommandDispatcher } from '../../src/cli/CommandDispatcher.js';
import { CliApplication } from '../../src/cli/CliApplication.js';
import { Tokenizer } from '../../src/cli/Tokenizer.js';
test('tokenizer preserves quoted text, Windows paths, colors and quoted in',()=>{
  const t=new Tokenizer();
  assert.deepEqual(t.tokenize(' # comment'),[]);
  assert.deepEqual(t.tokenize('  '),[]);
  assert.deepEqual(t.tokenize('set r fill #abc').map(x=>x.value),['set','r','fill','#abc']);
  assert.deepEqual(t.tokenize('create text t 1 2 "hello 中文 in"').at(-1),{value:'hello 中文 in',quoted:true});
  assert.equal(t.tokenize(String.raw`read "C:\my files\demo.svg"`)[1]!.value,String.raw`C:\my files\demo.svg`);
  assert.equal(t.tokenize(String.raw`set t text "say \"hi\""`).at(-1)!.value,'say "hi"');
  assert.throws(()=>t.tokenize('read "unfinished'),/unterminated/);
  assert.throws(()=>t.tokenize('"a"b'),/expected space/);
});
test('CLI commands, read-only formatting and dispatch construction',async()=>{
  const r=new EditorRuntime(),dispatcher=new CommandDispatcher(r.session,r.history),cli=new CliApplication(dispatcher,r.invoker);
  assert.match((await cli.executeLine('tree'))[0]!,/^error: no document/);
  assert.match((await cli.executeLine('help'))[0]!,/^init/);
  const command=dispatcher.dispatch(new Tokenizer().tokenize('init'));
  assert.throws(()=>r.session.snapshot(),/no document/);
  await r.invoker.executeCommand(command!);
  for(const line of ['create g scene','create rect r 1 2 30 40 #fff in scene','create text t 5 6 "in" in scene','create g empty in scene'])
    assert.doesNotMatch((await cli.executeLine(line)).join('\n'),/error:/);
  const tree=(await cli.executeLine('tree')).join('\n'),state=r.history.state;
  assert.match(tree,/svg \(800x600\)\n└── g#scene\n    ├── rect#r  x=1 y=2 w=30 h=40 fill=#fff/);
  assert.match(tree,/text#t  \(5,6\) "in"/);
  assert.equal((await cli.executeLine('tree')).join('\n'),tree);
  assert.deepEqual(await cli.executeLine('show scene'),['g#scene  parent=svg']);
  assert.match((await cli.executeLine('tree scene'))[0]!,/^g#scene$/);
  assert.deepEqual(r.history.state,state);
  for(const line of ['create box b 1 2 3 4 "x"','create circle c 1 2 3 in r','group bad scene r','scale r 0','set r r 1','init 1','canvas 0 1','create g r','ungroup scene','bogus']){
    assert.match((await cli.executeLine(line))[0]!,/^error:/,line);
    assert.equal((await cli.executeLine('tree')).join('\n'),tree,line);
    assert.deepEqual(r.history.state,state,line);
  }
});
test('real stdin pipeline handles sequential commands through EOF',()=>{
  const result=spawnSync(process.execPath,['--import','tsx','src/main.ts'],{
    input:'# script\ninit 100 200\ncreate circle c 1 2 3 red\nmove c 4 5\nundo\nshow c\nredo\nshow c\n',
    encoding:'utf8',cwd:process.cwd()
  });
  assert.equal(result.status,0,result.stderr);
  assert.match(result.stdout,/cx=1 cy=2 r=3/);assert.match(result.stdout,/cx=5 cy=7 r=3/);
  assert.doesNotMatch(result.stdout,/error:/);
});
