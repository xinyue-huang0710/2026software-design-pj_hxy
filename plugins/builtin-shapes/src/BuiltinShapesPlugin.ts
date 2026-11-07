import type {Plugin,PluginContext} from '@svgframe/core';
import {RectProvider} from './providers/RectProvider.js';
import {CircleProvider} from './providers/CircleProvider.js';
import {EllipseProvider} from './providers/EllipseProvider.js';
import {LineProvider} from './providers/LineProvider.js';
import {TextProvider} from './providers/TextProvider.js';
import {GroupProvider} from './providers/GroupProvider.js';
export class BuiltinShapesPlugin implements Plugin {
  activate(context:PluginContext):void {
    context.registerShape(new RectProvider());context.registerShape(new CircleProvider());
    context.registerShape(new EllipseProvider());context.registerShape(new LineProvider());
    context.registerShape(new TextProvider());context.registerShape(new GroupProvider());
  }
}
