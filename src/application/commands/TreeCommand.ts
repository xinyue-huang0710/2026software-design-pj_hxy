import type { Command,CommandResult } from './Command.js';
import type { EditorSession } from '../EditorSession.js';
export class TreeCommand implements Command {
  constructor(private readonly receiver:EditorSession,private readonly id?:string) {}
  execute():CommandResult { return {lines:[],tree:this.receiver.tree(this.id)}; }
}
