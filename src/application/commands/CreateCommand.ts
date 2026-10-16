import { EditCommand } from './EditCommand.js';
import type { EditorSession } from '../EditorSession.js';
export class CreateCommand extends EditCommand {
  constructor(receiver:EditorSession,private readonly type:string,private readonly id:string,private readonly args:readonly string[],private readonly parent?:string) { super(receiver); }
  protected executeAction():readonly string[] { return this.receiver.create(this.type,this.id,this.args,this.parent); }
}
