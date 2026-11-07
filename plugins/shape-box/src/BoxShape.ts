import {ContainerShape,EditorError} from '@svgframe/core';
import type {Shape,ShapeStyle} from '@svgframe/core';
export class BoxShape extends ContainerShape {
  constructor(id:string,children:readonly Shape[],style?:ShapeStyle){
    super(id,'box',style);children.forEach(child=>this.insertAt(this.children().length,child));this.validateStructure();
  }
  override canUngroup():boolean{return false;}
  override validateStructure():void{
    for(const [suffix,type]of [['-rect','rect'],['-label','text']] as const){
      const matches=this.children().filter(c=>c.id===this.id+suffix);
      if(matches.length!==1||matches[0]!.typeKey!==type||matches[0]!.asContainer()!==null)
        throw new EditorError('invalid box structure: '+this.id+' requires '+type+'#'+this.id+suffix);
    }
  }
  body():Shape{this.validateStructure();return this.children().find(c=>c.id===this.id+'-rect')!;}
  label():Shape{this.validateStructure();return this.children().find(c=>c.id===this.id+'-label')!;}
  override clone():BoxShape{return new BoxShape(this.id,this.children().map(c=>c.clone()),this.clonedStyle());}
}
