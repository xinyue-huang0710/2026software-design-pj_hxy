import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EditorRuntime } from '../../src/EditorRuntime.js';
import { CommandDispatcher } from '../../src/cli/CommandDispatcher.js';
import { CliApplication } from '../../src/cli/CliApplication.js';
import { OutlineLibrary } from '../support/OutlineLibrary.js';
import { OutlineTreeAdapter } from '../support/OutlineTreeAdapter.js';

test('CLI uses an injected adapter to print full and selected trees without changing state',async()=>{
  const r=new EditorRuntime();
  const cli=new CliApplication(new CommandDispatcher(r.session,r.history),r.invoker,
    new OutlineTreeAdapter(new OutlineLibrary()));
  for(const line of ['init 40 30','create g group','create rect r 1 2 3 4 in group','create g empty in group'])
    await cli.executeLine(line);
  const document=r.writer.write(r.session.snapshot()),history=r.history.state;
  const full=(await cli.executeLine('tree')).join('\n');
  assert.equal(full,'- svg (40x30)\n  - g#group \n    - rect#r x=1 y=2 width=3 height=4\n    - g#empty ');
  assert.equal((await cli.executeLine('tree r')).join('\n'),'- rect#r x=1 y=2 width=3 height=4');
  assert.deepEqual(await cli.executeLine('tree missing'),['error: no such shape: missing']);
  assert.equal((await cli.executeLine('tree')).join('\n'),full);
  assert.deepEqual(await cli.executeLine('show group'),['g#group  parent=svg']);
  assert.equal(r.writer.write(r.session.snapshot()),document);
  assert.deepEqual(r.history.state,history);
});
