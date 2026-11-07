import {EditorError} from '@svgframe/core';
import type {CommandRegistration,Token,DirectoryReader} from '@svgframe/core';
import {DirCommand} from './DirCommand.js';
export class DirRegistration implements CommandRegistration {
  readonly name='dir';readonly help=['dir — list the process working directory'];
  constructor(private readonly reader:DirectoryReader){}
  create(tokens:readonly Token[]):DirCommand{
    if(tokens.length)throw new EditorError('dir takes no arguments');return new DirCommand(this.reader);
  }
}
