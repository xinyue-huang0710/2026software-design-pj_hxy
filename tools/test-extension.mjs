import {runTests} from '@vscode/test-electron';
import {resolve,join} from 'node:path';
import {existsSync} from 'node:fs';
const root=resolve(import.meta.dirname,'..'), extension=join(root,'extensions/svg-tools');
const installed=process.env.VSCODE_EXECUTABLE??join(process.env.LOCALAPPDATA??'','Programs/Microsoft VS Code/Code.exe');
const kind=process.argv.includes('--baseline')?'baseline':'integration';
await runTests({
  ...(existsSync(installed)?{vscodeExecutablePath:installed}:{version:'stable'}),
  extensionDevelopmentPath:extension,extensionTestsPath:join(extension,'dist',kind+'.cjs'),
  launchArgs:[join(extension,'examples'),'--disable-extensions','--skip-welcome','--skip-release-notes','--user-data-dir',join(root,'tmp/vscode-test-profile')],
});
