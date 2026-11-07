import type { TreeView } from '@svgframe/core';

/** Replaceable presentation capability. Printers receive detached query data, not Shapes. */
export interface TreePrinter {
  format(tree:TreeView):readonly string[];
}
