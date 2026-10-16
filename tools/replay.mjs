import { readFileSync,writeFileSync,mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
mkdirSync('doc/validation',{recursive:true});
for(const name of ['session','flowchart']){
  const input=readFileSync(`examples/${name}.txt`,'utf8');
  const result=spawnSync(process.execPath,['--import','tsx','src/main.ts'],{input,encoding:'utf8'});
  if(result.status!==0)throw new Error(result.stderr||'CLI failed');
  writeFileSync(`doc/validation/${name}-output.txt`,result.stdout);
  process.stdout.write(result.stdout);
}
