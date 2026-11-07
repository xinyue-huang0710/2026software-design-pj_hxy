import type {Command,CommandResult,DirectoryReader,DirectoryEntry} from '@svgframe/core';
export class DirCommand implements Command {
  constructor(private readonly reader:DirectoryReader){}
  async execute():Promise<CommandResult>{
    const path=this.reader.currentDirectory();
    try{
      const entries=(await this.reader.read(path)).filter(e=>e.name!=='.'&&e.name!=='..');
      const order:Record<DirectoryEntry['kind'],number>={directory:0,file:1,link:2,other:3};
      const prefix:Record<DirectoryEntry['kind'],string>={directory:'[DIR]',file:'[FILE]',link:'[LINK]',other:'[OTHER]'};
      const sorted=[...entries].sort((a,b)=>order[a.kind]-order[b.kind]||(a.name<b.name?-1:a.name>b.name?1:0));
      return {lines:sorted.length?sorted.map(e=>prefix[e.kind]+'  '+e.name):['(empty directory)']};
    }catch{return {lines:['error: cannot read directory: '+path]};}
  }
}
