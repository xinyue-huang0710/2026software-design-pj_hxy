import type { Command,CommandResult } from '@svgframe/core';
import type { EditorActions } from '@svgframe/core';
export class CanvasCommand implements Command {
  constructor(private readonly receiver:EditorActions,private readonly w?:number,private readonly h?:number) {}
  execute():CommandResult { return {lines:this.receiver.canvas(this.w,this.h),barrier:this.w!==undefined}; }
}
