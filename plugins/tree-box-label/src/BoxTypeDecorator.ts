import type {TreeDecorator,TreeLine} from '@svgframe/core';
export class BoxTypeDecorator implements TreeDecorator {
  readonly name='box-type-label';
  decorate(line:TreeLine):string|undefined{return !line.root&&line.node?.typeKey==='box'?'(box)':undefined;}
}
