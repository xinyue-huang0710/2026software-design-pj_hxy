import type {Command,CommandContext,Token} from '@svgframe/core';
import type {CommandRegistry} from '@svgframe/core/internal';
export class CommandDispatcher {
  constructor(private readonly registry:CommandRegistry,private readonly context:CommandContext){}
  dispatch(tokens:readonly Token[]):Command|undefined{return this.registry.create(tokens,this.context);}
}
