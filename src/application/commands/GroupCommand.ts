import { EditCommand } from './EditCommand.js';
import type { EditorSession } from '../EditorSession.js';
export class GroupCommand extends EditCommand {
  constructor(receiver:EditorSession,private readonly id:string,private readonly targets:readonly string[]) { super(receiver); }
  protected executeAction():readonly string[] { return this.receiver.group(this.id,this.targets); }
}
