import { LineShape } from '../../domain/shapes/LineShape.js';
import type { Shape } from '../../domain/Shape.js';
import { NumericProvider } from './NumericProvider.js';
export class LineProvider extends NumericProvider<LineShape> {
  readonly typeKey='line';
  readonly accepts=(s:Shape):s is LineShape=>s instanceof LineShape;
  protected readonly fields=["x1","y1","x2","y2"];
  protected override readonly optionalStyle='stroke';
  
  protected construct(id:string,v:readonly number[],text?:string):LineShape {
    return new LineShape(id,v[0]!,v[1]!,v[2]!,v[3]!);
  }
  protected override inline(s:LineShape):string { return `(${s.x1},${s.y1}) -> (${s.x2},${s.y2})`; }
  
}
