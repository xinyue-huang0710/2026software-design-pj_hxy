import { EditCommand } from '@svgframe/core';
import type { EditorActions } from '@svgframe/core';
export class ScaleCommand extends EditCommand {
  constructor(receiver:EditorActions,private readonly id:string,private readonly factor:number) { super(receiver); }
  protected executeAction():readonly string[] { return this.receiver.scale(this.id,this.factor); }
}
