import {readFileSync,existsSync,statSync} from 'node:fs';
import {resolve,dirname,join,isAbsolute,parse} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import type {PluginManifest,PluginConstructor,PluginOptions} from '@svgframe/core';
import {PluginInstaller} from './PluginInstaller.js';
interface ConfigEntry {module:string;enabled?:boolean;options?:PluginOptions;}
export class PluginLoader {
  constructor(private readonly installer:PluginInstaller){}
  manifest(entryUrl:string):PluginManifest{
    let dir=dirname(entryUrl.startsWith('file:')?fileURLToPath(entryUrl):entryUrl);
    while(dir!==parse(dir).root){
      const file=join(dir,'package.json');
      if(existsSync(file)){
        const manifest=JSON.parse(readFileSync(file,'utf8')) as PluginManifest;
        if(!manifest||typeof manifest.name!=='string'||!manifest.name||/[\r\n]/.test(manifest.name))throw Error('invalid plugin manifest');
        const c=manifest.contributes;
        if(c!==undefined&&(!c||typeof c!=='object'||Array.isArray(c)||Object.entries(c).some(([k,v])=>!['shapes','commands','decorators','attributes'].includes(k)||!Array.isArray(v)||v.some(n=>typeof n!=='string'))))throw Error('invalid plugin contributes');
        return manifest;
      }
      dir=dirname(dir);
    }
    throw Error('plugin package.json not found');
  }
  async loadConfig(path:string):Promise<readonly string[]>{
    let entries:ConfigEntry[];
    try{
      const config:unknown=JSON.parse(readFileSync(path,'utf8'));
      if(!config||typeof config!=='object'||Array.isArray(config)||Object.keys(config).some(k=>k!=='plugins'))throw Error();
      const plugins=(config as {plugins?:unknown}).plugins;
      if(!Array.isArray(plugins)||plugins.some(e=>!e||typeof e!=='object'||Array.isArray(e)||
        typeof e.module!=='string'||!e.module||/[\r\n]/.test(e.module)||Object.keys(e).some(k=>!['module','enabled','options'].includes(k))||
        (e.enabled!==undefined&&typeof e.enabled!=='boolean')||(e.options!==undefined&&(!e.options||typeof e.options!=='object'||Array.isArray(e.options)))))throw Error();
      entries=plugins;
    }catch{return ['error: invalid plugin config'];}
    const messages:string[]=[];
    for(const entry of entries){
      if(entry.enabled===false)continue;
      messages.push(...await this.load(entry,dirname(resolve(path))));
    }
    return messages;
  }
  private async load(entry:ConfigEntry,base:string):Promise<readonly string[]>{
    let resolved:string;
    try{
      const request=createRequire(join(base,'__plugin_resolver__.cjs'));
      const target=entry.module.startsWith('.')||isAbsolute(entry.module)?resolve(base,entry.module):entry.module;
      if(isAbsolute(target)&&existsSync(target)&&statSync(target).isDirectory()){
        const pkg=JSON.parse(readFileSync(join(target,'package.json'),'utf8'));
        resolved=request.resolve(resolve(target,typeof pkg.main==='string'?pkg.main:'index.js'));
      }else resolved=request.resolve(target);
    }catch(error){
      const code=(error as NodeJS.ErrnoException).code;
      if(code==='MODULE_NOT_FOUND'||code==='ENOENT')return ['error: plugin not found: '+entry.module];
      return ['error: plugin failed to activate: '+entry.module+' ('+this.reason(error)+')'];
    }
    let manifest:PluginManifest|undefined;
    try{
      manifest=this.manifest(resolved);
      const loaded=await import(pathToFileURL(resolved).href) as {default?:unknown};
      if(loaded.default===undefined)return ['error: plugin has no default export: '+entry.module];
      if(typeof loaded.default!=='function')throw Error('default export must be a plugin class');
      return this.installer.install(loaded.default as PluginConstructor,manifest,entry.options);
    }catch(error){return ['error: plugin failed to activate: '+(manifest?.name??entry.module)+' ('+this.reason(error)+')'];}
  }
  private reason(error:unknown):string{return String(error instanceof Error?error.message:error).replace(/[\r\n]+/g,' ');}
}
