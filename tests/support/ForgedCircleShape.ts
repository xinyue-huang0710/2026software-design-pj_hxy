import { RectShape } from '../../plugins/builtin-shapes/src/shapes/RectShape.js';
export class ForgedCircleShape extends RectShape {
  override get typeKey():string{return 'circle';}
}
