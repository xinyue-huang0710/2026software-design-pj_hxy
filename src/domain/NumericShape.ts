import { Shape } from './Shape.js';
import { ShapeStyle } from './ShapeStyle.js';
import { Numbers } from './Numbers.js';
export abstract class NumericShape extends Shape {
  #values: Record<string, number>;
  #sizes: ReadonlySet<string>;
  protected constructor(id: string, key: string, values: Record<string,number>, sizes: readonly string[], style?: ShapeStyle) {
    super(id, key, style);
    this.#sizes = new Set(sizes);
    this.#values = this.validated(values);
  }
  private validated(values: Record<string,number>): Record<string,number> {
    for (const [k,v] of Object.entries(values)) {
      Numbers.finite(v,k);
      if (this.#sizes.has(k)) Numbers.nonnegative(v,k);
    }
    return {...values};
  }
  protected value(name: string): number { return this.#values[name]!; }
  geometry(): Readonly<Record<string,number>> { return Object.freeze({...this.#values}); }
  protected translate(dx: number, dy: number, xs: readonly string[], ys: readonly string[]): void {
    Numbers.finite(dx); Numbers.finite(dy);
    const next = {...this.#values};
    for (const name of xs) next[name] = Numbers.finite(next[name]! + dx, name);
    for (const name of ys) next[name] = Numbers.finite(next[name]! + dy, name);
    this.#values = this.validated(next);
  }
  override scale(factor: number): void {
    Numbers.positive(factor, 'scale factor');
    this.#values = this.validated(Object.fromEntries(Object.entries(this.#values).map(([k,v]) => [k, v * factor])));
  }
  override setAttribute(name: string, value: string): void {
    if (Object.hasOwn(this.#values, name)) {
      this.#values = this.validated({...this.#values, [name]: Numbers.parse(value,name)});
    } else super.setAttribute(name,value);
  }
}
