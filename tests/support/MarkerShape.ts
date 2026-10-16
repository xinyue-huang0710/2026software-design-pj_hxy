import { NumericShape } from '../../src/domain/NumericShape.js';
export class MarkerShape extends NumericShape {
  constructor(id:string,x:number,y:number,size:number){super(id,'marker',{x,y,size},['size']);}
  get x():number{return this.value('x');}
  get y():number{return this.value('y');}
  get size():number{return this.value('size');}
  move(dx:number,dy:number):void{this.translate(dx,dy,['x'],['y']);}
  clone():MarkerShape {
    const copy=new MarkerShape(this.id,this.x,this.y,this.size);
    for(const [k,v] of this.styleEntries())copy.setAttribute(k,v);
    return copy;
  }
}
