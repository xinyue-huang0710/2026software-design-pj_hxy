import { EditCommand } from './EditCommand.js';
import type { EditorSession } from '../EditorSession.js';
export class DeleteCommand extends EditCommand {
  constructor(receiver:EditorSession,private readonly id:string) { super(receiver); }
  protected executeAction():readonly string[] { return this.receiver.delete(this.id); }
}
