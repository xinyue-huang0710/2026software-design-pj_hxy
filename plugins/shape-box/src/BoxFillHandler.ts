import {EditorError} from '@svgframe/core';
import type {AttributeHandler,AttributeTarget,AttributeEditContext,EditFeedback} from '@svgframe/core';
import {BoxShape} from './BoxShape.js';
export class BoxFillHandler implements AttributeHandler {
  readonly name='box-fill';
  handles(target:AttributeTarget,attr:string):boolean{return target.typeKey==='box'&&attr==='fill';}
  apply(context:AttributeEditContext,id:string,_attr:string,value:string):EditFeedback {
    const shape=context.shape(id);if(!(shape instanceof BoxShape))throw new EditorError('invalid box target: '+id);
    const body=shape.body(),before=body.styleEntries().find(([k])=>k==='fill')?.[1];
    body.setAttribute('fill',value);
    const lines=['box#'+id+' fill propagated to '+body.id];
    return {lines,undo:['box#'+id+' fill restored: '+(before??'(unset)')],redo:lines};
  }
}
