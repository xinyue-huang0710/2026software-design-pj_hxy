import {EditorError} from '@svgframe/core';
import type {AttributeHandler,AttributeTarget,AttributeEditContext,EditFeedback} from '@svgframe/core';
import {BoxShape} from './BoxShape.js';
export class BoxLabelHandler implements AttributeHandler {
  readonly name='box-label';
  handles(target:AttributeTarget,attr:string):boolean{return target.typeKey==='box'&&attr==='label';}
  apply(context:AttributeEditContext,id:string,_attr:string,value:string):EditFeedback {
    const shape=context.shape(id);if(!(shape instanceof BoxShape))throw new EditorError('invalid box target: '+id);
    const label=shape.label(),before=context.inspect(label.id).properties.find(([name])=>name==='text')?.[1]??'';
    label.setAttribute('text',value);
    const lines=['box#'+id+' label updated: '+JSON.stringify(value)];
    return {lines,undo:['box#'+id+' label restored: '+JSON.stringify(before)],redo:lines};
  }
}
