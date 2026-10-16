import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SvgDocument } from '../../src/domain/SvgDocument.js';
import { RectShape } from '../../src/domain/shapes/RectShape.js';
test('group follows current draw order after front/back',()=>{
  const doc=new SvgDocument();
  for(const id of ['a','b','c']) doc.insert(new RectShape(id,0,0,1,1));
  doc.front('a');doc.back('c');
  assert.deepEqual(doc.roots().map(s=>s.id),['c','b','a']);
  doc.group('g',['a','b','c']);
  assert.deepEqual(doc.findShape('g').children().map(s=>s.id),['c','b','a']);
});
