import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdirSync,mkdtempSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {tmpdir} from 'node:os';
test('compiled default-only CLI transcripts and SVG files are byte-identical to immutable final',()=>{
  const main=resolve('packages/host/dist/main.js');
  for(const name of ['session','flowchart']){
    const cwd=mkdtempSync(join(tmpdir(),'svg-compat-'));mkdirSync(join(cwd,'examples'));
    writeFileSync(join(cwd,'examples/other.svg'),readFileSync('examples/other.svg'));
    const input=readFileSync('doc/transcript/phase1/'+name+'.txt');
    const run=spawnSync(process.execPath,[main,'--builtin-only'],{cwd,input});
    assert.equal(run.status,0,run.stderr?.toString());assert.deepEqual(run.stdout,readFileSync('doc/transcript/phase1/'+name+'.expected.txt'));
    assert.deepEqual(readFileSync(join(cwd,'examples',name==='session'?'demo.svg':'flowchart.svg')),readFileSync('doc/transcript/phase1/'+name+'.expected.svg'));
  }
});
