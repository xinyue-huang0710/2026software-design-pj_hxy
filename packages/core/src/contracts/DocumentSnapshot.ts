export interface NodeSnapshot {
  readonly id:string;readonly typeKey:string;readonly container:boolean;
  readonly attributes:Readonly<Record<string,string>>;readonly text?:string;
  readonly children:readonly NodeSnapshot[];
}
export interface DocumentSnapshot {readonly width:number;readonly height:number;readonly children:readonly NodeSnapshot[];}
export interface DocumentEvent {readonly kind:'baseline'|'change';readonly document:DocumentSnapshot;}
export interface QueryPort {snapshot():DocumentSnapshot;}
