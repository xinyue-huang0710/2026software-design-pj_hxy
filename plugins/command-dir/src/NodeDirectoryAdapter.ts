import {readdir} from 'node:fs/promises';
import type {DirectoryReader,DirectoryEntry} from '@svgframe/core';
/** Adapts Node fs Dirent objects to the public directory port. Never follows links. */
export class NodeDirectoryAdapter implements DirectoryReader {
  constructor(private readonly cwd:()=>string=()=>process.cwd()){}
  currentDirectory():string{return this.cwd();}
  async read(path:string):Promise<readonly DirectoryEntry[]>{
    const entries=await readdir(path,{withFileTypes:true});
    return entries.map(entry=>Object.freeze({name:entry.name,kind:entry.isSymbolicLink()?'link':entry.isDirectory()?'directory':entry.isFile()?'file':'other'}));
  }
}
