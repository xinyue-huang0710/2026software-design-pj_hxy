import { RectShape } from '../../domain/shapes/RectShape.js';
import type { Shape } from '../../domain/Shape.js';
import { NumericProvider } from './NumericProvider.js';
export class RectProvider extends NumericProvider<RectShape> {
  readonly typeKey='rect';
  readonly accepts=(s:Shape):s is RectShape=>s instanceof RectShape;
  protected readonly fields=["x","y","width","height"];
  
  
  protected construct(id:string,v:readonly number[],text?:string):RectShape {
    return new RectShape(id,v[0]!,v[1]!,v[2]!,v[3]!);
  }
  protected override inline(s:RectShape):string { return `x=${s.x} y=${s.y} w=${s.width} h=${s.height}`; }
  
}
