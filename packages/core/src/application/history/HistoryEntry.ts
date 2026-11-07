export interface HistoryEntry {
  undo():readonly string[];
  redo():readonly string[];
}
