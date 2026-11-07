import * as vscode from 'vscode';
import {SvgOutlineParser} from './SvgOutlineParser';
import type {OutlineElement} from './SvgOutlineParser';
export class SvgSymbolProvider implements vscode.DocumentSymbolProvider {
  readonly #parser=new SvgOutlineParser();
  provideDocumentSymbols(document:vscode.TextDocument,token:vscode.CancellationToken):vscode.DocumentSymbol[]{
    if(token.isCancellationRequested)return [];
    const convert=(node:OutlineElement):vscode.DocumentSymbol=>{
      const symbol=new vscode.DocumentSymbol(node.name,'',node.children.length?vscode.SymbolKind.Namespace:vscode.SymbolKind.Object,
        new vscode.Range(document.positionAt(node.start),document.positionAt(node.end)),
        new vscode.Range(document.positionAt(node.selectionStart),document.positionAt(node.selectionEnd)));
      symbol.children=node.children.map(convert);return symbol;
    };
    const result=this.#parser.parse(document.getText()).map(convert);
    return token.isCancellationRequested?[]:result;
  }
}
