import { EditCommand } from './EditCommand.js';
import type { EditorSession } from '../EditorSession.js';
export class SetCommand extends EditCommand {
  constructor(receiver:EditorSession,private readonly id:string,private readonly attr:string,private readonly value:string) { super(receiver); }
  protected executeAction():readonly string[] { return this.receiver.set(this.id,this.attr,this.value); }
}
