import { EditCommand } from '@svgframe/core';
import type { EditorActions } from '@svgframe/core';
export class MoveCommand extends EditCommand {
  constructor(receiver:EditorActions,private readonly id:string,private readonly dx:number,private readonly dy:number) { super(receiver); }
  protected executeAction():readonly string[] { return this.receiver.move(this.id,this.dx,this.dy); }
}
