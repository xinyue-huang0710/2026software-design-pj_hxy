import {build} from 'esbuild';
import {resolve} from 'node:path';
import {existsSync} from 'node:fs';
const root=resolve(import.meta.dirname,'..');
for(const [input,name] of [['src/extension.ts','extension'],['test/baseline.ts','baseline'],['test/integration.ts','integration']]){
  const entry=resolve(root,'extensions/svg-tools',input);
  if(existsSync(entry))await build({entryPoints:[entry],outfile:resolve(root,'extensions/svg-tools/dist',name+'.cjs'),bundle:true,platform:'node',format:'cjs',external:['vscode'],sourcemap:true,target:'node20'});
}
