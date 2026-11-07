import type { SvgDocument } from '../../domain/SvgDocument.js';
export interface ImportResult { readonly document:SvgDocument; readonly warnings:readonly string[]; }
export interface DocumentReader { read(xml:string):ImportResult; }
export interface DocumentWriter { write(document:SvgDocument):string; }
