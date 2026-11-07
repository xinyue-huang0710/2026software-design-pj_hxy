import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DiamondShape} from '../../plugins/shape-diamond/src/DiamondShape.js';
import {DiamondProvider} from '../../plugins/shape-diamond/src/DiamondProvider.js';

test('diamond geometry has atomic finite bounds, independent clones and origin scaling',()=>{
  const d=new DiamondShape('d',100,80,60,40);
  assert.deepEqual(d.vertices(),[[100,60],[130,80],[100,100],[70,80]]);
  d.move(10,-20);assert.deepEqual(d.geometry(),{cx:110,cy:60,width:60,height:40});
  d.scale(2);assert.deepEqual(d.geometry(),{cx:220,cy:120,width:120,height:80});
  d.setAttribute('width','20');d.setAttribute('fill','red');
  const copy=d.clone();copy.move(1,2);copy.setAttribute('fill','blue');
  assert.equal(d.geometry().cx,220);assert.deepEqual(d.styleEntries(),[['fill','red']]);
  const original=d.geometry();
  for(const edit of [()=>d.setAttribute('width','-1'),()=>d.setAttribute('height','NaN'),()=>d.scale(0),()=>d.move(Infinity,0),()=>d.setAttribute('label','x')]){
    assert.throws(edit);assert.deepEqual(d.geometry(),original);
  }
  const large=new DiamondShape('large',1e308,0,1e308,10),before=large.geometry();
  assert.throws(()=>large.move(7e307,0),/invalid/);assert.deepEqual(large.geometry(),before);
  assert.throws(()=>large.scale(2),/invalid/);assert.deepEqual(large.geometry(),before);
  assert.throws(()=>new DiamondShape('overflow',1.7e308,0,1e308,10),/invalid/);
  assert.deepEqual(new DiamondShape('zero',0,0,0,0).vertices(),[[0,0],[0,0],[0,0],[0,0]]);
  assert.ok(Object.isFrozen(d.geometry()));assert.ok(Object.isFrozen(d.vertices()[0]));
});

test('diamond provider independently roundtrips exact geometry and rejects lossy or malformed polygons',()=>{
  const p=new DiamondProvider();
  const d=p.create('d',['0.1','0.2','0.3','0.4','#f5a623']);
  d.setAttribute('stroke','black');d.setAttribute('stroke-width','2');
  const svg=p.toSvgElement(d);
  assert.equal(svg.tag,'polygon');assert.equal(svg.attributes['data-kind'],'diamond');
  assert.equal(svg.attributes.points,'0.1,0 0.25,0.2 0.1,0.4 -0.04999999999999999,0.2');
  const restored=p.fromSvg('d',svg,[]);
  assert.deepEqual(restored.geometry(),d.geometry());assert.deepEqual(restored.styleEntries(),d.styleEntries());
  assert.equal(p.inspect(d).label,'diamond#d');assert.equal(p.accepts(restored),true);
  const spaced={...svg,attributes:{...svg.attributes,points:svg.attributes.points!.replaceAll(',',' ')}};
  assert.deepEqual(p.fromSvg('d',spaced,[]).geometry(),d.geometry());
  for(const bad of [
    {...svg,tag:'rect'},
    {...svg,attributes:{...svg.attributes,'data-kind':'other'}},
    {...svg,attributes:{...svg.attributes,points:'0,0 1,0 1,1 0,1'}},
    {...svg,attributes:{...svg.attributes,points:'0,0 1,0 1,1'}},
    {...svg,attributes:{...svg.attributes,'data-width':'-1'}},
    {...svg,attributes:{...svg.attributes,'data-width':'NaN'}},
    {...svg,attributes:{...svg.attributes,transform:'translate(1 2)'}},
    {...svg,text:'unexpected'},
    {...svg,children:[{tag:'rect',attributes:{}}]}
  ])assert.throws(()=>p.fromSvg('d',bad,[]));
  const {['data-cx']:omitted,...missing}=svg.attributes;void omitted;
  assert.throws(()=>p.fromSvg('d',{...svg,attributes:missing},[]),/missing diamond attribute/);
  assert.throws(()=>p.fromSvg('d',svg,[d]),/children/);
  for(const args of [[],['1','2','3'],['0','0','-1','10'],['0','0','NaN','10'],['0','0','10','10','red','extra']])assert.throws(()=>p.create('bad',args));
});
