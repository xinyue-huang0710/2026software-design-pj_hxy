import type { Command,CommandResult } from '@svgframe/core';
import type { EditorActions } from '@svgframe/core';
export class TreeCommand implements Command {
  constructor(private readonly receiver:EditorActions,private readonly id?:string) {}
  execute():CommandResult { return {lines:[],tree:this.receiver.tree(this.id)}; }
}
