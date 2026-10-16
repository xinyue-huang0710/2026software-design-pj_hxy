import type { SvgDocument } from '../../domain/SvgDocument.js';
import type { Shape } from '../../domain/Shape.js';
import type { ShapeView } from '../providers/ShapeProvider.js';
import { ShapeFactory } from '../providers/ShapeFactory.js';
export interface TreeNode { readonly view:ShapeView; readonly children:readonly TreeNode[]; }
export interface TreeView { readonly heading?:string; readonly nodes:readonly TreeNode[]; }
export interface DetailView { readonly view:ShapeView; readonly parent:string; }
export class ShapeQueryService {
  constructor(private readonly factory:ShapeFactory) {}
  tree(document:SvgDocument,id?:string):TreeView {
    const node=(shape:Shape):TreeNode=>({view:this.factory.inspect(shape),children:shape.children().map(node)});
    return id===undefined?{heading:`svg (${document.width}x${document.height})`,nodes:document.roots().map(node)}
      :{nodes:[node(document.findShape(id))]};
  }
  show(document:SvgDocument,id:string):DetailView {
    const parent=document.parentOf(id);
    return {view:this.factory.inspect(document.findShape(id)),parent:parent?this.factory.inspect(parent).label:'svg'};
  }
}
