import type {AttributeHandler} from '../contracts/AttributeHandler.js';
import type {EditFeedback} from '../contracts/ShapeAction.js';
import type {SvgDocument} from '../domain/SvgDocument.js';
import type {ShapeFactory} from './providers/ShapeFactory.js';
import {EditorError} from '../domain/errors/EditorError.js';
export class AttributeService {
  constructor(private readonly handlers:()=>readonly AttributeHandler[]){}
  set(doc:SvgDocument,factory:ShapeFactory,id:string,attr:string,value:string):EditFeedback|void {
    const shape=doc.findShape(id),target=Object.freeze({id,typeKey:shape.typeKey,container:shape.asContainer()!==null});
    const matches=this.handlers().filter(handler=>handler.handles(target,attr));
    if(matches.length>1)throw new EditorError('attribute handler conflict: '+id+'/'+attr);
    const handler=matches[0];
    if(handler)return handler.apply(Object.freeze({shape:(key:string)=>doc.findShape(key),inspect:(key:string)=>factory.inspect(doc.findShape(key))}),id,attr,value);
    shape.setAttribute(attr,value);
  }
}
