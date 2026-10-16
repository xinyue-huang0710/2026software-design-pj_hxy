import { EllipseShape } from '../../domain/shapes/EllipseShape.js';
import type { Shape } from '../../domain/Shape.js';
import { NumericProvider } from './NumericProvider.js';
export class EllipseProvider extends NumericProvider<EllipseShape> {
  readonly typeKey='ellipse';
  readonly accepts=(s:Shape):s is EllipseShape=>s instanceof EllipseShape;
  protected readonly fields=["cx","cy","rx","ry"];
  
  
  protected construct(id:string,v:readonly number[],text?:string):EllipseShape {
    return new EllipseShape(id,v[0]!,v[1]!,v[2]!,v[3]!);
  }
  
  
}
