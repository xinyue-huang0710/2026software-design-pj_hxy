import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ContainerShape,EditorError} from '@svgframe/core';
import type {Plugin,PluginContext,ShapeProvider,Shape,AttributeHandler,AttributeTarget,AttributeEditContext} from '@svgframe/core';
import {EditorRuntime} from '../../packages/host/src/EditorRuntime.js';
import {CliApplication} from '../../packages/host/src/cli/CliApplication.js';
import {CommandDispatcher} from '../../packages/host/src/cli/CommandDispatcher.js';
import {TreeFormatter} from '../../packages/host/src/cli/TreeFormatter.js';
class Guarded extends ContainerShape {
  constructor(id:string){super(id,'guarded');}
  override clone():Guarded{const s=new Guarded(this.id);for(const c of this.children())s.insertAt(s.children().length,c.clone());return s;}
  override validateStructure(){if(!this.children().some(c=>c.id===this.id+'-part'))throw new EditorError('required part missing');}
}
class GuardedProvider implements ShapeProvider<Guarded>{
  readonly typeKey='guarded';readonly accepts=(s:Shape):s is Guarded=>s instanceof Guarded;
  constructor(private readonly context:PluginContext){}
  create(id:string){const g=new Guarded(id);g.insertAt(0,this.context.shapes.create('rect',id+'-part',['0','0','10','10']));return g;}
  fromSvg(id:string,_e:unknown,children:readonly Shape[]){const g=new Guarded(id);children.forEach(c=>g.insertAt(g.children().length,c));g.validateStructure();return g;}
  inspect(s:Guarded){return {id:s.id,label:'g#'+s.id,inline:'',properties:[],styles:s.styleEntries()};}
  toSvgElement(s:Guarded){return {tag:'g',attributes:{id:s.id,'data-kind':'guarded'}};}
}
class Handler implements AttributeHandler {
  constructor(readonly name:string,private readonly fail=false){}
  handles(t:AttributeTarget,a:string){assert.ok(Object.isFrozen(t));return t.typeKey==='guarded'&&a==='pair';}
  apply(c:AttributeEditContext,id:string,_a:string,v:string){c.shape(id).setAttribute('stroke',v);c.shape(id+'-part').setAttribute('fill',v);if(this.fail)throw Error('partial failure');}
}
test('attribute extension is one undo unit; fallback, conflict, partial throw and composite invariants are atomic',async()=>{
  const r=new EditorRuntime(),cli=new CliApplication(new CommandDispatcher(r.registry.commands,r.context),r.invoker,new TreeFormatter());
  class CompositePlugin implements Plugin{activate(c:PluginContext){c.registerShape(new GuardedProvider(c));c.registerAttribute(new Handler('pair'));}}
  assert.deepEqual(r.installer.install(CompositePlugin,{name:'guard',contributes:{shapes:['guarded'],attributes:['pair']}}),[]);
  await cli.executeLine('init');await cli.executeLine('create guarded g');
  const snapshot=()=>JSON.stringify(r.session.contentSnapshot()),before=snapshot();
  await cli.executeLine('set g pair red');const after=snapshot();assert.notEqual(before,after);
  await cli.executeLine('undo');assert.equal(snapshot(),before);await cli.executeLine('redo');assert.equal(snapshot(),after);
  await cli.executeLine('undo');const hs=r.history.state;
  r.registry.attributes.set('pair',new Handler('pair',true));
  assert.deepEqual(await cli.executeLine('set g pair blue'),['error: partial failure']);
  assert.equal(snapshot(),before);assert.deepEqual(r.history.state,hs);
  r.registry.attributes.set('second',new Handler('second'));
  assert.deepEqual(await cli.executeLine('set g pair blue'),['error: attribute handler conflict: g/pair']);
  assert.equal(snapshot(),before);assert.deepEqual(r.history.state,hs);
  assert.deepEqual(await cli.executeLine('delete g-part'),['error: required part missing']);
  assert.equal(snapshot(),before);assert.deepEqual(r.history.state,hs);
  assert.deepEqual(await cli.executeLine('set g-part label unsupported'),['error: unknown attribute: label']);
  assert.ok(!(await cli.executeLine('set g-part fill blue'))[0]!.startsWith('error:'));
});
test('decorators compose on root and selected subtree; failed notification cannot undo a committed edit',async()=>{
  const r=new EditorRuntime(),cli=new CliApplication(new CommandDispatcher(r.registry.commands,r.context),r.invoker,new TreeFormatter());
  class Tags implements Plugin{activate(c:PluginContext){c.registerDecorator({name:'first',decorate:()=>'(a)'});c.registerDecorator({name:'second',decorate:()=>'*'});}}
  r.installer.install(Tags,{name:'tags',contributes:{decorators:['first','second']}});
  await cli.executeLine('init');await cli.executeLine('create g g');
  assert.deepEqual(await cli.executeLine('tree'),['svg (800x600) (a) *','└── g#g (a) *']);
  assert.deepEqual(await cli.executeLine('tree g'),['g#g (a) *']);
  r.registry.decorators.set('broken',{name:'broken',decorate:()=>'',onDocumentEvent(){throw Error('observer broke');}});
  const output=await cli.executeLine('create g next');
  assert.equal(output[0],'g#next created');assert.match(output[1]!,/^warning: disabled tree decorator: broken/);
  assert.equal(r.session.snapshot().size,2);assert.equal(r.registry.decorators.has('broken'),false);
});
