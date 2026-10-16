import { NumericShape } from '../NumericShape.js';
import type { ShapeStyle } from '../ShapeStyle.js';
export class CircleShape extends NumericShape {
  constructor(id: string, cx: number, cy: number, r: number, style?: ShapeStyle) {
    super(id, 'circle', {cx, cy, r}, ["r"], style);
  }
  get cx(): number { return this.value('cx'); }
  get cy(): number { return this.value('cy'); }
  get r(): number { return this.value('r'); }
  override move(dx: number, dy: number): void { this.translate(dx,dy,["cx"],["cy"]); }
  override clone(): CircleShape { return new CircleShape(this.id, this.cx, this.cy, this.r, this.clonedStyle()); }
}
