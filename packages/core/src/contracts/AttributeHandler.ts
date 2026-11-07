import type {Shape} from '../domain/Shape.js';
import type {ShapeView} from '../application/providers/ShapeProvider.js';
import type {EditFeedback} from './ShapeAction.js';
export interface AttributeTarget {readonly id:string;readonly typeKey:string;readonly container:boolean;}
export interface AttributeEditContext {shape(id:string):Shape;inspect(id:string):ShapeView;}
export interface AttributeHandler {
  readonly name:string;
  handles(target:AttributeTarget,attribute:string):boolean;
  apply(context:AttributeEditContext,id:string,attribute:string,value:string):EditFeedback|void;
}
