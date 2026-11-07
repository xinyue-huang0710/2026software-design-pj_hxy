import type {Plugin,PluginContext,DirectoryReader} from '@svgframe/core';
import {DirRegistration} from './DirRegistration.js';
import {NodeDirectoryAdapter} from './NodeDirectoryAdapter.js';
export class DirPlugin implements Plugin {
  constructor(private readonly reader:DirectoryReader=new NodeDirectoryAdapter()){}
  activate(context:PluginContext):void{context.registerCommand(new DirRegistration(this.reader));}
}
