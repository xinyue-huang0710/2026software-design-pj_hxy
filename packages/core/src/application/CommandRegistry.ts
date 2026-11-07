import type {Command} from './commands/Command.js';
import type {CommandRegistration,CommandContext,Token} from '../contracts/CommandRegistration.js';
import {EditorError} from '../domain/errors/EditorError.js';
export class CommandRegistry {
  #entries=new Map<string,CommandRegistration>();
  has(name:string):boolean{return this.#entries.has(name);}
  register(command:CommandRegistration):void{
    if(this.has(command.name))throw new EditorError('duplicate registration: commands/'+command.name);
    this.#entries.set(command.name,command);
  }
  create(tokens:readonly Token[],context:CommandContext):Command|undefined {
    if(!tokens.length)return undefined;
    const name=tokens[0]!.value,entry=this.#entries.get(name);
    if(!entry)throw new EditorError('unknown command: '+name);
    return entry.create(tokens.slice(1),context);
  }
  help():readonly string[]{return [...this.#entries.values()].flatMap(c=>[...c.help]);}
}
