import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ShapeFactory } from '../../src/application/providers/ShapeFactory.js';
import { GroupProvider } from '../../src/infrastructure/providers/GroupProvider.js';
import { RectProvider } from '../../src/infrastructure/providers/RectProvider.js';
import { SvgReader } from '../../src/infrastructure/svg/SvgReader.js';
import type { Shape } from '../../src/domain/Shape.js';

test('reader passes completed children to the parent provider, with preorder ID assignment',()=>{
  const factory=new ShapeFactory(),groups=new GroupProvider(),seen:string[][]=[];
  factory.register(new RectProvider());
  factory.register({
    typeKey:'g',accepts:groups.accepts,create:groups.create.bind(groups),
    inspect:groups.inspect.bind(groups),toSvgElement:groups.toSvgElement.bind(groups),
    fromSvg:(id,element,children:readonly Shape[]=[])=>{
      seen.push(children.map(s=>s.id));
      assert.equal(children.length,element.children?.length??0,'provider needs complete imported children');
      const shape=groups.create(id,[]);
      for(const child of children)shape.insertAt(shape.children().length,child);
      return shape;
    }
  });
  const result=new SvgReader(factory).read('<svg><g><g><rect/></g><rect id="rect1"/></g></svg>');
  assert.deepEqual(seen,[['rect2'],['g2','rect1']]);
  assert.deepEqual(result.warnings,[
    'warning: assigned id g1 to unnamed <g>',
    'warning: assigned id g2 to unnamed <g>',
    'warning: assigned id rect2 to unnamed <rect>'
  ]);
  assert.equal(result.document.size,4);
  assert.equal(result.document.parentOf('rect2')!.id,'g2');
});
