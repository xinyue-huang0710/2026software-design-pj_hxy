import type {TreeDecorator,TreeLine,DocumentEvent,DocumentSnapshot,NodeSnapshot} from '@svgframe/core';
interface Fingerprints {readonly document:string;readonly nodes:ReadonlyMap<string,string>;}
export class ModifiedStarDecorator implements TreeDecorator {
  readonly name='modified-star';
  #saved:Fingerprints={document:'',nodes:new Map()};
  readonly #cache=new WeakMap<DocumentSnapshot,Fingerprints>();
  onDocumentEvent(event:DocumentEvent):void{
    if(event.kind==='baseline')this.#saved=this.fingerprints(event.document);
  }
  decorate(line:TreeLine):string|undefined{
    const current=this.fingerprints(line.document);
    const dirty=line.root?current.document!==this.#saved.document:
      line.node!==undefined&&current.nodes.get(line.node.id)!==this.#saved.nodes.get(line.node.id);
    return dirty?'*':undefined;
  }
  private fingerprints(document:DocumentSnapshot):Fingerprints{
    const cached=this.#cache.get(document);if(cached)return cached;
    const nodes=new Map<string,string>();
    const visit=(node:NodeSnapshot,parent:string|null):void=>{
      nodes.set(node.id,JSON.stringify([parent,node]));node.children.forEach(child=>visit(child,node.id));
    };
    document.children.forEach(node=>visit(node,null));
    const result={document:JSON.stringify(document),nodes};this.#cache.set(document,result);return result;
  }
}
