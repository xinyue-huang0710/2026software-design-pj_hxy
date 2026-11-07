import type {DocumentEvent,DocumentSnapshot,NodeSnapshot} from '../contracts/DocumentSnapshot.js';
import type {TreeDecorator,TreeLine} from '../contracts/TreeDecorator.js';
import type {TreeView,TreeNode} from './queries/ShapeQueryService.js';
import {EditorError} from '../domain/errors/EditorError.js';
export class TreeDecorationService {
  constructor(private readonly decorators:Map<string,TreeDecorator>){}
  notify(event:DocumentEvent):readonly string[]{
    const diagnostics:string[]=[];
    for(const [name,decorator]of this.decorators)try{decorator.onDocumentEvent?.(event);}
    catch(error){this.decorators.delete(name);diagnostics.push('warning: disabled tree decorator: '+name+' ('+String(error instanceof Error?error.message:error).replace(/[\r\n]/g,' ')+')');}
    return diagnostics;
  }
  decorate(tree:TreeView,document:DocumentSnapshot):TreeView {
    if(!this.decorators.size)return tree;
    const index=new Map<string,NodeSnapshot>();const walk=(n:NodeSnapshot):void=>{index.set(n.id,n);n.children.forEach(walk);};document.children.forEach(walk);
    const suffix=(line:TreeLine):string=>{
      const tags:string[]=[];
      for(const d of this.decorators.values()){
        const tag=d.decorate(Object.freeze(line));
        if(tag!==undefined){if(typeof tag!=='string'||/[\r\n]/.test(tag))throw new EditorError('invalid tree label: '+d.name);if(tag)tags.push(tag);}
      }
      return tags.length?' '+tags.join(' '):'';
    };
    const node=(n:TreeNode):TreeNode=>({...n,suffix:suffix({root:false,node:index.get(n.view.id),document}),children:n.children.map(node)});
    return {...tree,...(tree.heading!==undefined?{heading:tree.heading+suffix({root:true,document})}:{}),nodes:tree.nodes.map(node)};
  }
}
