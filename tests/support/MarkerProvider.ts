import { MarkerShape } from './MarkerShape.js';
import type { Shape } from '../../src/domain/Shape.js';
import { NumericProvider } from '../../src/infrastructure/providers/NumericProvider.js';
import type { SvgElementData } from '../../src/application/providers/ShapeProvider.js';
export class MarkerProvider extends NumericProvider<MarkerShape> {
  readonly typeKey='marker';
  readonly accepts=(shape:Shape):shape is MarkerShape=>shape instanceof MarkerShape;
  protected readonly fields=['x','y','size'];
  protected construct(id:string,v:readonly number[]):MarkerShape {return new MarkerShape(id,v[0]!,v[1]!,v[2]!);}
  override toSvgElement(shape:MarkerShape):SvgElementData {
    return {tag:'circle',attributes:{id:shape.id,cx:String(shape.x),cy:String(shape.y),r:String(shape.size),
      'data-kind':'marker',...Object.fromEntries(shape.styleEntries())}};
  }
  override fromSvg(id:string,element:SvgElementData):MarkerShape {
    const a=element.attributes;
    return super.fromSvg(id,{tag:'marker',attributes:{id,x:a.cx??'0',y:a.cy??'0',size:a.r??'0',
      ...Object.fromEntries(Object.entries(a).filter(([k])=>['fill','stroke','stroke-width'].includes(k)))}});
  }
}
