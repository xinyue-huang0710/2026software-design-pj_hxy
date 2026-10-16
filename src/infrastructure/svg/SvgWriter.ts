import type { DocumentWriter } from '../../application/ports/DocumentCodec.js';
import { ShapeFactory } from '../../application/providers/ShapeFactory.js';
import type { SvgElementData } from '../../application/providers/ShapeProvider.js';
import type { Shape } from '../../domain/Shape.js';
import type { SvgDocument } from '../../domain/SvgDocument.js';
import { XmlEscaper } from './XmlEscaper.js';
export class SvgWriter implements DocumentWriter {
  readonly #escape=new XmlEscaper();
  constructor(private readonly factory:ShapeFactory) {}
  write(document:SvgDocument):string {
    const element=(shape:Shape):SvgElementData=>{
      const data=this.factory.toSvgElement(shape);
      return {...data,children:[...(data.children??[]),...shape.children().map(element)]};
    };
    return '<?xml version="1.0" encoding="UTF-8"?>\n'+this.render({
      tag:'svg',attributes:{xmlns:'http://www.w3.org/2000/svg',width:String(document.width),height:String(document.height),
      viewBox:`0 0 ${document.width} ${document.height}`},children:document.roots().map(element)},0)+'\n';
  }
  private render(element:SvgElementData,depth:number):string {
    const indent='  '.repeat(depth),tag=this.#escape.name(element.tag);
    const attrs=Object.entries(element.attributes).map(([k,v])=>` ${this.#escape.name(k)}="${this.#escape.attribute(v)}"`).join('');
    const children=element.children??[];
    if(!children.length && element.text===undefined) return `${indent}<${tag}${attrs}/>`;
    const text=element.text===undefined?'':this.#escape.text(element.text);
    if(!children.length) return `${indent}<${tag}${attrs}>${text}</${tag}>`;
    return `${indent}<${tag}${attrs}>${text}\n${children.map(c=>this.render(c,depth+1)).join('\n')}\n${indent}</${tag}>`;
  }
}
