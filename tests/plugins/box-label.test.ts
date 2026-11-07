import {test} from 'node:test';import assert from 'node:assert/strict';
import {BoxTypeDecorator} from '../../plugins/tree-box-label/src/BoxTypeDecorator.js';
test('box type label independently reads only the public type key, not BoxShape or other decorators',()=>{
  const decorator=new BoxTypeDecorator(),document={width:800,height:600,children:[]};
  const node={id:'n',typeKey:'box',container:true,attributes:{},children:[]};
  assert.equal(decorator.decorate({root:false,node,document}),'(box)');
  assert.equal(decorator.decorate({root:false,node:{...node,typeKey:'g'},document}),undefined);
  assert.equal(decorator.decorate({root:true,document}),undefined);
});
