import { ContainerShape } from '../ContainerShape.js';
import type { ShapeStyle } from '../ShapeStyle.js';
export class GroupShape extends ContainerShape {
  constructor(id: string, style?: ShapeStyle) { super(id,'g',style); }
  override clone(): GroupShape {
    const copy = new GroupShape(this.id, this.clonedStyle());
    for (const child of this.children()) copy.insertAt(copy.children().length, child.clone());
    return copy;
  }
}
