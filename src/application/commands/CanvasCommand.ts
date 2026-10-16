import type { Command,CommandResult } from './Command.js';
import type { EditorSession } from '../EditorSession.js';
export class CanvasCommand implements Command {
  constructor(private readonly receiver:EditorSession,private readonly w?:number,private readonly h?:number) {}
  execute():CommandResult { return {lines:this.receiver.canvas(this.w,this.h),barrier:this.w!==undefined}; }
}
