import type {Shape} from '../domain/Shape.js';
import type {ShapeProvider,ShapeView} from '../application/providers/ShapeProvider.js';
import type {CommandRegistration} from './CommandRegistration.js';
import type {TreeDecorator} from './TreeDecorator.js';
import type {AttributeHandler} from './AttributeHandler.js';
export type PluginOptions=Readonly<Record<string,unknown>>;
export interface ShapeCreation {
  create(type:string,id:string,args:readonly string[]):Shape;
  inspect(shape:Shape):ShapeView;
}
export interface PluginContext {
  readonly shapes:ShapeCreation;
  registerShape<T extends Shape>(provider:ShapeProvider<T>):void;
  registerCommand(command:CommandRegistration):void;
  registerDecorator(decorator:TreeDecorator):void;
  registerAttribute(handler:AttributeHandler):void;
}
export interface Plugin {activate(context:PluginContext,options:PluginOptions):void;}
export interface PluginManifest {
  readonly name:string;
  readonly contributes?:Partial<Record<'shapes'|'commands'|'decorators'|'attributes',readonly string[]>>;
}
export interface PluginConstructor {new():Plugin;}
