import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp,readFile,readdir,mkdir,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { EditorRuntime } from '../../src/EditorRuntime.js';
import { FileDocumentStore } from '../../src/infrastructure/storage/FileDocumentStore.js';
import { ReadCommand } from '../../src/application/commands/ReadCommand.js';
import { SaveCommand } from '../../src/application/commands/SaveCommand.js';
import { CreateCommand } from '../../src/application/commands/CreateCommand.js';
import { InitCommand } from '../../src/application/commands/InitCommand.js';
test('six-type nested round trip preserves text, style absence and order',()=>{
  const r=new EditorRuntime();
  const xml='<svg width="400" height="300"><g id="g" fill="red"><rect id="r" x="1" y="2" width="3" height="4"/><circle id="c" cx="1" cy="2" r="3"/><ellipse id="e" cx="1" cy="2" rx="3" ry="4"/><line id="l" x1="1" y1="2" x2="3" y2="4" stroke="black"/><text id="t" x="1" y="2"> &amp; &lt;中文&gt; &quot; &#13;&#10; </text><g id="empty"/></g></svg>';
  const first=r.reader.read(xml).document,output=r.writer.write(first),second=r.reader.read(output).document;
  assert.equal(r.writer.write(second),output);
  assert.deepEqual(first.findShape('r').styleEntries(),[]);
  assert.equal(first.findShape('g').children().length,6);
  assert.match(output,/&amp; &lt;中文&gt;/);
  assert.equal(r.factory.inspect(first.findShape('t')).properties.at(-1)![1],' & <中文> " \r\n ');
});
test('automatic IDs reserve later explicit IDs, import rejects lossy or malformed SVG',()=>{
  const r=new EditorRuntime();
  const result=r.reader.read('<svg><rect/><g><circle/></g><rect id="rect1"/></svg>');
  assert.deepEqual(result.document.roots().map(s=>s.id),['rect2','g1','rect1']);
  assert.equal(result.warnings[0],'warning: assigned id rect2 to unnamed <rect>');
  for(const xml of [
    '<svg><rect id="a"/><g id="a"/></svg>','<svg><g transform="translate(1)"/></svg>',
    '<svg><text font-size="16">a</text></svg>','<svg><path/></svg>',
    '<svg><g></svg>','<!DOCTYPE svg [<!ENTITY e SYSTEM "file:///secret">]><svg/>',
    '<svg viewBox="10 0 800 600"/>','<svg><rect width="-1"/></svg>',
    '<svg xmlns="urn:other"/>','<svg><circle><g/></circle></svg>'
  ]) assert.throws(()=>r.reader.read(xml),xml);
  const downgraded=r.reader.read('<svg><g id="n" data-kind="box"><rect id="part"/></g></svg>').document;
  assert.equal(downgraded.findShape('n').typeKey,'g');
  assert.doesNotMatch(r.writer.write(downgraded),/data-kind/);
});
test('real file writes replace atomically; failed replacement cleans temporary file',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'svg-editor-')),store=new FileDocumentStore();
  try {
    const path=join(dir,'with space 中文.svg');
    await store.write(path,'old');await store.write(path,'new');assert.equal(await store.read(path),'new');
    const blocked=join(dir,'directory.svg');await mkdir(blocked);
    await assert.rejects(store.write(blocked,'bad'),/cannot write file/);
    assert.deepEqual((await readdir(dir)).sort(),['directory.svg','with space 中文.svg']);
    await assert.rejects(store.read(join(dir,'missing')),/cannot read file/);
    assert.equal(await readFile(path,'utf8'),'new');
  } finally {await rm(dir,{recursive:true,force:true});}
});
test('read/save barriers, read path lifetime, failure atomicity and delayed warnings',async()=>{
  const files=new Map([['a.svg','<svg><rect/></svg>'],['bad.svg','<svg><rect/><path/></svg>']]);
  const r=new EditorRuntime({read:async p=>{if(!files.has(p))throw new Error('missing');return files.get(p)!;},write:async(p,s)=>{files.set(p,s);}});
  await r.invoker.executeCommand(new ReadCommand(r.session,'a.svg'));
  assert.equal(r.session.readPath,'a.svg');
  await r.invoker.executeCommand(new CreateCommand(r.session,'g','group',[]));
  const before=r.writer.write(r.session.snapshot()),state=r.history.state;
  await assert.rejects(r.invoker.executeCommand(new ReadCommand(r.session,'bad.svg')),/unknown shape type/);
  assert.equal(r.writer.write(r.session.snapshot()),before);assert.deepEqual(r.history.state,state);assert.equal(r.session.readPath,'a.svg');
  await r.invoker.executeCommand(new SaveCommand(r.session,'b.svg'));
  assert.equal(r.session.readPath,'a.svg');assert.equal(r.history.state.blocked,true);
  await r.invoker.executeCommand(new SaveCommand(r.session));assert.equal(files.get('a.svg'),files.get('b.svg'));
  await r.invoker.executeCommand(new InitCommand(r.session));
  assert.equal(r.session.readPath,undefined);
  await assert.rejects(r.invoker.executeCommand(new SaveCommand(r.session)),/no read path/);
});
