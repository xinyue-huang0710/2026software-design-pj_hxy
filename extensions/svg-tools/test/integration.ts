import * as vscode from 'vscode';
import assert from 'node:assert/strict';
import {writeFileSync,mkdirSync,readFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import type {SvgFileDecorator} from '../src/SvgFileDecorator';
export async function run():Promise<void>{
  const root=resolve(__dirname,'../../..'),file=join(root,'extensions/svg-tools/examples/example.svg');
  const original=readFileSync(file,'utf8'),uri=vscode.Uri.file(file);
  const ext=vscode.extensions.getExtension('pj1-hxy.svg-tools');assert.ok(ext);
  const api=await ext.activate() as {badge:SvgFileDecorator};
  const cancel=new vscode.CancellationTokenSource(),doc=await vscode.workspace.openTextDocument(uri);
  await vscode.window.showTextDocument(doc);
  const query=async()=>(await vscode.commands.executeCommand<vscode.DocumentSymbol[]>('vscode.executeDocumentSymbolProvider',uri))??[];
  const before=await query();assert.ok(before?.length);
  assert.equal(before[0]!.name,'svg');
  const scene=before[0]!.children[0]!,rect=scene.children[0]!;
  assert.equal(scene.name,'g#scene');assert.equal(rect.name,'rect#start');
  assert.equal(rect.selectionRange.start.line,2);
  assert.equal(doc.getText(rect.selectionRange),'rect');
  assert.equal(scene.children[1]!.children[0]!.name,'text');
  const replace=async(text:string)=>{
    const edit=new vscode.WorkspaceEdit();edit.replace(uri,new vscode.Range(doc.positionAt(0),doc.positionAt(doc.getText().length)),text);
    assert.equal(await vscode.workspace.applyEdit(edit),true);
  };
  try {
    await replace('<svg><g>');assert.deepEqual(await query(),[]);
    await replace('<svg><circle id="updated"/></svg>');
    assert.equal((await query())![0]!.children[0]!.name,'circle#updated');
  } finally {await replace(original);}
  assert.equal((await api.badge.provideFileDecoration(uri,cancel.token))?.badge,'[]');
  for(const name of ['notes.txt','folder.svg','missing.svg'])
    assert.equal(await api.badge.provideFileDecoration(vscode.Uri.file(join(root,'extensions/svg-tools/examples',name)),cancel.token),undefined);
  cancel.cancel();assert.equal(await api.badge.provideFileDecoration(uri,cancel.token),undefined);cancel.dispose();
  assert.equal(readFileSync(file,'utf8'),original);
  const result={vscode:vscode.version,checks:['registered native symbols','nested containers','unnamed element','source range line 3','live edit','incomplete XML clears','valid edit recovers','SVG badge','no badge on non-SVG/directory/missing','cancelled request','file unchanged'],symbols:before,passed:true,uiScreenshots:'See doc/validation/vscode-manual.md for separate user-verified UI evidence'};
  mkdirSync(join(root,'doc/validation'),{recursive:true});
  writeFileSync(join(root,'doc/validation/vscode-integration.json'),JSON.stringify(result,null,2)+'\n');
  console.log('SVG_INTEGRATION_PASS',JSON.stringify(result.checks));
}
