import type { Command,CommandResult } from './Command.js';
import type { EditorSession } from '../EditorSession.js';
export class ShowCommand implements Command {
  constructor(private readonly receiver:EditorSession,private readonly id:string) {}
  execute():CommandResult { return {lines:[],detail:this.receiver.show(this.id)}; }
}
