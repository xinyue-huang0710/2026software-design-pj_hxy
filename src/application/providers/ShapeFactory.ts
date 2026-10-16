import type { Shape } from '../../domain/Shape.js';
import { EditorError } from '../../domain/errors/EditorError.js';
import type { ShapeProvider, ShapeView, SvgElementData } from './ShapeProvider.js';
interface Entry {
  create(id:string,args:readonly string[]):Shape;
  fromSvg(id:string,element:SvgElementData,children:readonly Shape[]):Shape;
  inspect(shape:Shape):ShapeView;
  serialize(shape:Shape):SvgElementData;
}
/** D2: the sole shape-name registry. Dynamic plugin loading is deferred. */
export class ShapeFactory {
  #entries=new Map<string,Entry>();
  register<T extends Shape>(provider:ShapeProvider<T>):void {
    if(this.#entries.has(provider.typeKey)) throw new EditorError(`provider already registered: ${provider.typeKey}`);
    const check=(shape:Shape):T=>{
      if(shape.typeKey!==provider.typeKey || !provider.accepts(shape))
        throw new EditorError(`provider/type mismatch: ${provider.typeKey}`);
      return shape;
    };
    const created=(shape:T,id:string):T=>{
      check(shape);
      if(shape.id!==id) throw new EditorError('provider returned wrong id');
      return shape;
    };
    this.#entries.set(provider.typeKey,{
      create:(id,args)=>created(provider.create(id,args),id),
      fromSvg:(id,e,children)=>created(provider.fromSvg(id,e,children),id),
      inspect:s=>provider.inspect(check(s)),
      serialize:s=>provider.toSvgElement(check(s))
    });
  }
  private entry(key:string):Entry {
    const entry=this.#entries.get(key);
    if(!entry) throw new EditorError(`unknown shape type: ${key} (is the plugin loaded?)`);
    return entry;
  }
  create(key:string,id:string,args:readonly string[]):Shape { return this.entry(key).create(id,args); }
  fromSvg(id:string,element:SvgElementData,children:readonly Shape[]=[]):Shape {
    const kind=element.attributes['data-kind'];
    const key=kind && this.#entries.has(kind)?kind:element.tag;
    return this.entry(key).fromSvg(id,element,children);
  }
  inspect(shape:Shape):ShapeView { return this.entry(shape.typeKey).inspect(shape); }
  toSvgElement(shape:Shape):SvgElementData { return this.entry(shape.typeKey).serialize(shape); }
}
