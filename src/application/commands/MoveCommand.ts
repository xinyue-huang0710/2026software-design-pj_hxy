import { EditCommand } from './EditCommand.js';
import type { EditorSession } from '../EditorSession.js';
export class MoveCommand extends EditCommand {
  constructor(receiver:EditorSession,private readonly id:string,private readonly dx:number,private readonly dy:number) { super(receiver); }
  protected executeAction():readonly string[] { return this.receiver.move(this.id,this.dx,this.dy); }
}
