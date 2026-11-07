import { EditCommand } from '@svgframe/core';
import type { EditorActions } from '@svgframe/core';
export class SetCommand extends EditCommand {
  constructor(receiver:EditorActions,private readonly id:string,private readonly attr:string,private readonly value:string) { super(receiver); }
  protected executeAction():readonly string[] { return this.receiver.set(this.id,this.attr,this.value); }
}
