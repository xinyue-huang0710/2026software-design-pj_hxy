import {SaxesParser} from 'saxes';
export interface OutlineElement {
  readonly name:string; readonly start:number; readonly end:number;
  readonly selectionStart:number; readonly selectionEnd:number;
  readonly children:readonly OutlineElement[];
}
interface BuildingElement {name:string;start:number;end:number;selectionStart:number;selectionEnd:number;children:BuildingElement[];}
/** Syntax-only XML tree. Offsets are UTF-16 offsets into the unchanged source. */
export class SvgOutlineParser {
  parse(source:string):readonly OutlineElement[]{
    const parser=new SaxesParser({xmlns:true,position:true}),roots:BuildingElement[]=[],stack:BuildingElement[]=[];
    let start=0;
    parser.on('opentagstart',()=>{start=source.lastIndexOf('<',parser.position-1);});
    parser.on('opentag',tag=>{
      const id=tag.attributes.id?.value;
      const node:BuildingElement={name:tag.name+(id?'#'+id:''),start,end:parser.position,
        selectionStart:start+1,selectionEnd:start+1+tag.name.length,children:[]};
      if(stack.length)stack.at(-1)!.children.push(node);else roots.push(node);
      stack.push(node);
    });
    parser.on('closetag',()=>{const node=stack.pop();if(node)node.end=parser.position;});
    try {parser.write(source).close();return roots;}
    catch {return [];}
  }
}
