import type { Command,CommandResult } from '@svgframe/core';
import type { EditorActions } from '@svgframe/core';
export class SaveCommand implements Command {
  constructor(private readonly receiver:EditorActions,private readonly path?:string) {}
  async execute():Promise<CommandResult> { return {lines:await this.receiver.save(this.path),barrier:true}; }
}
