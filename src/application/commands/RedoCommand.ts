import type { Command,CommandResult } from './Command.js';
import type { EditorSession } from '../EditorSession.js';
import type { HistoryManager } from '../history/HistoryManager.js';
export class RedoCommand implements Command {
  constructor(private readonly receiver:EditorSession,private readonly history:HistoryManager) {}
  execute():CommandResult { this.receiver.requireDocument();return {lines:this.history.redo()}; }
}
