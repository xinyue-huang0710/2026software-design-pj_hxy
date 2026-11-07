import { CircleShape } from '../shapes/CircleShape.js';
import type { Shape } from '@svgframe/core';
import { NumericProvider } from './NumericProvider.js';
export class CircleProvider extends NumericProvider<CircleShape> {
  readonly typeKey='circle';
  readonly accepts=(s:Shape):s is CircleShape=>s instanceof CircleShape;
  protected readonly fields=["cx","cy","r"];
  
  
  protected construct(id:string,v:readonly number[],text?:string):CircleShape {
    return new CircleShape(id,v[0]!,v[1]!,v[2]!);
  }
  
  
}
