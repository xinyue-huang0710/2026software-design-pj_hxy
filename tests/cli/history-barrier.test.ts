import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EditorRuntime } from '../../src/EditorRuntime.js';
import { CommandDispatcher } from '../../src/cli/CommandDispatcher.js';
import { CliApplication } from '../../src/cli/CliApplication.js';
import { TreeFormatter } from '../../src/cli/TreeFormatter.js';

test('all document barriers use the assignment error for both undo and redo',async()=>{
  for(const barrier of ['init','read input.svg','save output.svg','canvas 400 300']){
    const runtime=new EditorRuntime({
      read:async()=>'<svg width="20" height="30"/>',
      write:async()=>{}
    });
    const cli=new CliApplication(new CommandDispatcher(runtime.session,runtime.history),runtime.invoker,new TreeFormatter());
    await cli.executeLine('init');
    await cli.executeLine('create g before');
    await cli.executeLine('undo');
    assert.equal(runtime.history.state.redo,1);
    assert.ok(!(await cli.executeLine(barrier)).some(line=>line.startsWith('error:')),barrier);
    const document=runtime.writer.write(runtime.session.snapshot());
    const path=runtime.session.readPath;
    for(const command of ['undo','redo']){
      assert.deepEqual(await cli.executeLine(command),['error: undo not allowed after io command'],barrier+' -> '+command);
      assert.equal(runtime.writer.write(runtime.session.snapshot()),document);
      assert.equal(runtime.session.readPath,path);
      assert.deepEqual(runtime.history.state,{undo:0,redo:0,blocked:true});
    }
    for(const command of ['create g after','undo','redo'])
      assert.ok(!(await cli.executeLine(command)).some(line=>line.startsWith('error:')),command);
    assert.equal(runtime.session.snapshot().findShape('after').typeKey,'g');
  }
});