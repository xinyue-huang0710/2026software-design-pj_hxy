import { TextShape } from '../../domain/shapes/TextShape.js';
import type { Shape } from '../../domain/Shape.js';
import { NumericProvider } from './NumericProvider.js';
export class TextProvider extends NumericProvider<TextShape> {
  readonly typeKey='text';
  readonly accepts=(s:Shape):s is TextShape=>s instanceof TextShape;
  protected readonly fields=["x","y"];
  
  protected override hasText=true;
  protected construct(id:string,v:readonly number[],text?:string):TextShape {
    return new TextShape(id,v[0]!,v[1]!,text??'');
  }
  protected override inline(s:TextShape):string { return `(${s.x},${s.y}) ${JSON.stringify(s.text)}`; }
  protected override textOf(s:TextShape):string { return s.text; }
}
