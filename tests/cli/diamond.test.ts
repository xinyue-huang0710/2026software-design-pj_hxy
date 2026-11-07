import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
test('optional diamond transcript is byte-identical in A/B and disabled configuration preserves history',()=>{
  const result=spawnSync(process.execPath,['tools/replay-diamond.mjs'],{encoding:'utf8'});
  assert.equal(result.status,0,result.stdout+'\n'+result.stderr);
});
