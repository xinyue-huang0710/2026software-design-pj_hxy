import * as vscode from 'vscode';
import {SvgFileDecorator} from './SvgFileDecorator';
import {SvgSymbolProvider} from './SvgSymbolProvider';
export function activate(context:vscode.ExtensionContext):{readonly badge:SvgFileDecorator}{
  const badge=new SvgFileDecorator(),symbols=new SvgSymbolProvider();
  const watcher=vscode.workspace.createFileSystemWatcher('**/*.{svg,SVG}');
  context.subscriptions.push(badge,watcher,
    vscode.window.registerFileDecorationProvider(badge),
    vscode.languages.registerDocumentSymbolProvider([{pattern:'**/*.svg'},{pattern:'**/*.SVG'}],symbols,{label:'PJ1 SVG'}),
    watcher.onDidCreate(uri=>badge.refresh(uri)),watcher.onDidChange(uri=>badge.refresh(uri)),watcher.onDidDelete(uri=>badge.refresh(uri)));
  return {badge};
}
