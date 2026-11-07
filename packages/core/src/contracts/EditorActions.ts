import type {SvgDocument} from '../domain/SvgDocument.js';
import type {TreeView,DetailView} from '../application/queries/ShapeQueryService.js';
import type {EditFeedback} from './ShapeAction.js';
/** Public application port. Concrete sessions and history internals are not plugin dependencies. */
export interface EditorActions {
  requireDocument():unknown;
  beginEdit():SvgDocument; prepareEdit():SvgDocument; abortEdit():void;
  restore(snapshot:SvgDocument):void; feedback():EditFeedback|undefined;
  init(w?:number,h?:number):readonly string[];
  read(path:string):Promise<readonly string[]>;save(path?:string):Promise<readonly string[]>;
  canvas(w?:number,h?:number):readonly string[];
  create(type:string,id:string,args:readonly string[],parent?:string):readonly string[];
  delete(id:string):readonly string[];move(id:string,dx:number,dy:number):readonly string[];
  scale(id:string,factor:number):readonly string[];set(id:string,attr:string,value:string):readonly string[];
  group(id:string,targets:readonly string[]):readonly string[];ungroup(id:string):readonly string[];
  addto(parent:string,id:string):readonly string[];front(id:string):readonly string[];back(id:string):readonly string[];
  tree(id?:string):TreeView;show(id:string):DetailView;
}
export interface HistoryPort {undo():readonly string[];redo():readonly string[];}
