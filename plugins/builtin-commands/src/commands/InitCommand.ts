import type { Command,CommandResult } from '@svgframe/core';
import type { EditorActions } from '@svgframe/core';
export class InitCommand implements Command {
  constructor(private readonly receiver:EditorActions,private readonly w=800,private readonly h=600) {}
  execute():CommandResult { return {lines:this.receiver.init(this.w,this.h),barrier:true}; }
}
