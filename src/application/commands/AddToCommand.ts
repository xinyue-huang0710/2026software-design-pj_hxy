import { EditCommand } from './EditCommand.js';
import type { EditorSession } from '../EditorSession.js';
export class AddToCommand extends EditCommand {
  constructor(receiver:EditorSession,private readonly parent:string,private readonly id:string) { super(receiver); }
  protected executeAction():readonly string[] { return this.receiver.addto(this.parent,this.id); }
}
