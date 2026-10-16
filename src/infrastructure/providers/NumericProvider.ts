import type { NumericShape } from '../../domain/NumericShape.js';
import type { Shape } from '../../domain/Shape.js';
import { Numbers } from '../../domain/Numbers.js';
import { EditorError } from '../../domain/errors/EditorError.js';
import type { ShapeProvider,ShapeView,SvgElementData } from '../../application/providers/ShapeProvider.js';
/** Shared input validation and output mapping; geometry stays in Shape subclasses. */
export abstract class NumericProvider<T extends NumericShape> implements ShapeProvider<T> {
  abstract readonly typeKey:string;
  abstract readonly accepts:(shape:Shape)=>shape is T;
  protected abstract readonly fields:readonly string[];
  protected readonly optionalStyle:string='fill';
  protected abstract construct(id:string,values:readonly number[],text?:string):T;
  protected hasText=false;
  create(id:string,args:readonly string[]):T {
    const count=this.fields.length+(this.hasText?1:0);
    const extra=this.hasText?0:1;
    if(args.length<count||args.length>count+extra) throw new EditorError(`invalid parameters for ${this.typeKey}`);
    const values=this.fields.map((field,i)=>Numbers.parse(args[i]!,field));
    const shape=this.construct(id,values,this.hasText?args[this.fields.length]:undefined);
    if(args.length>count) shape.setAttribute(this.optionalStyle,args[count]!);
    return shape;
  }
  fromSvg(id:string,element:SvgElementData,children:readonly Shape[]=[]):T {
    const allowed=new Set(['id',...this.fields,'fill','stroke','stroke-width']);
    for(const key of Object.keys(element.attributes))
      if(!allowed.has(key)) throw new EditorError(`unsupported attribute: ${key}`);
    if(children.length || element.children?.length) throw new EditorError(`unsupported children in ${this.typeKey}`);
    if(!this.hasText && element.text?.trim()) throw new EditorError(`unexpected text in ${this.typeKey}`);
    const values=this.fields.map(field=>Numbers.parse(element.attributes[field]??'0',field));
    const shape=this.construct(id,values,element.text??'');
    for(const key of ['fill','stroke','stroke-width'])
      if(element.attributes[key]!==undefined) shape.setAttribute(key,element.attributes[key]!);
    return shape;
  }
  protected textOf(_shape:T):string|undefined { return undefined; }
  protected inline(shape:T):string {
    return this.fields.map(key=>`${key}=${shape.geometry()[key]}`).join(' ');
  }
  inspect(shape:T):ShapeView {
    const properties=this.fields.map(key=>[key,String(shape.geometry()[key])] as const);
    const text=this.textOf(shape);
    return Object.freeze({id:shape.id,label:`${this.typeKey}#${shape.id}`,inline:this.inline(shape),
      properties:Object.freeze(text===undefined?properties:[...properties,['text',text] as const]),styles:shape.styleEntries()});
  }
  toSvgElement(shape:T):SvgElementData {
    const attrs:Record<string,string>={id:shape.id};
    this.fields.forEach(key=>{attrs[key]=String(shape.geometry()[key]);});
    for(const [key,value] of shape.styleEntries()) attrs[key]=value;
    const text=this.textOf(shape);
    return {tag:this.typeKey,attributes:attrs,...(text===undefined?{}:{text})};
  }
}
