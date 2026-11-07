import {ExtensionRegistry,EditorSession,HistoryManager,CommandInvoker,AttributeService,TreeDecorationService} from '@svgframe/core/internal';
import type {DocumentStore,CommandContext} from '@svgframe/core';
import BuiltinShapesPlugin from '@svgframe/builtin-shapes';
import BuiltinCommandsPlugin from '@svgframe/builtin-commands';
import {FileDocumentStore} from './io/storage/FileDocumentStore.js';
import {SvgReader} from './io/svg/SvgReader.js';
import {SvgWriter} from './io/svg/SvgWriter.js';
import {PluginInstaller} from './loading/PluginInstaller.js';
import {PluginLoader} from './loading/PluginLoader.js';
export class EditorRuntime {
  readonly registry=new ExtensionRegistry();readonly factory=this.registry.shapes;
  readonly history=new HistoryManager();readonly reader:SvgReader;readonly writer:SvgWriter;
  readonly session:EditorSession;readonly invoker:CommandInvoker;
  readonly installer=new PluginInstaller(this.registry);readonly loader=new PluginLoader(this.installer);
  readonly context:CommandContext;
  constructor(store:DocumentStore=new FileDocumentStore()){
    const errors=[
      ...this.installer.install(BuiltinShapesPlugin,this.loader.manifest(import.meta.resolve('@svgframe/builtin-shapes'))),
      ...this.installer.install(BuiltinCommandsPlugin,this.loader.manifest(import.meta.resolve('@svgframe/builtin-commands')))
    ];if(errors.length)throw Error(errors.join('; '));
    this.reader=new SvgReader(this.factory);this.writer=new SvgWriter(this.factory);
    this.session=new EditorSession(this.factory,store,this.reader,this.writer,
      id=>this.factory.create('g',id,[]).asContainer()!,
      new AttributeService(()=>[...this.registry.attributes.values()]),new TreeDecorationService(this.registry.decorators));
    this.invoker=new CommandInvoker(this.session,this.history);
    this.context=Object.freeze({editor:this.session,history:this.history,queries:Object.freeze({snapshot:()=>this.session.contentSnapshot()}),help:()=>this.registry.commands.help()});
  }
}
