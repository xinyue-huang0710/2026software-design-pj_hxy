import {Numbers,EditorError} from '@svgframe/core';
import type {Plugin,PluginContext,Command,CommandContext,Token} from '@svgframe/core';
import {BuiltinCommandRegistration} from './BuiltinCommandRegistration.js';
import { InitCommand } from './commands/InitCommand.js';
import { ReadCommand } from './commands/ReadCommand.js';
import { SaveCommand } from './commands/SaveCommand.js';
import { CanvasCommand } from './commands/CanvasCommand.js';
import { CreateCommand } from './commands/CreateCommand.js';
import { DeleteCommand } from './commands/DeleteCommand.js';
import { MoveCommand } from './commands/MoveCommand.js';
import { ScaleCommand } from './commands/ScaleCommand.js';
import { SetCommand } from './commands/SetCommand.js';
import { GroupCommand } from './commands/GroupCommand.js';
import { UngroupCommand } from './commands/UngroupCommand.js';
import { AddToCommand } from './commands/AddToCommand.js';
import { FrontCommand } from './commands/FrontCommand.js';
import { BackCommand } from './commands/BackCommand.js';
import { TreeCommand } from './commands/TreeCommand.js';
import { ShowCommand } from './commands/ShowCommand.js';
import { HelpCommand } from './commands/HelpCommand.js';
import { UndoCommand } from './commands/UndoCommand.js';
import { RedoCommand } from './commands/RedoCommand.js';
export class BuiltinCommandsPlugin implements Plugin {
 activate(context:PluginContext):void{
    const args=(t:readonly Token[],min:number,max=min):readonly string[]=>{
      if(t.length<min||t.length>max) throw new EditorError('invalid command arguments. use help');
      return t.map(x=>x.value);
    };
    const dimensions=(t:readonly Token[]):readonly number[]=>{
      if(t.length!==0&&t.length!==2) throw new EditorError('expected zero or two canvas dimensions');
      return t.map(x=>Numbers.parse(x.value,'canvas dimension'));
    };
    const builders=new Map<string,(c:CommandContext,t:readonly Token[])=>Command>([
      ['init',(c,t)=>{const v=dimensions(t);return new InitCommand(c.editor,v[0],v[1]);}],
      ['canvas',(c,t)=>{const v=dimensions(t);return new CanvasCommand(c.editor,v[0],v[1]);}],
      ['read',(c,t)=>new ReadCommand(c.editor,args(t,1)[0]!)],
      ['save',(c,t)=>new SaveCommand(c.editor,args(t,0,1)[0])],
      ['create',(c,t)=>{
        args(t,2,Infinity);let parameters=t.slice(2),parent:string|undefined;
        if(parameters.length>=2&&parameters.at(-2)!.value==='in'&&!parameters.at(-2)!.quoted){
          parent=parameters.at(-1)!.value;parameters=parameters.slice(0,-2);
        }
        return new CreateCommand(c.editor,t[0]!.value,t[1]!.value,parameters.map(x=>x.value),parent);
      }],
      ['delete',(c,t)=>new DeleteCommand(c.editor,args(t,1)[0]!)],
      ['move',(c,t)=>{const v=args(t,3);return new MoveCommand(c.editor,v[0]!,Numbers.parse(v[1]!,'dx'),Numbers.parse(v[2]!,'dy'));}],
      ['scale',(c,t)=>{const v=args(t,2);return new ScaleCommand(c.editor,v[0]!,Numbers.parse(v[1]!,'scale factor'));}],
      ['set',(c,t)=>{const v=args(t,3);return new SetCommand(c.editor,v[0]!,v[1]!,v[2]!);}],
      ['group',(c,t)=>{const v=args(t,2,Infinity);return new GroupCommand(c.editor,v[0]!,v.slice(1));}],
      ['ungroup',(c,t)=>new UngroupCommand(c.editor,args(t,1)[0]!)],
      ['addto',(c,t)=>{const v=args(t,2);return new AddToCommand(c.editor,v[0]!,v[1]!);}],
      ['front',(c,t)=>new FrontCommand(c.editor,args(t,1)[0]!)],
      ['back',(c,t)=>new BackCommand(c.editor,args(t,1)[0]!)],
      ['tree',(c,t)=>new TreeCommand(c.editor,args(t,0,1)[0])],
      ['show',(c,t)=>new ShowCommand(c.editor,args(t,1)[0]!)],
      ['help',(c,t)=>{args(t,0);return new HelpCommand(c.help);}],
      ['undo',(c,t)=>{args(t,0);return new UndoCommand(c.editor,c.history);}],
      ['redo',(c,t)=>{args(t,0);return new RedoCommand(c.editor,c.history);}]
    ]);
 for(const [name,builder]of builders)context.registerCommand(new BuiltinCommandRegistration(name,builder));
 }
}
