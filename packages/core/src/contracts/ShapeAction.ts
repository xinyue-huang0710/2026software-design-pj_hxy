export interface ShapeAction {readonly kind:string;readonly values:Readonly<Record<string,string|number>>;}
export interface EditFeedback {readonly lines:readonly string[];readonly undo?:readonly string[];readonly redo?:readonly string[];}
