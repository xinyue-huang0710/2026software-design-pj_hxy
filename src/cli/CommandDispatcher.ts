import type { Command } from '../application/commands/Command.js';
import type { EditorSession } from '../application/EditorSession.js';
import type { HistoryManager } from '../application/history/HistoryManager.js';
import { Numbers } from '../domain/Numbers.js';
import { EditorError } from '../domain/errors/EditorError.js';
import type { Token } from './Tokenizer.js';
import { InitCommand } from '../application/commands/InitCommand.js';
import { ReadCommand } from '../application/commands/ReadCommand.js';
import { SaveCommand } from '../application/commands/SaveCommand.js';
import { CanvasCommand } from '../application/commands/CanvasCommand.js';
import { CreateCommand } from '../application/commands/CreateCommand.js';
import { DeleteCommand } from '../application/commands/DeleteCommand.js';
import { MoveCommand } from '../application/commands/MoveCommand.js';
import { ScaleCommand } from '../application/commands/ScaleCommand.js';
import { SetCommand } from '../application/commands/SetCommand.js';
import { GroupCommand } from '../application/commands/GroupCommand.js';
import { UngroupCommand } from '../application/commands/UngroupCommand.js';
import { AddToCommand } from '../application/commands/AddToCommand.js';
import { FrontCommand } from '../application/commands/FrontCommand.js';
import { BackCommand } from '../application/commands/BackCommand.js';
import { TreeCommand } from '../application/commands/TreeCommand.js';
import { ShowCommand } from '../application/commands/ShowCommand.js';
import { HelpCommand } from '../application/commands/HelpCommand.js';
import { UndoCommand } from '../application/commands/UndoCommand.js';
import { RedoCommand } from '../application/commands/RedoCommand.js';
/** D1: command-name dispatch. Construction only; execution belongs to Invoker. */
export class CommandDispatcher {
  readonly #builders:ReadonlyMap<string,(tokens:readonly Token[])=>Command>;
  constructor(session:EditorSession,history:HistoryManager){
    const args=(t:readonly Token[],min:number,max=min):readonly string[]=>{
      if(t.length<min||t.length>max) throw new EditorError('invalid command arguments. use help');
      return t.map(x=>x.value);
    };
    const dimensions=(t:readonly Token[]):readonly number[]=>{
      if(t.length!==0&&t.length!==2) throw new EditorError('expected zero or two canvas dimensions');
      return t.map(x=>Numbers.parse(x.value,'canvas dimension'));
    };
    this.#builders=new Map<string,(t:readonly Token[])=>Command>([
      ['init',t=>{const v=dimensions(t);return new InitCommand(session,v[0],v[1]);}],
      ['canvas',t=>{const v=dimensions(t);return new CanvasCommand(session,v[0],v[1]);}],
      ['read',t=>new ReadCommand(session,args(t,1)[0]!)],
      ['save',t=>new SaveCommand(session,args(t,0,1)[0])],
      ['create',t=>{
        args(t,2,Infinity);let parameters=t.slice(2),parent:string|undefined;
        if(parameters.length>=2&&parameters.at(-2)!.value==='in'&&!parameters.at(-2)!.quoted){
          parent=parameters.at(-1)!.value;parameters=parameters.slice(0,-2);
        }
        return new CreateCommand(session,t[0]!.value,t[1]!.value,parameters.map(x=>x.value),parent);
      }],
      ['delete',t=>new DeleteCommand(session,args(t,1)[0]!)],
      ['move',t=>{const v=args(t,3);return new MoveCommand(session,v[0]!,Numbers.parse(v[1]!,'dx'),Numbers.parse(v[2]!,'dy'));}],
      ['scale',t=>{const v=args(t,2);return new ScaleCommand(session,v[0]!,Numbers.parse(v[1]!,'scale factor'));}],
      ['set',t=>{const v=args(t,3);return new SetCommand(session,v[0]!,v[1]!,v[2]!);}],
      ['group',t=>{const v=args(t,2,Infinity);return new GroupCommand(session,v[0]!,v.slice(1));}],
      ['ungroup',t=>new UngroupCommand(session,args(t,1)[0]!)],
      ['addto',t=>{const v=args(t,2);return new AddToCommand(session,v[0]!,v[1]!);}],
      ['front',t=>new FrontCommand(session,args(t,1)[0]!)],
      ['back',t=>new BackCommand(session,args(t,1)[0]!)],
      ['tree',t=>new TreeCommand(session,args(t,0,1)[0])],
      ['show',t=>new ShowCommand(session,args(t,1)[0]!)],
      ['help',t=>{args(t,0);return new HelpCommand();}],
      ['undo',t=>{args(t,0);return new UndoCommand(session,history);}],
      ['redo',t=>{args(t,0);return new RedoCommand(session,history);}]
    ]);
  }
  dispatch(tokens:readonly Token[]):Command|undefined {
    if(!tokens.length) return undefined;
    const builder=this.#builders.get(tokens[0]!.value);
    if(!builder) throw new EditorError(`unknown command: ${tokens[0]!.value}`);
    return builder(tokens.slice(1));
  }
}
