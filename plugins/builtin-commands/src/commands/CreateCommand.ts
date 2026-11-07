import { EditCommand } from '@svgframe/core';
import type { EditorActions } from '@svgframe/core';
export class CreateCommand extends EditCommand {
  constructor(receiver:EditorActions,private readonly type:string,private readonly id:string,private readonly args:readonly string[],private readonly parent?:string) { super(receiver); }
  protected executeAction():readonly string[] { return this.receiver.create(this.type,this.id,this.args,this.parent); }
}
