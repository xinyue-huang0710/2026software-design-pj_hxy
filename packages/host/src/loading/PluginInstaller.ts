import type {PluginConstructor,PluginManifest,PluginOptions} from '@svgframe/core';
import type {ExtensionRegistry} from '@svgframe/core/internal';
export class PluginInstaller {
  constructor(private readonly registry:ExtensionRegistry){}
  install(PluginClass:PluginConstructor,manifest:PluginManifest,options:PluginOptions={}):readonly string[]{
    try{this.registry.install(new PluginClass(),manifest,options);return [];}
    catch(error){
      const reason=String(error instanceof Error?error.message:error).replace(/[\r\n]+/g,' ');
      if(reason.startsWith('duplicate registration:')||reason.startsWith('plugin manifest mismatch:'))return ['error: '+reason];
      return ['error: plugin failed to activate: '+manifest.name+' ('+reason+')'];
    }
  }
}
