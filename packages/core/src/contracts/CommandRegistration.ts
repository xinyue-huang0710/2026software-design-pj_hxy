import type {Command} from '../application/commands/Command.js';
import type {EditorActions,HistoryPort} from './EditorActions.js';
import type {QueryPort} from './DocumentSnapshot.js';
export interface Token {readonly value:string;readonly quoted:boolean;}
export interface CommandContext {readonly editor:EditorActions;readonly history:HistoryPort;readonly queries:QueryPort;readonly help:()=>readonly string[];}
export interface CommandRegistration {
  readonly name:string;readonly help:readonly string[];
  create(tokens:readonly Token[],context:CommandContext):Command;
}
