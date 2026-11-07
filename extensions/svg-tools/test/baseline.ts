import * as vscode from 'vscode';
import {writeFileSync,mkdirSync} from 'node:fs';
import {resolve,join} from 'node:path';
export async function run():Promise<void>{
  const root=resolve(__dirname,'../../..');
  const uri=vscode.Uri.file(join(root,'extensions/svg-tools/examples/example.svg'));
  const doc=await vscode.workspace.openTextDocument(uri);
  await vscode.window.showTextDocument(doc);
  const symbols=await vscode.commands.executeCommand<unknown[]>('vscode.executeDocumentSymbolProvider',uri);
  const folder=join(root,'doc/validation');mkdirSync(folder,{recursive:true});
  const result={vscode:vscode.version,language:doc.languageId,document:uri.fsPath,providerCount:vscode.extensions.all.length,symbols:symbols??[],observation:'Real Extension Host before SVG feature implementation. Third-party extensions disabled. UI screenshot unavailable because computer-use sandbox fails.'};
  writeFileSync(join(folder,'vscode-baseline.json'),JSON.stringify(result,null,2)+'\n');
  console.log('SVG_BASELINE',JSON.stringify(result));
}
