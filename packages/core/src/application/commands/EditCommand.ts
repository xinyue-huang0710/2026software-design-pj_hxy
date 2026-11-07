import type {SvgDocument} from '../../domain/SvgDocument.js';
import type {Command,CommandResult} from './Command.js';
import type {HistoryEntry} from '../history/HistoryEntry.js';
import type {EditorActions} from '../../contracts/EditorActions.js';
import {EditorError} from '../../domain/errors/EditorError.js';
export abstract class EditCommand implements Command,HistoryEntry {
  #before:SvgDocument|undefined;#after:SvgDocument|undefined;#lines:readonly string[]=[];
  #undo:readonly string[]|undefined;#redo:readonly string[]|undefined;
  constructor(protected readonly receiver:EditorActions){}
  execute():CommandResult{
    if(this.#before)throw new EditorError('command already executed');
    const before=this.receiver.beginEdit();
    try{
      const lines=this.executeAction(),after=this.receiver.prepareEdit(),feedback=this.receiver.feedback();
      this.#before=before;this.#after=after;this.#lines=lines;this.#undo=feedback?.undo;this.#redo=feedback?.redo;
      return {lines,edit:this};
    }catch(error){this.receiver.abortEdit();throw error;}
  }
  protected abstract executeAction():readonly string[];
  undo():readonly string[]{
    if(!this.#before)throw new EditorError('command not executed');
    this.receiver.restore(this.#before);return this.#undo??this.#lines.map(line=>'undone: '+line);
  }
  redo():readonly string[]{
    if(!this.#after)throw new EditorError('command not executed');
    this.receiver.restore(this.#after);return this.#redo??this.#lines.map(line=>'redone: '+line);
  }
}
