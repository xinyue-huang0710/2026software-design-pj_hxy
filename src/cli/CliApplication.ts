import { createInterface } from 'node:readline';
import type { Readable,Writable } from 'node:stream';
import type { CommandInvoker } from '../application/CommandInvoker.js';
import { CommandDispatcher } from './CommandDispatcher.js';
import { Tokenizer } from './Tokenizer.js';
import type { TreePrinter } from './printing/TreePrinter.js';
import { ShowFormatter } from './ShowFormatter.js';
export class CliApplication {
  readonly #tokenizer=new Tokenizer();readonly #show=new ShowFormatter();
  constructor(private readonly dispatcher:CommandDispatcher,private readonly invoker:CommandInvoker,private readonly treePrinter:TreePrinter) {}
  async executeLine(line:string):Promise<readonly string[]> {
    try {
      const command=this.dispatcher.dispatch(this.#tokenizer.tokenize(line));
      if(!command) return [];
      const result=await this.invoker.executeCommand(command);
      return [...result.lines,...(result.tree?this.treePrinter.format(result.tree):[]),
        ...(result.detail?this.#show.format(result.detail):[])];
    } catch(error){
      const message=error instanceof Error?error.message:String(error);
      return ['error: '+message.replace(/[\r\n]+/g,' ')];
    }
  }
  async run(input:Readable,output:Writable,interactive:boolean):Promise<void> {
    const rl=createInterface({input,output,terminal:interactive,prompt:'svg> '});
    output.write("svg-editor 0.1 — type 'help' for commands\n");
    if(interactive) rl.prompt();
    try {
      for await(const line of rl){
        for(const result of await this.executeLine(line)) output.write(result+'\n');
        if(interactive) rl.prompt();
      }
    } finally {rl.close();}
  }
}
