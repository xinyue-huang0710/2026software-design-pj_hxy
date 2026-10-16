import type { Command,CommandResult } from './Command.js';
import type { EditorSession } from '../EditorSession.js';
export class SaveCommand implements Command {
  constructor(private readonly receiver:EditorSession,private readonly path?:string) {}
  async execute():Promise<CommandResult> { return {lines:await this.receiver.save(this.path),barrier:true}; }
}
