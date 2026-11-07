import type { HistoryEntry } from './HistoryEntry.js';
import { EditorError } from '../../domain/errors/EditorError.js';
export class HistoryManager {
  #undo:HistoryEntry[]=[]; #redo:HistoryEntry[]=[]; #blocked=true;
  get state():Readonly<{undo:number;redo:number;blocked:boolean}> {
    return Object.freeze({undo:this.#undo.length,redo:this.#redo.length,blocked:this.#blocked});
  }
  barrier():void { this.#undo=[];this.#redo=[];this.#blocked=true; }
  record(entry:HistoryEntry):void { this.#undo.push(entry);this.#redo=[];this.#blocked=false; }
  undo():readonly string[] {
    this.allowed();
    const entry=this.#undo.at(-1);
    if(!entry) throw new EditorError('nothing to undo');
    const lines=entry.undo();this.#undo.pop();this.#redo.push(entry);return lines;
  }
  redo():readonly string[] {
    this.allowed();
    const entry=this.#redo.at(-1);
    if(!entry) throw new EditorError('nothing to redo');
    const lines=entry.redo(); this.#redo.pop();this.#undo.push(entry);return lines;
  }
  private allowed():void {
    if(this.#blocked) throw new EditorError('undo not allowed after io command');
  }
}
