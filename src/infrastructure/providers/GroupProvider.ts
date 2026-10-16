import { GroupShape } from '../../domain/shapes/GroupShape.js';
import type { Shape } from '../../domain/Shape.js';
import { EditorError } from '../../domain/errors/EditorError.js';
import type { ShapeProvider,ShapeView,SvgElementData } from '../../application/providers/ShapeProvider.js';
export class GroupProvider implements ShapeProvider<GroupShape> {
  readonly typeKey='g';
  readonly accepts=(s:Shape):s is GroupShape=>s instanceof GroupShape && s.typeKey==='g';
  create(id:string,args:readonly string[]):GroupShape {
    if(args.length) throw new EditorError('invalid parameters for g');
    return new GroupShape(id);
  }
  fromSvg(id:string,element:SvgElementData):GroupShape {
    const shape=new GroupShape(id);
    for(const [key,value] of Object.entries(element.attributes)){
      if(key==='id'||key==='data-kind') continue;
      if(!['fill','stroke','stroke-width'].includes(key)) throw new EditorError(`unsupported attribute: ${key}`);
      shape.setAttribute(key,value);
    }
    if(element.text?.trim()) throw new EditorError('unexpected text in g');
    return shape;
  }
  inspect(s:GroupShape):ShapeView {
    return {id:s.id,label:`g#${s.id}`,inline:'',properties:[],styles:s.styleEntries()};
  }
  toSvgElement(s:GroupShape):SvgElementData {
    return {tag:'g',attributes:Object.fromEntries([['id',s.id],...s.styleEntries()])};
  }
}
