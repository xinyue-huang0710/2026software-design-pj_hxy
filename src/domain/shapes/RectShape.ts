import { NumericShape } from '../NumericShape.js';
import type { ShapeStyle } from '../ShapeStyle.js';
export class RectShape extends NumericShape {
  constructor(id: string, x: number, y: number, width: number, height: number, style?: ShapeStyle) {
    super(id, 'rect', {x, y, width, height}, ["width","height"], style);
  }
  get x(): number { return this.value('x'); }
  get y(): number { return this.value('y'); }
  get width(): number { return this.value('width'); }
  get height(): number { return this.value('height'); }
  override move(dx: number, dy: number): void { this.translate(dx,dy,["x"],["y"]); }
  override clone(): RectShape { return new RectShape(this.id, this.x, this.y, this.width, this.height, this.clonedStyle()); }
}
