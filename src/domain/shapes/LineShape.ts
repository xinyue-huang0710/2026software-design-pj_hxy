import { NumericShape } from '../NumericShape.js';
import type { ShapeStyle } from '../ShapeStyle.js';
export class LineShape extends NumericShape {
  constructor(id: string, x1: number, y1: number, x2: number, y2: number, style?: ShapeStyle) {
    super(id, 'line', {x1, y1, x2, y2}, [], style);
  }
  get x1(): number { return this.value('x1'); }
  get y1(): number { return this.value('y1'); }
  get x2(): number { return this.value('x2'); }
  get y2(): number { return this.value('y2'); }
  override move(dx: number, dy: number): void { this.translate(dx,dy,["x1","x2"],["y1","y2"]); }
  override clone(): LineShape { return new LineShape(this.id, this.x1, this.y1, this.x2, this.y2, this.clonedStyle()); }
}
