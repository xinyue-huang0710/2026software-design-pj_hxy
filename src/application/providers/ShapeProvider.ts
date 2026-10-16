import type { Shape } from '../../domain/Shape.js';
export interface SvgElementData {
  readonly tag: string;
  readonly attributes: Readonly<Record<string,string>>;
  readonly text?: string;
  readonly children?: readonly SvgElementData[];
}
export interface ShapeView {
  readonly id: string;
  readonly label: string;
  readonly inline: string;
  readonly properties: readonly (readonly [string,string])[];
  readonly styles: readonly (readonly [string,string])[];
}
export interface ShapeProvider<T extends Shape> {
  readonly typeKey: string;
  readonly accepts: (shape:Shape)=>shape is T;
  readonly create: (id:string,args:readonly string[])=>T;
  readonly fromSvg: (id:string,element:SvgElementData)=>T;
  readonly inspect: (shape:T)=>ShapeView;
  readonly toSvgElement: (shape:T)=>SvgElementData;
}
