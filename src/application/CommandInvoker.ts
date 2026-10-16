import type { Command,CommandResult } from './commands/Command.js';
import { EditorSession } from './EditorSession.js';
import { HistoryManager } from './history/HistoryManager.js';
import { EditorError } from '../domain/errors/EditorError.js';
export class CommandInvoker {
  #busy=false;
  constructor(private readonly session:EditorSession,private readonly history:HistoryManager) {}
  async executeCommand(command:Command):Promise<CommandResult> {
    if(this.#busy) throw new EditorError('command already in progress');
    this.#busy=true;
    try {
      const result=await command.execute();
      if(result.edit){this.session.commitEdit();this.history.record(result.edit);}
      else if(result.barrier) this.history.barrier();
      return result;
    } finally { this.#busy=false; }
  }
}
