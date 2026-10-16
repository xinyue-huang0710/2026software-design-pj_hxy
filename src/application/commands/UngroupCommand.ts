import { EditCommand } from './EditCommand.js';
import type { EditorSession } from '../EditorSession.js';
export class UngroupCommand extends EditCommand {
  constructor(receiver:EditorSession,private readonly id:string) { super(receiver); }
  protected executeAction():readonly string[] { return this.receiver.ungroup(this.id); }
}
