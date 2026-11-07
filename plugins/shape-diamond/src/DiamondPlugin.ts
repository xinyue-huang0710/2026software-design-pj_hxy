import type {Plugin,PluginContext} from '@svgframe/core';
import {DiamondProvider} from './DiamondProvider.js';
export class DiamondPlugin implements Plugin {
  activate(context:PluginContext):void{context.registerShape(new DiamondProvider());}
}
