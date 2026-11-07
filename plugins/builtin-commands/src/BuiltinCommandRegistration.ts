import type {Command,CommandRegistration,CommandContext,Token} from '@svgframe/core';
export class BuiltinCommandRegistration implements CommandRegistration {
  readonly help:readonly string[]=[];
  constructor(readonly name:string,private readonly build:(context:CommandContext,tokens:readonly Token[])=>Command){}
  create(tokens:readonly Token[],context:CommandContext):Command{return this.build(context,tokens);}
}
