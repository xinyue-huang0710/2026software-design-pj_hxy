import type {Plugin,PluginContext} from '@svgframe/core';
import {BoxTypeDecorator} from './BoxTypeDecorator.js';
export class BoxTypePlugin implements Plugin {
  activate(context:PluginContext):void{context.registerDecorator(new BoxTypeDecorator());}
}
