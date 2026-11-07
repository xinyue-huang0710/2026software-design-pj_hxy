import type {Plugin,PluginContext} from '@svgframe/core';
import {BoxProvider} from './BoxProvider.js';
import {BoxFillHandler} from './BoxFillHandler.js';
import {BoxLabelHandler} from './BoxLabelHandler.js';
export class BoxPlugin implements Plugin {
  activate(context:PluginContext):void{
    context.registerShape(new BoxProvider(context.shapes));
    context.registerAttribute(new BoxFillHandler());context.registerAttribute(new BoxLabelHandler());
  }
}
