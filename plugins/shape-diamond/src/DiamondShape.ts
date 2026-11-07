import {Shape,Numbers} from '@svgframe/core';
import type {ShapeStyle} from '@svgframe/core';
interface Bounds {readonly cx:number;readonly cy:number;readonly width:number;readonly height:number;}
type Point=readonly [number,number];
/** Axis-aligned diamond described by its centre and bounding-box dimensions. */
export class DiamondShape extends Shape {
  #bounds:Bounds;
  constructor(id:string,cx:number,cy:number,width:number,height:number,style?:ShapeStyle){
    super(id,'diamond',style);this.#bounds=this.validated({cx,cy,width,height});
  }
  geometry():Bounds{return Object.freeze({...this.#bounds});}
  vertices():readonly Point[]{return this.points(this.#bounds);}
  private points(b:Bounds):readonly Point[]{
    const {cx,cy,width,height}=b;
    return Object.freeze([
      Object.freeze([cx,cy-height/2] as const),Object.freeze([cx+width/2,cy] as const),
      Object.freeze([cx,cy+height/2] as const),Object.freeze([cx-width/2,cy] as const)
    ]);
  }
  private validated(b:Bounds):Bounds{
    const next={cx:Numbers.finite(b.cx,'cx'),cy:Numbers.finite(b.cy,'cy'),
      width:Numbers.nonnegative(b.width,'width'),height:Numbers.nonnegative(b.height,'height')};
    for(const [x,y]of this.points(next)){Numbers.finite(x,'diamond vertex x');Numbers.finite(y,'diamond vertex y');}
    return Object.freeze(next);
  }
  override move(dx:number,dy:number):void{
    Numbers.finite(dx,'dx');Numbers.finite(dy,'dy');
    this.#bounds=this.validated({...this.#bounds,cx:this.#bounds.cx+dx,cy:this.#bounds.cy+dy});
  }
  override scale(factor:number):void{
    Numbers.positive(factor,'scale factor');const b=this.#bounds;
    this.#bounds=this.validated({cx:b.cx*factor,cy:b.cy*factor,width:b.width*factor,height:b.height*factor});
  }
  override setAttribute(name:string,value:string):void{
    if(Object.hasOwn(this.#bounds,name))this.#bounds=this.validated({...this.#bounds,[name]:Numbers.parse(value,name)});
    else super.setAttribute(name,value);
  }
  override clone():DiamondShape{
    const b=this.#bounds;return new DiamondShape(this.id,b.cx,b.cy,b.width,b.height,this.clonedStyle());
  }
}
