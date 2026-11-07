import { Numbers } from './Numbers.js';
import { EditorError } from './errors/EditorError.js';
export class ShapeStyle {
  #values = new Map<string, string>();
  set(name: string, value: string): void {
    if (!['fill', 'stroke', 'stroke-width'].includes(name)) throw new EditorError(`unknown attribute: ${name}`);
    if (name === 'stroke-width') Numbers.nonnegative(Numbers.parse(value, name), name);
    this.#values.set(name, value);
  }
  entries(): ReadonlyArray<readonly [string, string]> { return [...this.#values].map(pair => Object.freeze(pair)); }
  clone(): ShapeStyle { const result = new ShapeStyle(); for (const [k,v] of this.#values) result.set(k,v); return result; }
}
