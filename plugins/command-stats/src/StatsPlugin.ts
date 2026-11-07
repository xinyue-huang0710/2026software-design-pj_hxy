import type {Plugin,PluginContext} from '@svgframe/core';
import {StatsRegistration} from './StatsRegistration.js';
export class StatsPlugin implements Plugin {
  activate(context:PluginContext):void {context.registerCommand(new StatsRegistration());}
}
