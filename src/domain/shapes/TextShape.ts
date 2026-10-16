import { NumericShape } from '../NumericShape.js';
import type { ShapeStyle } from '../ShapeStyle.js';
export class TextShape extends NumericShape {
  #text: string;
  constructor(id: string, x: number, y: number, text: string, style?: ShapeStyle) {
    super(id, 'text', {x, y}, [], style);
    this.#text = text;
  }
  get x(): number { return this.value('x'); }
  get y(): number { return this.value('y'); }
  get text(): string { return this.#text; }
  override setAttribute(name: string, value: string): void {
    if (name === 'text') this.#text = value;
    else super.setAttribute(name,value);
  }
  override move(dx: number, dy: number): void { this.translate(dx,dy,["x"],["y"]); }
  override clone(): TextShape { return new TextShape(this.id, this.x, this.y, this.text, this.clonedStyle()); }
}
