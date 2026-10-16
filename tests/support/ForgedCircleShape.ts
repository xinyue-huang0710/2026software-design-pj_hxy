import { RectShape } from '../../src/domain/shapes/RectShape.js';
export class ForgedCircleShape extends RectShape {
  override get typeKey():string{return 'circle';}
}
