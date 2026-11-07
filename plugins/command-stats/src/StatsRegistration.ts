import {EditorError} from '@svgframe/core';
import type {CommandRegistration,CommandContext,Token} from '@svgframe/core';
import {StatsCommand} from './StatsCommand.js';
export class StatsRegistration implements CommandRegistration {
  readonly name='stats';readonly help=['stats — count leaf types and containers'];
  create(tokens:readonly Token[],context:CommandContext):StatsCommand {
    if(tokens.length)throw new EditorError('stats takes no arguments');return new StatsCommand(context.queries);
  }
}
