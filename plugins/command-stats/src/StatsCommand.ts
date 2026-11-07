import type {Command,CommandResult,QueryPort,NodeSnapshot} from '@svgframe/core';
export class StatsCommand implements Command {
  constructor(private readonly queries:QueryPort){}
  execute():CommandResult {
    const counts=new Map<string,number>();let containers=0,total=0;
    const visit=(node:NodeSnapshot):void=>{
      if(node.container){containers++;node.children.forEach(visit);}
      else{counts.set(node.typeKey,(counts.get(node.typeKey)??0)+1);total++;}
    };
    this.queries.snapshot().children.forEach(visit);
    return {lines:[[...counts].map(([kind,count])=>kind+': '+count).concat('(total '+total+', containers '+containers+')').join('  ')]};
  }
}
