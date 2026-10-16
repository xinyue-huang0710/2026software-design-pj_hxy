import type { DetailView } from '../application/queries/ShapeQueryService.js';
export class ShowFormatter {
  format(detail:DetailView):readonly string[] {
    const view=detail.view,lines=[`${view.label}  parent=${detail.parent}`];
    const value=(v:string):string=>v===''||/[\s"\\]/.test(v)?JSON.stringify(v):v;
    if(view.properties.length) lines.push('  '+view.properties.map(([k,v])=>`${k}=${value(v)}`).join(' '));
    if(view.styles.length) lines.push('  '+view.styles.map(([k,v])=>`${k}=${value(v)}`).join(' '));
    return lines;
  }
}
