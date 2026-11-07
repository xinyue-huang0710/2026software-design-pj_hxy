import { EditCommand } from '@svgframe/core';
import type { EditorActions } from '@svgframe/core';
export class AddToCommand extends EditCommand {
  constructor(receiver:EditorActions,private readonly parent:string,private readonly id:string) { super(receiver); }
  protected executeAction():readonly string[] { return this.receiver.addto(this.parent,this.id); }
}
