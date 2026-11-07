import {ShapeFactory} from './providers/ShapeFactory.js';
import {CommandRegistry} from './CommandRegistry.js';
import type {PluginContext,PluginManifest,Plugin} from '../contracts/Plugin.js';
import type {ShapeProvider} from './providers/ShapeProvider.js';
import type {Shape} from '../domain/Shape.js';
import type {CommandRegistration} from '../contracts/CommandRegistration.js';
import type {TreeDecorator} from '../contracts/TreeDecorator.js';
import type {AttributeHandler} from '../contracts/AttributeHandler.js';
import {EditorError} from '../domain/errors/EditorError.js';
/** Atomic registration state; module discovery/activation orchestration belongs to the host. */
export class ExtensionRegistry {
  readonly shapes=new ShapeFactory();readonly commands=new CommandRegistry();
  readonly decorators=new Map<string,TreeDecorator>();readonly attributes=new Map<string,AttributeHandler>();
  install(plugin:Plugin,manifest:PluginManifest,options:Readonly<Record<string,unknown>>={}):void {
    const staged:{shapes:ShapeProvider<Shape>[];commands:CommandRegistration[];decorators:TreeDecorator[];attributes:AttributeHandler[]}={shapes:[],commands:[],decorators:[],attributes:[]};
    let active=false,closed=false;
    const nameOf=(category:keyof typeof staged,value:unknown):string=>category==='shapes'?(value as ShapeProvider<Shape>).typeKey:(value as {name:string}).name;
    const exists=(category:keyof typeof staged,name:string):boolean=>category==='shapes'?this.shapes.has(name):category==='commands'?this.commands.has(name):this[category].has(name);
    const add=(category:keyof typeof staged,value:any):void=>{
      if(closed)throw new EditorError('registration context is closed');
      const name=nameOf(category,value);
      if(typeof name!=='string'||!name||/[\s\r\n]/.test(name))throw new EditorError('invalid registration name');
      if(exists(category,name)||staged[category].some(v=>nameOf(category,v)===name))throw new EditorError('duplicate registration: '+category+'/'+name);
      const methods={shapes:['create','fromSvg','inspect','toSvgElement','accepts'],commands:['create'],decorators:['decorate'],attributes:['handles','apply']}[category];
      if(methods.some(key=>typeof value[key]!=='function'))throw new EditorError('invalid registration contract: '+category+'/'+name);
      if(category==='commands'&&(!Array.isArray(value.help)||value.help.some((line:unknown)=>typeof line!=='string')))throw new EditorError('invalid command help: '+name);
      (staged[category] as any[]).push(value);
    };
    const context:PluginContext=Object.freeze({
      shapes:Object.freeze({create:(type:string,id:string,args:readonly string[])=>{
        if(!active)throw new EditorError('shape creation is unavailable during activation');return this.shapes.create(type,id,args);
      },inspect:(shape:Shape)=>{if(!active)throw new EditorError('shape query is unavailable during activation');return this.shapes.inspect(shape);}}),
      registerShape:<T extends Shape>(v:ShapeProvider<T>)=>add('shapes',v),
      registerCommand:(v:CommandRegistration)=>add('commands',v),registerDecorator:(v:TreeDecorator)=>add('decorators',v),registerAttribute:(v:AttributeHandler)=>add('attributes',v)
    });
    try{
      const result=plugin.activate(context,Object.freeze({...options})) as unknown;
      if(result&&typeof (result as PromiseLike<unknown>).then==='function'){
        void Promise.resolve(result).catch(()=>{});throw new EditorError('activate must be synchronous');
      }
      const declared=manifest.contributes??{};
      for(const category of Object.keys(staged) as (keyof typeof staged)[]){
        const expected=declared[category]??[],actual=staged[category].map(v=>nameOf(category,v)).sort();
        if(!Array.isArray(expected)||expected.some(n=>typeof n!=='string')||new Set(expected).size!==expected.length||
          JSON.stringify([...expected].sort())!==JSON.stringify(actual)){
          throw new EditorError('plugin manifest mismatch: '+manifest.name+' (declared: '+JSON.stringify(declared)+', registered: '+JSON.stringify(Object.fromEntries(Object.entries(staged).map(([k,vs])=>[k,vs.map(v=>nameOf(k as keyof typeof staged,v)).sort()])))+')');
        }
      }
      const next=this.shapes.copy();
      for(const provider of staged.shapes)next.register(provider);
      this.shapes.replaceWith(next);
      staged.commands.forEach(v=>this.commands.register(v));
      staged.decorators.forEach(v=>this.decorators.set(v.name,v));
      staged.attributes.forEach(v=>this.attributes.set(v.name,v));
      active=true;
    } finally {closed=true;}
  }
}
