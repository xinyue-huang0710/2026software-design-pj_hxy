import { NumericShape } from '../NumericShape.js';
import type { ShapeStyle } from '../ShapeStyle.js';
export class EllipseShape extends NumericShape {
  constructor(id: string, cx: number, cy: number, rx: number, ry: number, style?: ShapeStyle) {
    super(id, 'ellipse', {cx, cy, rx, ry}, ["rx","ry"], style);
  }
  get cx(): number { return this.value('cx'); }
  get cy(): number { return this.value('cy'); }
  get rx(): number { return this.value('rx'); }
  get ry(): number { return this.value('ry'); }
  override move(dx: number, dy: number): void { this.translate(dx,dy,["cx"],["cy"]); }
  override clone(): EllipseShape { return new EllipseShape(this.id, this.cx, this.cy, this.rx, this.ry, this.clonedStyle()); }
}
