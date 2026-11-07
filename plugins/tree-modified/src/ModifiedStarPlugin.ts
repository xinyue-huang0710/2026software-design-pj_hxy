import type {Plugin,PluginContext} from '@svgframe/core';
import {ModifiedStarDecorator} from './ModifiedStarDecorator.js';
export class ModifiedStarPlugin implements Plugin {
  activate(context:PluginContext):void{context.registerDecorator(new ModifiedStarDecorator());}
}
