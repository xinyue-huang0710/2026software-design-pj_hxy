import type { Command,CommandResult } from '@svgframe/core';
import type { EditorActions } from '@svgframe/core';
import type { HistoryPort } from '@svgframe/core';
export class RedoCommand implements Command {
  constructor(private readonly receiver:EditorActions,private readonly history:HistoryPort) {}
  execute():CommandResult { this.receiver.requireDocument();return {lines:this.history.redo()}; }
}
