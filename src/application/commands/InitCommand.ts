import type { Command,CommandResult } from './Command.js';
import type { EditorSession } from '../EditorSession.js';
export class InitCommand implements Command {
  constructor(private readonly receiver:EditorSession,private readonly w=800,private readonly h=600) {}
  execute():CommandResult { return {lines:this.receiver.init(this.w,this.h),barrier:true}; }
}
