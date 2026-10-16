import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EditorRuntime } from '../../src/EditorRuntime.js';
import { ShapeFactory } from '../../src/application/providers/ShapeFactory.js';
import type { ShapeProvider } from '../../src/application/providers/ShapeProvider.js';
import { RectProvider } from '../../src/infrastructure/providers/RectProvider.js';
import { CircleProvider } from '../../src/infrastructure/providers/CircleProvider.js';
import { CircleShape } from '../../src/domain/shapes/CircleShape.js';
import { MarkerProvider } from '../support/MarkerProvider.js';
import { ForgedCircleShape } from '../support/ForgedCircleShape.js';
import { CommandDispatcher } from '../../src/cli/CommandDispatcher.js';
import { CliApplication } from '../../src/cli/CliApplication.js';
// @ts-expect-error RectProvider cannot be paired with CircleShape.
const wrong:ShapeProvider<CircleShape>=new RectProvider();
void wrong;
test('factory rejects duplicate registration, forged keys and incorrect constructor results',()=>{
  const f=new ShapeFactory();f.register(new CircleProvider());
  assert.throws(()=>f.register(new CircleProvider()),/already registered/);
  const forged=new ForgedCircleShape('x',1,2,3,4);
  assert.throws(()=>f.inspect(forged),/provider\/type mismatch/);
  assert.throws(()=>f.toSvgElement(forged),/provider\/type mismatch/);
  const invalid=new ShapeFactory(),base=new CircleProvider();
  invalid.register({...base,create:()=>forged as unknown as CircleShape,
    fromSvg:()=>forged as unknown as CircleShape,inspect:base.inspect.bind(base),toSvgElement:base.toSvgElement.bind(base)});
  assert.throws(()=>invalid.create('circle','x',[]),/provider\/type mismatch/);
  assert.throws(()=>invalid.fromSvg('x',{tag:'circle',attributes:{}}),/provider\/type mismatch/);
});
test('seventh test-only type works across unchanged commands queries SVG and snapshots',async()=>{
  const r=new EditorRuntime();r.factory.register(new MarkerProvider());
  const cli=new CliApplication(new CommandDispatcher(r.session,r.history),r.invoker);
  for(const line of ['init','create marker m 1 2 3 blue','move m 4 5','scale m 2'])
    assert.doesNotMatch((await cli.executeLine(line)).join('\n'),/error:/);
  assert.match((await cli.executeLine('tree')).join('\n'),/marker#m  x=10 y=14 size=6 fill=blue/);
  assert.match((await cli.executeLine('show m')).join('\n'),/x=10 y=14 size=6/);
  const xml=r.writer.write(r.session.snapshot());assert.match(xml,/<circle id="m" cx="10" cy="14" r="6" data-kind="marker" fill="blue"/);
  assert.equal(r.reader.read(xml).document.findShape('m').typeKey,'marker');
  await cli.executeLine('undo');assert.match((await cli.executeLine('tree')).join('\n'),/x=5 y=7 size=3/);
  await cli.executeLine('redo');assert.equal(r.writer.write(r.session.snapshot()),xml);
  assert.throws(()=>new EditorRuntime().factory.create('marker','m',[]),/unknown shape type/);
});
test('provider output maps all six types without adding implicit styles',()=>{
  const r=new EditorRuntime();
  const cases=[
    ['rect',['1','2','3','4'],'x=1 y=2 w=3 h=4',{x:'1',y:'2',width:'3',height:'4'}],
    ['circle',['1','2','3'],'cx=1 cy=2 r=3',{cx:'1',cy:'2',r:'3'}],
    ['ellipse',['1','2','3','4'],'cx=1 cy=2 rx=3 ry=4',{cx:'1',cy:'2',rx:'3',ry:'4'}],
    ['line',['1','2','3','4'],'(1,2) -> (3,4)',{x1:'1',y1:'2',x2:'3',y2:'4'}],
    ['text',['1','2','hello'],'(1,2) "hello"',{x:'1',y:'2'}],
    ['g',[],'',{}]
  ] as const;
  for(const [key,args,inline,attrs] of cases){
    const shape=r.factory.create(key,'id',args),element=r.factory.toSvgElement(shape);
    assert.equal(r.factory.inspect(shape).inline,inline);assert.deepEqual(element.attributes,{id:'id',...attrs});
    assert.deepEqual(r.factory.inspect(shape.clone()),r.factory.inspect(shape));
    assert.deepEqual(shape.styleEntries(),[]);
  }
});
