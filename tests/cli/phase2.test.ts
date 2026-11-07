import {test} from 'node:test';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';
test('full basic, flowchart, box and command transcripts match in both compiled assemblies',()=>{
 const r=spawnSync(process.execPath,['tools/replay-phase2.mjs'],{encoding:'utf8'});assert.equal(r.status,0,r.stdout+'\n'+r.stderr);
});
