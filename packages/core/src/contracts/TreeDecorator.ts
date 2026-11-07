import type {DocumentEvent,DocumentSnapshot,NodeSnapshot} from './DocumentSnapshot.js';
export interface TreeLine {readonly root:boolean;readonly node?:NodeSnapshot;readonly document:DocumentSnapshot;}
export interface TreeDecorator {
  readonly name:string;
  decorate(line:TreeLine):string|undefined;
  onDocumentEvent?(event:DocumentEvent):void;
}
