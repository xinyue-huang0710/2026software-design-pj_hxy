import { EditCommand } from '@svgframe/core';
import type { EditorActions } from '@svgframe/core';
export class GroupCommand extends EditCommand {
  constructor(receiver:EditorActions,private readonly id:string,private readonly targets:readonly string[]) { super(receiver); }
  protected executeAction():readonly string[] { return this.receiver.group(this.id,this.targets); }
}
