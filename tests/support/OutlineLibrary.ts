export interface OutlineNode {
  readonly title:string;
  readonly descendants:readonly OutlineNode[];
}

/** Test-only stand-in for an existing library with an incompatible API (Adaptee). */
export class OutlineLibrary {
  draw(roots:readonly OutlineNode[]):string {
    const lines:string[]=[];
    const visit=(nodes:readonly OutlineNode[],depth:number):void=>{
      for(const node of nodes){
        lines.push('  '.repeat(depth)+'- '+node.title);
        visit(node.descendants,depth+1);
      }
    };
    visit(roots,0);
    return lines.join('\n');
  }
}
