import { SaxesParser } from 'saxes';
import type { DocumentReader,ImportResult } from '../../application/ports/DocumentCodec.js';
import type { SvgElementData } from '../../application/providers/ShapeProvider.js';
import { ShapeFactory } from '../../application/providers/ShapeFactory.js';
import type { Shape } from '../../domain/Shape.js';
import { SvgDocument } from '../../domain/SvgDocument.js';
import { Numbers } from '../../domain/Numbers.js';
import { EditorError } from '../../domain/errors/EditorError.js';
interface ElementNode {tag:string;attributes:Record<string,string>;text:string;children:ElementNode[];}
export class SvgReader implements DocumentReader {
  constructor(private readonly factory:ShapeFactory) {}
  read(xml:string):ImportResult {
    const stack:ElementNode[]=[];let root:ElementNode|undefined;
    const parser=new SaxesParser({xmlns:true});
    parser.on('doctype',()=>{throw new EditorError('DOCTYPE is not supported');});
    parser.on('processinginstruction',()=>{throw new EditorError('processing instructions are not supported');});
    parser.on('opentag',tag=>{
      if(tag.uri!=='' && tag.uri!=='http://www.w3.org/2000/svg') throw new EditorError('unsupported XML namespace');
      const attributes:Record<string,string>=Object.create(null) as Record<string,string>;
      for(const attr of Object.values(tag.attributes)){
        if(attr.uri==='http://www.w3.org/2000/xmlns/') continue;
        if(attr.prefix) throw new EditorError(`unsupported attribute: ${attr.name}`);
        attributes[attr.local]=attr.value;
      }
      const node:ElementNode={tag:tag.local,attributes,text:'',children:[]};
      if(stack.length) stack.at(-1)!.children.push(node);else root=node;
      stack.push(node);
    });
    const text=(value:string):void=>{if(stack.length) stack.at(-1)!.text+=value;};
    parser.on('text',text);parser.on('cdata',text);parser.on('closetag',()=>{stack.pop();});
    try { parser.write(xml).close(); }
    catch(error){
      if(error instanceof EditorError) throw error;
      throw new EditorError(`invalid SVG XML: ${error instanceof Error?error.message:'parse failed'}`);
    }
    if(!root || root.tag!=='svg') throw new EditorError('expected svg root element');
    for(const key of Object.keys(root.attributes))
      if(!['width','height','viewBox'].includes(key)) throw new EditorError(`unsupported svg attribute: ${key}`);
    if(root.text.trim()) throw new EditorError('unexpected text in svg');
    const width=Numbers.parse(root.attributes.width??'800','canvas width');
    const height=Numbers.parse(root.attributes.height??'600','canvas height');
    if(root.attributes.viewBox!==undefined){
      const values=root.attributes.viewBox.trim().split(/[\s,]+/).map(v=>Numbers.parse(v,'viewBox'));
      if(values.length!==4||values[0]!==0||values[1]!==0||values[2]!==width||values[3]!==height)
        throw new EditorError('unsupported viewBox: expected 0 0 width height');
    }
    const document=new SvgDocument(width,height),reserved=new Set<string>(),warnings:string[]=[];
    const reserve=(node:ElementNode):void=>{
      const id=node.attributes.id;
      if(id!==undefined){
        if(reserved.has(id)) throw new EditorError(`id already exists: ${id}`);
        reserved.add(id);
      }
      node.children.forEach(reserve);
    };
    root.children.forEach(reserve);
    const counters=new Map<string,number>();
    const assignIds=(node:ElementNode):void=>{
      let id=node.attributes.id;
      if(id===undefined){
        let n=counters.get(node.tag)??0;
        do{id=`${node.tag}${++n}`;}while(reserved.has(id));
        counters.set(node.tag,n);reserved.add(id);
        warnings.push(`warning: assigned id ${id} to unnamed <${node.tag}>`);
      }
      node.attributes.id=id;
      node.children.forEach(assignIds);
    };
    root.children.forEach(assignIds);
    const importNode=(node:ElementNode):Shape=>{
      const children=node.children.map(importNode);
      const element:SvgElementData=node;
      return this.factory.fromSvg(node.attributes.id!,element,children);
    };
    root.children.forEach(node=>document.insert(importNode(node)));document.validate();
    return {document,warnings};
  }
}
