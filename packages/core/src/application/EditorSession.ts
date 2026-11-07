import {SvgDocument} from '../domain/SvgDocument.js';
import type {ContainerShape} from '../domain/ContainerShape.js';
import type {Shape} from '../domain/Shape.js';
import {EditorError} from '../domain/errors/EditorError.js';
import {ShapeFactory} from './providers/ShapeFactory.js';
import {ShapeQueryService} from './queries/ShapeQueryService.js';
import type {TreeView,DetailView} from './queries/ShapeQueryService.js';
import type {DocumentStore} from './ports/DocumentStore.js';
import type {DocumentReader,DocumentWriter} from './ports/DocumentCodec.js';
import type {EditorActions} from '../contracts/EditorActions.js';
import type {EditFeedback,ShapeAction} from '../contracts/ShapeAction.js';
import type {DocumentEvent,DocumentSnapshot,NodeSnapshot} from '../contracts/DocumentSnapshot.js';
import {AttributeService} from './AttributeService.js';
import {TreeDecorationService} from './TreeDecorationService.js';
/** Stable receiver; plugins consume EditorActions, not this implementation. */
export class EditorSession implements EditorActions {
  #document:SvgDocument|undefined;#candidate:SvgDocument|undefined;#readPath:string|undefined;
  #feedback:EditFeedback|undefined;#event:DocumentEvent['kind']|undefined;
  readonly #query:ShapeQueryService;
  constructor(readonly factory:ShapeFactory,private readonly store:DocumentStore,
    private readonly reader:DocumentReader,private readonly writer:DocumentWriter,
    private readonly makeGroup?:(id:string)=>ContainerShape,
    private readonly attributes=new AttributeService(()=>[]),
    private readonly decorations=new TreeDecorationService(new Map())) {
    this.#query=new ShapeQueryService(factory);
  }
  get readPath():string|undefined{return this.#readPath;}
  requireDocument():SvgDocument{
    if(!this.#document)throw new EditorError("no document. use 'init' or 'read' first");return this.#document;
  }
  snapshot():SvgDocument{return this.requireDocument().clone();}
  contentSnapshot():DocumentSnapshot {
    const doc=this.requireDocument();
    const node=(shape:Shape):NodeSnapshot=>{
      const data=this.factory.toSvgElement(shape);
      const attributes=Object.freeze(Object.fromEntries(Object.entries(data.attributes).sort(([a],[b])=>a<b?-1:a>b?1:0)));
      return Object.freeze({id:shape.id,typeKey:shape.typeKey,container:shape.asContainer()!==null,attributes,
        ...(data.text===undefined?{}:{text:data.text}),children:Object.freeze(shape.children().map(node))});
    };
    return Object.freeze({width:doc.width,height:doc.height,children:Object.freeze(doc.roots().map(node))});
  }
  flushEvents():readonly string[]{
    const kind=this.#event;this.#event=undefined;
    if(!kind)return [];
    try{return this.decorations.notify(Object.freeze({kind,document:this.contentSnapshot()}));}
    catch(error){return ['warning: document notification failed: '+String(error instanceof Error?error.message:error).replace(/[\r\n]/g,' ')];}
  }
  restore(snapshot:SvgDocument):void{this.#document=snapshot.clone();this.#event='change';}
  feedback():EditFeedback|undefined{return this.#feedback;}
  beginEdit():SvgDocument{
    if(this.#candidate)throw new EditorError('edit already in progress');
    const before=this.snapshot();this.#candidate=before.clone();this.#feedback=undefined;return before;
  }
  prepareEdit():SvgDocument{this.editing().validate();return this.editing().clone();}
  commitEdit():void{this.#document=this.#candidate!;this.#candidate=undefined;this.#event='change';}
  abortEdit():void{this.#candidate=undefined;this.#feedback=undefined;}
  private editing():SvgDocument{if(!this.#candidate)throw new EditorError('edit transaction required');return this.#candidate;}
  private describe(shape:Shape,action:ShapeAction,fallback:readonly string[]):readonly string[]{
    this.#feedback=this.factory.feedback(shape,action);return this.#feedback?.lines??fallback;
  }
  init(w=800,h=600):readonly string[]{
    const doc=new SvgDocument(w,h);this.#document=doc;this.#readPath=undefined;this.#event='baseline';
    return ['canvas '+w+'x'+h+' created'];
  }
  async read(path:string):Promise<readonly string[]>{
    const xml=await this.store.read(path),result=this.reader.read(xml);result.document.validate();
    this.#document=result.document;this.#readPath=path;this.#event='baseline';
    return [...result.warnings,'read '+path+' ('+result.document.size+' elements)'];
  }
  async save(path?:string):Promise<readonly string[]>{
    const doc=this.requireDocument(),target=path??this.#readPath;
    if(!target)throw new EditorError('no read path. use save <file.svg>');
    const xml=this.writer.write(doc);await this.store.write(target,xml);this.#event='baseline';
    return ['saved to '+target+' ('+doc.size+' elements)'];
  }
  canvas(w?:number,h?:number):readonly string[]{
    const doc=this.requireDocument();
    if(w===undefined)return ['canvas '+doc.width+'x'+doc.height];
    const candidate=doc.clone();candidate.resize(w,h!);this.#document=candidate;this.#event='change';
    return ['canvas resized to '+w+'x'+h];
  }
  create(type:string,id:string,args:readonly string[],parent?:string):readonly string[]{
    const doc=this.editing(),shape=this.factory.create(type,id,args);doc.insert(shape,parent);
    const parentSuffix=parent===undefined?'':' in '+this.factory.inspect(doc.container(parent)).label;
    return this.describe(shape,{kind:'create',values:{parentSuffix}},[this.factory.inspect(shape).label+' created'+parentSuffix]);
  }
  delete(id:string):readonly string[]{
    const doc=this.editing(),label=this.factory.inspect(doc.findShape(id)).label;doc.delete(id);return [label+' deleted'];
  }
  move(id:string,dx:number,dy:number):readonly string[]{
    const shape=this.editing().findShape(id);shape.move(dx,dy);
    return this.describe(shape,{kind:'move',values:{dx,dy}},[this.factory.inspect(shape).label+' moved by ('+dx+','+dy+')']);
  }
  scale(id:string,factor:number):readonly string[]{
    const shape=this.editing().findShape(id);shape.scale(factor);
    return this.describe(shape,{kind:'scale',values:{factor}},[this.factory.inspect(shape).label+' scaled by '+factor]);
  }
  set(id:string,attr:string,value:string):readonly string[]{
    const doc=this.editing();this.#feedback=this.attributes.set(doc,this.factory,id,attr,value)??undefined;
    return this.#feedback?.lines??[this.factory.inspect(doc.findShape(id)).label+' updated: '+attr+'='+JSON.stringify(value)];
  }
  group(id:string,targets:readonly string[]):readonly string[]{
    if(!this.makeGroup)throw new EditorError('group creation service unavailable');
    this.editing().group(this.makeGroup(id),targets);return ['g#'+id+' created with '+targets.length+' children'];
  }
  ungroup(id:string):readonly string[]{this.editing().ungroup(id);return ['container#'+id+' ungrouped'];}
  addto(parent:string,id:string):readonly string[]{this.editing().addto(parent,id);return [id+' moved into '+parent];}
  front(id:string):readonly string[]{this.editing().front(id);return [id+' brought to front'];}
  back(id:string):readonly string[]{this.editing().back(id);return [id+' sent to back'];}
  tree(id?:string):TreeView{return this.decorations.decorate(this.#query.tree(this.requireDocument(),id),this.contentSnapshot());}
  show(id:string):DetailView{return this.#query.show(this.requireDocument(),id);}
}
