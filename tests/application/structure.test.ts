import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EditorSession } from '../../src/application/EditorSession.js';
import { ShapeFactory } from '../../src/application/providers/ShapeFactory.js';
import { RectProvider } from '../../src/infrastructure/providers/RectProvider.js';
import { GroupProvider } from '../../src/infrastructure/providers/GroupProvider.js';
import { HistoryManager } from '../../src/application/history/HistoryManager.js';
import { CommandInvoker } from '../../src/application/CommandInvoker.js';
import { CreateCommand } from '../../src/application/commands/CreateCommand.js';
import { GroupCommand } from '../../src/application/commands/GroupCommand.js';
import { UngroupCommand } from '../../src/application/commands/UngroupCommand.js';
import { AddToCommand } from '../../src/application/commands/AddToCommand.js';
import { FrontCommand } from '../../src/application/commands/FrontCommand.js';
import { BackCommand } from '../../src/application/commands/BackCommand.js';
import { DeleteCommand } from '../../src/application/commands/DeleteCommand.js';
import { MoveCommand } from '../../src/application/commands/MoveCommand.js';
import { ScaleCommand } from '../../src/application/commands/ScaleCommand.js';
import { SetCommand } from '../../src/application/commands/SetCommand.js';
import { InitCommand } from '../../src/application/commands/InitCommand.js';
import { CanvasCommand } from '../../src/application/commands/CanvasCommand.js';
import { SaveCommand } from '../../src/application/commands/SaveCommand.js';
import { ReadCommand } from '../../src/application/commands/ReadCommand.js';
test('each structural and attribute edit restores complete nested order on undo/redo',async()=>{
  const factory=new ShapeFactory();factory.register(new RectProvider());factory.register(new GroupProvider());
  const session=new EditorSession(factory,{read:async()=>'',write:async()=>{}},
    {read:()=>{throw new Error('unused');}},{write:()=>''});
  const history=new HistoryManager(),invoker=new CommandInvoker(session,history);
  await invoker.executeCommand(new InitCommand(session));
  for(const [type,id,args,parent] of [
    ['g','outer',[],undefined],['g','other',[],undefined],
    ['rect','a',['1','2','3','4'],'outer'],['rect','b',['5','6','7','8'],'outer'],
    ['rect','c',['9','10','11','12'],'other']
  ] as const) await invoker.executeCommand(new CreateCommand(session,type,id,args,parent));
  const state=()=>JSON.stringify(session.tree());
  for(const command of [
    new GroupCommand(session,'pair',['c','a']),new AddToCommand(session,'outer','pair'),
    new UngroupCommand(session,'pair'),new FrontCommand(session,'b'),
    new BackCommand(session,'b'),new SetCommand(session,'outer','fill','red'),
    new MoveCommand(session,'outer',3,4),new ScaleCommand(session,'outer',1.5),
    new DeleteCommand(session,'outer')
  ]){
    const before=state();await invoker.executeCommand(command);const after=state();
    history.undo();assert.equal(state(),before);history.redo();assert.equal(state(),after);
  }
  assert.throws(()=>session.show('a'),/no such shape/);
  history.undo();assert.equal(session.show('a').parent,'g#outer');
});
test('partial group overflow is discarded, document barriers and IO failures preserve state',async()=>{
  const factory=new ShapeFactory();factory.register(new RectProvider());factory.register(new GroupProvider());
  const session=new EditorSession(factory,{read:async()=>{throw new Error('read failure');},write:async()=>{throw new Error('write failure');}},
    {read:()=>{throw new Error('unused');}},{write:()=>''});
  const history=new HistoryManager(),invoker=new CommandInvoker(session,history);
  await invoker.executeCommand(new InitCommand(session));
  assert.throws(()=>history.undo(),/undo not allowed after io command/);
  await invoker.executeCommand(new CreateCommand(session,'g','g',[]));
  await invoker.executeCommand(new CreateCommand(session,'rect','small',['1','2','3','4'],'g'));
  await invoker.executeCommand(new CreateCommand(session,'rect','large',['1e308','2','3','4'],'g'));
  const before=JSON.stringify(session.tree()),hs=history.state;
  await assert.rejects(invoker.executeCommand(new ScaleCommand(session,'g',2)),/invalid/);
  assert.equal(JSON.stringify(session.tree()),before);assert.deepEqual(history.state,hs);
  for(const command of [new SaveCommand(session,'bad.svg'),new ReadCommand(session,'bad.svg'),new CanvasCommand(session,0,2)]){
    await assert.rejects(invoker.executeCommand(command));
    assert.equal(JSON.stringify(session.tree()),before);assert.deepEqual(history.state,hs);
  }
  await invoker.executeCommand(new CanvasCommand(session));assert.deepEqual(history.state,hs);
  await invoker.executeCommand(new CanvasCommand(session,20,30));
  assert.deepEqual(history.state,{undo:0,redo:0,blocked:true});
  await assert.rejects(invoker.executeCommand(new MoveCommand(session,'missing',1,1)));
  assert.equal(history.state.blocked,true);
  await invoker.executeCommand(new MoveCommand(session,'small',0,0));assert.equal(history.state.blocked,false);
});
