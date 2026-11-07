import {ContainerShape} from './ContainerShape.js';
/** Structural document root; not a registered SVG shape. */
export class DocumentRoot extends ContainerShape {
  constructor(){super('__document_root__','__root__');}
  override clone():DocumentRoot {
    const copy=new DocumentRoot();for(const child of this.children())copy.insertAt(copy.children().length,child.clone());return copy;
  }
}
