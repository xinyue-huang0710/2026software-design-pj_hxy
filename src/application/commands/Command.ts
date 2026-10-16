import type { HistoryEntry } from '../history/HistoryEntry.js';
import type { TreeView,DetailView } from '../queries/ShapeQueryService.js';
export interface CommandResult {
  readonly lines:readonly string[];
  readonly edit?:HistoryEntry;
  readonly barrier?:boolean;
  readonly tree?:TreeView;
  readonly detail?:DetailView;
}
export interface Command { execute():CommandResult|Promise<CommandResult>; }
