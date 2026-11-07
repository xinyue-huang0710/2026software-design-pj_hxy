import type { Command,CommandResult } from '@svgframe/core';
import type { EditorActions } from '@svgframe/core';
export class ShowCommand implements Command {
  constructor(private readonly receiver:EditorActions,private readonly id:string) {}
  execute():CommandResult { return {lines:[],detail:this.receiver.show(this.id)}; }
}
