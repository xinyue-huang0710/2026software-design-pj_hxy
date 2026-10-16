import { ShapeFactory } from './application/providers/ShapeFactory.js';
import { EditorSession } from './application/EditorSession.js';
import { HistoryManager } from './application/history/HistoryManager.js';
import { CommandInvoker } from './application/CommandInvoker.js';
import type { DocumentStore } from './application/ports/DocumentStore.js';
import { FileDocumentStore } from './infrastructure/storage/FileDocumentStore.js';
import { SvgReader } from './infrastructure/svg/SvgReader.js';
import { SvgWriter } from './infrastructure/svg/SvgWriter.js';
import { RectProvider } from './infrastructure/providers/RectProvider.js';
import { CircleProvider } from './infrastructure/providers/CircleProvider.js';
import { EllipseProvider } from './infrastructure/providers/EllipseProvider.js';
import { LineProvider } from './infrastructure/providers/LineProvider.js';
import { TextProvider } from './infrastructure/providers/TextProvider.js';
import { GroupProvider } from './infrastructure/providers/GroupProvider.js';
/** Composition root: only this outer module assembles concrete infrastructure. */
export class EditorRuntime {
  readonly factory=new ShapeFactory();
  readonly history=new HistoryManager();
  readonly reader:SvgReader;
  readonly writer:SvgWriter;
  readonly session:EditorSession;
  readonly invoker:CommandInvoker;
  constructor(store:DocumentStore=new FileDocumentStore()){
    this.factory.register(new RectProvider());this.factory.register(new CircleProvider());
    this.factory.register(new EllipseProvider());this.factory.register(new LineProvider());
    this.factory.register(new TextProvider());this.factory.register(new GroupProvider());
    this.reader=new SvgReader(this.factory);this.writer=new SvgWriter(this.factory);
    this.session=new EditorSession(this.factory,store,this.reader,this.writer);
    this.invoker=new CommandInvoker(this.session,this.history);
  }
}
