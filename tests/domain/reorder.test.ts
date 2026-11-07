import { GroupShape } from '../../plugins/builtin-shapes/src/shapes/GroupShape.js';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SvgDocument } from '../../packages/core/src/domain/SvgDocument.js';
import { RectShape } from '../../plugins/builtin-shapes/src/shapes/RectShape.js';
test('group follows current draw order after front/back',()=>{
  const doc=new SvgDocument();
  for(const id of ['a','b','c']) doc.insert(new RectShape(id,0,0,1,1));
  doc.front('a');doc.back('c');
  assert.deepEqual(doc.roots().map(s=>s.id),['c','b','a']);
  doc.group(new GroupShape('g'),['a','b','c']);
  assert.deepEqual(doc.findShape('g').children().map(s=>s.id),['c','b','a']);
});
