import test from 'node:test';
import assert from 'node:assert/strict';
import { SvgDocument } from '../../src/domain/SvgDocument.js';
import { RectShape } from '../../src/domain/shapes/RectShape.js';
import { GroupShape } from '../../src/domain/shapes/GroupShape.js';

test('insert indexes descendants and rejects duplicate IDs without mutation',()=>{
  const d=new SvgDocument(),g=new GroupShape('g');
  g.insertAt(0,new RectShape('r',1,2,3,4));d.insert(g);
  assert.equal(d.size,2);assert.equal(d.parentOf('r')?.id,'g');
  assert.throws(()=>d.insert(new RectShape('r',0,0,1,1)),/id already exists: r/);
  assert.equal(d.size,2);assert.equal(d.roots().length,1);
});
test('cross-parent group uses LCA and document order; ungroup restores nested slot',()=>{
  const d=new SvgDocument();
  for(const id of ['a','b']) d.insert(new GroupShape(id));
  d.insert(new RectShape('r1',1,1,1,1),'a');d.insert(new RectShape('r2',2,2,2,2),'b');
  d.group('pair',['r2','r1']);
  assert.deepEqual(d.roots().map(s=>s.id),['pair','a','b']);
  assert.deepEqual(d.container('pair').children().map(s=>s.id),['r1','r2']);
  assert.throws(()=>d.ungroup('pair'),/top-level/);
  d.addto('a','pair');d.ungroup('pair');
  assert.deepEqual(d.container('a').children().map(s=>s.id),['r1','r2']);
});
test('cycle and ancestor/descendant selection fail atomically',()=>{
  const d=new SvgDocument();d.insert(new GroupShape('a'));d.insert(new GroupShape('b'),'a');
  assert.throws(()=>d.group('bad',['a','b']),/cannot group a container into its own descendant: a/);
  assert.throws(()=>d.addto('b','a'),/own descendant/);
  assert.equal(d.size,2);assert.equal(d.parentOf('b')?.id,'a');
});
