import * as vscode from 'vscode';
export class SvgFileDecorator implements vscode.FileDecorationProvider,vscode.Disposable {
  readonly #changes=new vscode.EventEmitter<vscode.Uri|vscode.Uri[]|undefined>();
  readonly onDidChangeFileDecorations=this.#changes.event;
  refresh(uri:vscode.Uri):void {this.#changes.fire(uri);}
  async provideFileDecoration(uri:vscode.Uri,token:vscode.CancellationToken):Promise<vscode.FileDecoration|undefined>{
    if(token.isCancellationRequested||!uri.path.toLowerCase().endsWith('.svg'))return undefined;
    try {
      const stat=await vscode.workspace.fs.stat(uri);
      if(token.isCancellationRequested||(stat.type&vscode.FileType.Directory)!==0||(stat.type&vscode.FileType.File)===0)return undefined;
      return new vscode.FileDecoration('[]','SVG document');
    } catch {return undefined;}
  }
  dispose():void {this.#changes.dispose();}
}
