import type { TreePrinter } from '../../src/cli/printing/TreePrinter.js';
import type { TreeView,TreeNode } from '../../src/application/queries/ShapeQueryService.js';
import { OutlineLibrary } from './OutlineLibrary.js';
import type { OutlineNode } from './OutlineLibrary.js';

/** Adapter: converts the application's tree view to an existing printer's input. */
export class OutlineTreeAdapter implements TreePrinter {
  constructor(private readonly adaptee:OutlineLibrary) {}
  format(tree:TreeView):readonly string[] {
    const node=(source:TreeNode):OutlineNode=>({
      title:source.view.label+' '+source.view.properties.map(([k,v])=>k+'='+v).join(' '),
      descendants:source.children.map(node)
    });
    const roots=tree.nodes.map(node);
    const output=this.adaptee.draw(tree.heading===undefined?roots:[{title:tree.heading,descendants:roots}]);
    return output?output.split('\n'):[];
  }
}
