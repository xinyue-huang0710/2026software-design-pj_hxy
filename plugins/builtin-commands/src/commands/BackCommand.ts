import { EditCommand } from '@svgframe/core';
import type { EditorActions } from '@svgframe/core';
export class BackCommand extends EditCommand {
  constructor(receiver:EditorActions,private readonly id:string) { super(receiver); }
  protected executeAction():readonly string[] { return this.receiver.back(this.id); }
}
