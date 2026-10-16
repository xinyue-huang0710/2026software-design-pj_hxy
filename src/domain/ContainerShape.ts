import { Shape } from './Shape.js';
import { Numbers } from './Numbers.js';
import { EditorError } from './errors/EditorError.js';
export abstract class ContainerShape extends Shape {
  #children: Shape[] = [];
  override asContainer(): ContainerShape { return this; }
  override children(): readonly Shape[] { return Object.freeze([...this.#children]); }
  canUngroup(): boolean { return true; }
  /** Internal document operation; SvgDocument validates global ownership and IDs first. */
  insertAt(index: number, shape: Shape): void {
    if (!Number.isInteger(index) || index < 0 || index > this.#children.length) throw new EditorError('invalid child position');
    if (shape === this || this.contains(shape) || shape.asContainer()?.contains(this)) throw new EditorError('cannot create a cycle or duplicate child');
    this.#children.splice(index,0,shape);
  }
  /** Internal document operation. */
  detach(shape: Shape): void {
    const index = this.#children.indexOf(shape);
    if (index < 0) throw new EditorError('child does not belong to container');
    this.#children.splice(index,1);
  }
  contains(shape: Shape): boolean {
    return this.#children.some(child => child === shape || child.asContainer()?.contains(shape));
  }
  override move(dx: number, dy: number): void {
    Numbers.finite(dx); Numbers.finite(dy);
    for (const child of this.#children) child.move(dx,dy);
  }
  override scale(factor: number): void {
    Numbers.positive(factor,'scale factor');
    for (const child of this.#children) child.scale(factor);
  }
}
