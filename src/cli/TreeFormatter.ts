import type { TreeView,TreeNode } from '../application/queries/ShapeQueryService.js';
export class TreeFormatter {
  format(tree:TreeView):readonly string[] {
    const lines:string[]=[];
    const label=(node:TreeNode):string=>{
      const fields=[node.view.inline,...node.view.styles.map(([k,v])=>`${k}=${v}`)].filter(Boolean).join(' ');
      return node.view.label+(fields?'  '+fields:'');
    };
    const children=(nodes:readonly TreeNode[],prefix:string):void=>{
      nodes.forEach((node,i)=>{
        const last=i===nodes.length-1;
        lines.push(prefix+(last?'└── ':'├── ')+label(node));
        children(node.children,prefix+(last?'    ':'│   '));
      });
    };
    if(tree.heading!==undefined){lines.push(tree.heading);children(tree.nodes,'');}
    else for(const node of tree.nodes){lines.push(label(node));children(node.children,'');}
    return lines;
  }
}
