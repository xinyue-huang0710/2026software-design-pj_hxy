import { Shape } from './Shape.js';
import { ContainerShape } from './ContainerShape.js';
import { GroupShape } from './shapes/GroupShape.js';
import { Numbers } from './Numbers.js';
import { EditorError } from './errors/EditorError.js';
export class SvgDocument {
  #width: number; #height: number;
  #root = new GroupShape('__document_root__');
  #index = new Map<string,Shape>();
  #parents = new Map<Shape,ContainerShape>();
  constructor(width=800,height=600) {
    this.#width=Numbers.positive(width,'canvas width'); this.#height=Numbers.positive(height,'canvas height');
  }
  get width(): number { return this.#width; }
  get height(): number { return this.#height; }
  get size(): number { return this.#index.size; }
  roots(): readonly Shape[] { return this.#root.children(); }
  resize(w:number,h:number): void {
    Numbers.positive(w,'canvas width'); Numbers.positive(h,'canvas height');
    this.#width=w; this.#height=h;
  }
  findShape(id:string): Shape {
    const s=this.#index.get(id);
    if(!s) throw new EditorError(`no such shape: ${id}`);
    return s;
  }
  parentOf(id:string): ContainerShape | null {
    const p=this.#parents.get(this.findShape(id))!;
    return p===this.#root?null:p;
  }
  container(id:string): ContainerShape {
    const shape=this.#index.get(id);
    if(!shape) throw new EditorError(`no such container: ${id}`);
    const container=shape.asContainer();
    if(!container) throw new EditorError(`not a container: ${id}`);
    return container;
  }
  insert(shape:Shape,parentId?:string): void {
    const parent=parentId===undefined?this.#root:this.container(parentId);
    const ids=new Set<string>(), seen=new Set<Shape>();
    const check=(node:Shape):void=>{
      if(seen.has(node)) throw new EditorError('cycle or repeated object in document');
      seen.add(node);
      if(ids.has(node.id)||this.#index.has(node.id)) throw new EditorError(`id already exists: ${node.id}`);
      ids.add(node.id); node.children().forEach(check);
    };
    check(shape); parent.insertAt(parent.children().length,shape); this.reindex();
  }
  delete(id:string): void { const s=this.findShape(id); this.#parents.get(s)!.detach(s); this.reindex(); }
  addto(gid:string,id:string): void {
    const target=this.container(gid), shape=this.findShape(id);
    if(target===shape || shape.asContainer()?.contains(target)) throw new EditorError(`cannot move a container into its own descendant: ${id}`);
    this.#parents.get(shape)!.detach(shape); target.insertAt(target.children().length,shape); this.reindex();
  }
  front(id:string): void { this.reorder(id,true); }
  back(id:string): void { this.reorder(id,false); }
  private reorder(id:string,front:boolean): void {
    const shape=this.findShape(id), parent=this.#parents.get(shape)!;
    parent.detach(shape); parent.insertAt(front?parent.children().length:0,shape);
  }
  group(newId:string,ids:readonly string[]): void {
    const group=new GroupShape(newId);
    if(this.#index.has(newId)) throw new EditorError(`id already exists: ${newId}`);
    if(!ids.length) throw new EditorError('group requires at least one shape');
    if(new Set(ids).size!==ids.length) throw new EditorError('duplicate group target');
    const targets=ids.map(id=>this.findShape(id)), selected=new Set(targets);
    for(const target of targets) for(const other of targets)
      if(target!==other && target.asContainer()?.contains(other))
        throw new EditorError(`cannot group a container into its own descendant: ${target.id}`);
    const ancestors=(node:ContainerShape):ContainerShape[]=>{
      const result=[node];
      while(node!==this.#root){node=this.#parents.get(node)!;result.push(node);}
      return result;
    };
    const chains=targets.map(s=>ancestors(this.#parents.get(s)!));
    const parent=chains[0]!.find(p=>chains.every(c=>c.includes(p)))!;
    const ordered=[...this.#index.values()].filter(s=>selected.has(s));
    const positions=targets.map(s=>{
      while(this.#parents.get(s)!==parent) s=this.#parents.get(s)!;
      return parent.children().indexOf(s);
    });
    const position=Math.min(...positions);
    for(const target of ordered) this.#parents.get(target)!.detach(target);
    parent.insertAt(position,group);
    ordered.forEach(s=>group.insertAt(group.children().length,s)); this.reindex();
  }
  ungroup(gid:string): void {
    const group=this.container(gid), parent=this.#parents.get(group)!;
    if(!group.canUngroup()) throw new EditorError(`cannot ungroup composite shape: ${gid}`);
    if(parent===this.#root) throw new EditorError(`cannot ungroup top-level container: ${gid}`);
    const index=parent.children().indexOf(group), children=group.children();
    parent.detach(group);
    children.forEach((child,i)=>{group.detach(child);parent.insertAt(index+i,child);});
    this.reindex();
  }
  clone(): SvgDocument {
    const copy=new SvgDocument(this.width,this.height);
    for(const root of this.roots()) copy.#root.insertAt(copy.#root.children().length,root.clone());
    copy.reindex(); return copy;
  }
  validate(): void { this.reindex(); }
  private reindex(): void {
    const index=new Map<string,Shape>(), parents=new Map<Shape,ContainerShape>(), seen=new Set<Shape>();
    const walk=(parent:ContainerShape):void=>{
      for(const child of parent.children()){
        if(seen.has(child)) throw new EditorError('cycle or repeated object in document');
        seen.add(child);
        if(index.has(child.id)) throw new EditorError(`id already exists: ${child.id}`);
        index.set(child.id,child); parents.set(child,parent);
        const c=child.asContainer(); if(c) walk(c);
      }
    };
    walk(this.#root); this.#index=index; this.#parents=parents;
  }
}
