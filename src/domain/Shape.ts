import { ShapeStyle } from './ShapeStyle.js';
import { EditorError } from './errors/EditorError.js';
import type { ContainerShape } from './ContainerShape.js';
export abstract class Shape {
  #id: string;
  #typeKey: string;
  #style: ShapeStyle;
  protected constructor(id: string, typeKey: string, style = new ShapeStyle()) {
    if (!id || /[\s\u0000-\u001f]/u.test(id)) throw new EditorError(`invalid id: ${id}`);
    this.#id = id; this.#typeKey = typeKey; this.#style = style.clone();
  }
  get id(): string { return this.#id; }
  get typeKey(): string { return this.#typeKey; }
  styleEntries(): ReadonlyArray<readonly [string,string]> { return this.#style.entries(); }
  protected clonedStyle(): ShapeStyle { return this.#style.clone(); }
  setAttribute(name: string, value: string): void { this.#style.set(name, value); }
  asContainer(): ContainerShape | null { return null; }
  children(): readonly Shape[] { return []; }
  abstract move(dx: number, dy: number): void;
  abstract scale(factor: number): void;
  abstract clone(): Shape;
}
