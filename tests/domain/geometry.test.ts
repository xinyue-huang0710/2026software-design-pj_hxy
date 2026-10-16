import test from 'node:test';
import assert from 'node:assert/strict';
import { CircleShape } from '../../src/domain/shapes/CircleShape.js';
import { RectShape } from '../../src/domain/shapes/RectShape.js';
import { EllipseShape } from '../../src/domain/shapes/EllipseShape.js';
import { LineShape } from '../../src/domain/shapes/LineShape.js';
import { TextShape } from '../../src/domain/shapes/TextShape.js';
import { GroupShape } from '../../src/domain/shapes/GroupShape.js';

test('moving a circle changes its center and preserves radius', () => {
  const c=new CircleShape('c1',100,100,20); c.move(30,-5);
  assert.deepEqual([c.cx,c.cy,c.r],[130,95,20]);
});
test('leaves obey translation and origin scaling contracts', () => {
  const cases = [
    {s:new RectShape('r',1,2,3,4), e:{x:6,y:8,width:6,height:8}},
    {s:new CircleShape('c',1,2,3), e:{cx:6,cy:8,r:6}},
    {s:new EllipseShape('e',1,2,3,4), e:{cx:6,cy:8,rx:6,ry:8}},
    {s:new LineShape('l',1,2,3,4), e:{x1:6,y1:8,x2:10,y2:12}},
    {s:new TextShape('t',1,2,'中文'), e:{x:6,y:8}},
  ];
  for(const {s,e} of cases){
    s.setAttribute('stroke-width','3');s.move(2,2);s.scale(2);
    assert.deepEqual(s.geometry(),e); assert.deepEqual(s.styleEntries(),[['stroke-width','3']]);
    assert.equal(s.asContainer(),null);
  }
});
test('nested groups transform descendants once and clone deeply',()=>{
  const a=new GroupShape('a'),b=new GroupShape('b'),r=new RectShape('r',1,2,3,4);
  b.insertAt(0,r);a.insertAt(0,b);a.move(5,6);a.scale(2);
  assert.deepEqual(r.geometry(),{x:12,y:16,width:6,height:8});
  const copy=a.clone();copy.move(10,10);copy.setAttribute('fill','red');
  assert.equal(r.x,12);assert.deepEqual(a.styleEntries(),[]);assert.notEqual(copy.children()[0],b);
});
test('invalid dimensions, attributes and overflow leave a leaf unchanged',()=>{
  const r=new RectShape('r',1,2,3,4);
  for(const op of [()=>r.setAttribute('r','2'),()=>r.setAttribute('width','-1'),()=>r.scale(0),()=>r.move(1,Infinity),()=>r.scale(Number.MAX_VALUE)]){
    assert.throws(op);assert.deepEqual(r.geometry(),{x:1,y:2,width:3,height:4});
  }
});
