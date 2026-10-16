import { EditCommand } from './EditCommand.js';
import type { EditorSession } from '../EditorSession.js';
export class ScaleCommand extends EditCommand {
  constructor(receiver:EditorSession,private readonly id:string,private readonly factor:number) { super(receiver); }
  protected executeAction():readonly string[] { return this.receiver.scale(this.id,this.factor); }
}
