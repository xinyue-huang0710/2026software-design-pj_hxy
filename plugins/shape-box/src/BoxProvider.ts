import {Numbers,EditorError} from '@svgframe/core';
import type {Shape,ShapeCreation,ShapeProvider,ShapeView,SvgElementData,ShapeAction,EditFeedback} from '@svgframe/core';
import {BoxShape} from './BoxShape.js';
export class BoxProvider implements ShapeProvider<BoxShape> {
  readonly typeKey='box';readonly accepts=(shape:Shape):shape is BoxShape=>shape instanceof BoxShape;
  constructor(private readonly factory:ShapeCreation){}
  create(id:string,args:readonly string[]):BoxShape {
    if(args.length!==5)throw new EditorError('invalid parameters for box');
    const [x,y,w,h]=args.slice(0,4).map((s,i)=>Numbers.parse(s,['x','y','width','height'][i]!));
    return new BoxShape(id,[
      this.factory.create('rect',id+'-rect',[String(x),String(y),String(w),String(h),'#4a90d9']),
      this.factory.create('text',id+'-label',[String(x!+20),String(y!+35),args[4]!])
    ]);
  }
  fromSvg(id:string,element:SvgElementData,children:readonly Shape[]):BoxShape {
    if(element.tag!=='g'||element.attributes['data-kind']!=='box')throw new EditorError('invalid box SVG element');
    const shape=new BoxShape(id,children);
    for(const [key,value]of Object.entries(element.attributes)){
      if(key==='id'||key==='data-kind')continue;
      if(!['fill','stroke','stroke-width'].includes(key))throw new EditorError('unsupported attribute: '+key);
      shape.setAttribute(key,value);
    }
    if(element.text?.trim())throw new EditorError('unexpected text in box');
    return shape;
  }
  inspect(shape:BoxShape):ShapeView {return {id:shape.id,label:'g#'+shape.id,inline:'',properties:[],styles:shape.styleEntries()};}
  toSvgElement(shape:BoxShape):SvgElementData {return {tag:'g',attributes:{id:shape.id,'data-kind':'box',...Object.fromEntries(shape.styleEntries())}};}
  feedback(shape:BoxShape,action:ShapeAction):EditFeedback|undefined {
    if(action.kind==='create')return {lines:['box#'+shape.id+' created (g#'+shape.id+' + rect#'+shape.id+'-rect + text#'+shape.id+'-label)'+(action.values.parentSuffix??'')]};
    if(action.kind==='move'){
      const {dx,dy}=action.values,lines=['box#'+shape.id+' moved by ('+dx+','+dy+')'];
      return {lines,undo:['box#'+shape.id+' moved back by ('+-Number(dx)+','+-Number(dy)+')'],redo:lines};
    }
    if(action.kind==='scale')return {lines:['box#'+shape.id+' scaled by '+action.values.factor]};
    return undefined;
  }
}
