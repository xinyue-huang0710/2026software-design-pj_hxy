import {Numbers,EditorError} from '@svgframe/core';
import type {Shape,ShapeProvider,ShapeView,SvgElementData} from '@svgframe/core';
import {DiamondShape} from './DiamondShape.js';
export class DiamondProvider implements ShapeProvider<DiamondShape> {
  readonly typeKey='diamond';
  readonly accepts=(shape:Shape):shape is DiamondShape=>shape instanceof DiamondShape;
  create(id:string,args:readonly string[]):DiamondShape{
    if(args.length<4||args.length>5)throw new EditorError('invalid parameters for diamond');
    const values=args.slice(0,4).map((v,i)=>Numbers.parse(v,['cx','cy','width','height'][i]!));
    const shape=new DiamondShape(id,values[0]!,values[1]!,values[2]!,values[3]!);
    if(args[4]!==undefined)shape.setAttribute('fill',args[4]);
    return shape;
  }
  fromSvg(id:string,element:SvgElementData,children:readonly Shape[]):DiamondShape{
    const a=element.attributes;
    if(element.tag!=='polygon'||a['data-kind']!=='diamond')throw new EditorError('invalid diamond SVG element');
    if(children.length||element.children?.length)throw new EditorError('unsupported children in diamond');
    if(element.text?.trim())throw new EditorError('unexpected text in diamond');
    const fields=['cx','cy','width','height'] as const;
    const allowed=new Set(['id','data-kind','points',...fields.map(k=>'data-'+k),'fill','stroke','stroke-width']);
    for(const key of Object.keys(a))if(!allowed.has(key))throw new EditorError('unsupported attribute: '+key);
    const args=fields.map(k=>{const value=a['data-'+k];if(value===undefined)throw new EditorError('missing diamond attribute: data-'+k);return value;});
    const shape=this.create(id,args);
    if(a.points===undefined)throw new EditorError('missing diamond attribute: points');
    const points=a.points.trim().split(/[\s,]+/).map(v=>Numbers.parse(v,'diamond point'));
    const expected=shape.vertices().flat();
    if(points.length!==expected.length||points.some((v,i)=>v!==expected[i]))throw new EditorError('diamond points do not match geometry');
    for(const key of ['fill','stroke','stroke-width'])if(a[key]!==undefined)shape.setAttribute(key,a[key]!);
    return shape;
  }
  inspect(shape:DiamondShape):ShapeView{
    const b=shape.geometry();
    return Object.freeze({id:shape.id,label:'diamond#'+shape.id,
      inline:'cx='+b.cx+' cy='+b.cy+' w='+b.width+' h='+b.height,
      properties:Object.freeze(Object.entries(b).map(([key,value])=>Object.freeze([key,String(value)] as const))),
      styles:shape.styleEntries()});
  }
  toSvgElement(shape:DiamondShape):SvgElementData{
    return {tag:'polygon',attributes:{id:shape.id,'data-kind':'diamond',
      ...Object.fromEntries(Object.entries(shape.geometry()).map(([k,v])=>['data-'+k,String(v)])),
      points:shape.vertices().map(([x,y])=>x+','+y).join(' '),...Object.fromEntries(shape.styleEntries())}};
  }
}
