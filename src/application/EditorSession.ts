import { SvgDocument } from '../domain/SvgDocument.js';
import { EditorError } from '../domain/errors/EditorError.js';
import { ShapeFactory } from './providers/ShapeFactory.js';
import { ShapeQueryService } from './queries/ShapeQueryService.js';
import type { TreeView,DetailView } from './queries/ShapeQueryService.js';
import type { DocumentStore } from './ports/DocumentStore.js';
import type { DocumentReader,DocumentWriter } from './ports/DocumentCodec.js';
/** Stable receiver. Commands store IDs, never references into replaceable documents. */
export class EditorSession {
  #document:SvgDocument|undefined;
  #candidate:SvgDocument|undefined;
  #readPath:string|undefined;
  readonly #query:ShapeQueryService;
  constructor(readonly factory:ShapeFactory,private readonly store:DocumentStore,
    private readonly reader:DocumentReader,private readonly writer:DocumentWriter) {
    this.#query=new ShapeQueryService(factory);
  }
  get readPath():string|undefined { return this.#readPath; }
  requireDocument():SvgDocument {
    if(!this.#document) throw new EditorError("no document. use 'init' or 'read' first");
    return this.#document;
  }
  snapshot():SvgDocument { return this.requireDocument().clone(); }
  restore(snapshot:SvgDocument):void { this.#document=snapshot.clone(); }
  beginEdit():SvgDocument {
    if(this.#candidate) throw new EditorError('edit already in progress');
    const before=this.snapshot();this.#candidate=before.clone();return before;
  }
  prepareEdit():SvgDocument { this.editing().validate();return this.editing().clone(); }
  commitEdit():void { this.#document=this.#candidate!;this.#candidate=undefined; }
  abortEdit():void { this.#candidate=undefined; }
  private editing():SvgDocument {
    if(!this.#candidate) throw new EditorError('edit transaction required');
    return this.#candidate;
  }
  init(w=800,h=600):readonly string[] {
    const document=new SvgDocument(w,h);this.#document=document;this.#readPath=undefined;
    return [`canvas ${w}x${h} created`];
  }
  async read(path:string):Promise<readonly string[]> {
    const xml=await this.store.read(path), result=this.reader.read(xml);result.document.validate();
    this.#document=result.document;this.#readPath=path;
    return [...result.warnings,`read ${path} (${result.document.size} elements)`];
  }
  async save(path?:string):Promise<readonly string[]> {
    const document=this.requireDocument(), target=path??this.#readPath;
    if(!target) throw new EditorError('no read path. use save <file.svg>');
    const xml=this.writer.write(document);await this.store.write(target,xml);
    return [`saved to ${target} (${document.size} elements)`];
  }
  canvas(w?:number,h?:number):readonly string[] {
    const document=this.requireDocument();
    if(w===undefined) return [`canvas ${document.width}x${document.height}`];
    const candidate=document.clone();candidate.resize(w,h!);this.#document=candidate;
    return [`canvas resized to ${w}x${h}`];
  }
  create(type:string,id:string,args:readonly string[],parent?:string):readonly string[] {
    const doc=this.editing(),shape=this.factory.create(type,id,args);doc.insert(shape,parent);
    return [`${this.factory.inspect(shape).label} created${parent===undefined?'':` in ${this.factory.inspect(doc.container(parent)).label}`}`];
  }
  delete(id:string):readonly string[] {
    const doc=this.editing(),label=this.factory.inspect(doc.findShape(id)).label;doc.delete(id);
    return [`${label} deleted`];
  }
  move(id:string,dx:number,dy:number):readonly string[] {
    const shape=this.editing().findShape(id);shape.move(dx,dy);
    return [`${this.factory.inspect(shape).label} moved by (${dx},${dy})`];
  }
  scale(id:string,factor:number):readonly string[] {
    const shape=this.editing().findShape(id);shape.scale(factor);
    return [`${this.factory.inspect(shape).label} scaled by ${factor}`];
  }
  set(id:string,attr:string,value:string):readonly string[] {
    const shape=this.editing().findShape(id);shape.setAttribute(attr,value);
    return [`${this.factory.inspect(shape).label} updated: ${attr}=${JSON.stringify(value)}`];
  }
  group(id:string,targets:readonly string[]):readonly string[] {
    this.editing().group(id,targets);return [`g#${id} created with ${targets.length} children`];
  }
  ungroup(id:string):readonly string[] { this.editing().ungroup(id);return [`container#${id} ungrouped`]; }
  addto(parent:string,id:string):readonly string[] { this.editing().addto(parent,id);return [`${id} moved into ${parent}`]; }
  front(id:string):readonly string[] { this.editing().front(id);return [`${id} brought to front`]; }
  back(id:string):readonly string[] { this.editing().back(id);return [`${id} sent to back`]; }
  tree(id?:string):TreeView { return this.#query.tree(this.requireDocument(),id); }
  show(id:string):DetailView { return this.#query.show(this.requireDocument(),id); }
}
