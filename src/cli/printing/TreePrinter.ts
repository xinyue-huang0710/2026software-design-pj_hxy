import type { TreeView } from '../../application/queries/ShapeQueryService.js';

/** Replaceable presentation capability. Printers receive detached query data, not Shapes. */
export interface TreePrinter {
  format(tree:TreeView):readonly string[];
}
