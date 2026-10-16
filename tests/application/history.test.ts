import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EditorSession } from '../../src/application/EditorSession.js';
import { ShapeFactory } from '../../src/application/providers/ShapeFactory.js';
import { CircleProvider } from '../../src/infrastructure/providers/CircleProvider.js';
import { HistoryManager } from '../../src/application/history/HistoryManager.js';
import { CommandInvoker } from '../../src/application/CommandInvoker.js';
import { CreateCommand } from '../../src/application/commands/CreateCommand.js';
import { MoveCommand } from '../../src/application/commands/MoveCommand.js';
test('edit snapshot undo/redo is exact and failed edits preserve redo',async()=>{
  const factory=new ShapeFactory();factory.register(new CircleProvider());
  const session=new EditorSession(factory,{read:async()=>'',write:async()=>{}},
    {read:()=>{throw new Error('unused');}},{write:()=>''});
  const history=new HistoryManager(),invoker=new CommandInvoker(session,history);
  session.init();
  await invoker.executeCommand(new CreateCommand(session,'circle','c',['0.1','0.2','3']));
  await invoker.executeCommand(new MoveCommand(session,'c',0.2,0.3));
  history.undo();
  assert.equal(session.show('c').view.properties[0]![1],'0.1');
  await assert.rejects(invoker.executeCommand(new MoveCommand(session,'missing',1,1)),/no such shape/);
  assert.deepEqual(history.state,{undo:1,redo:1,blocked:false});
  history.redo();
  assert.equal(session.show('c').view.properties[0]![1],String(0.1+0.2));
  history.undo();
  await invoker.executeCommand(new MoveCommand(session,'c',0,0));
  assert.deepEqual(history.state,{undo:2,redo:0,blocked:false});
});
