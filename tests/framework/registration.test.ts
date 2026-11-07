import {test} from 'node:test';
import {MarkerProvider} from '../support/MarkerProvider.js';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {EditorRuntime} from '../../packages/host/src/EditorRuntime.js';
import {CliApplication} from '../../packages/host/src/cli/CliApplication.js';
import {CommandDispatcher} from '../../packages/host/src/cli/CommandDispatcher.js';
import {TreeFormatter} from '../../packages/host/src/cli/TreeFormatter.js';
import type {Plugin,PluginContext,PluginManifest,CommandRegistration,CommandContext,Token} from '@svgframe/core';
function app(r:EditorRuntime){return new CliApplication(new CommandDispatcher(r.registry.commands,r.context),r.invoker,new TreeFormatter());}
class Ping implements CommandRegistration {
  readonly name='ping';readonly help=['ping'];
  create(_tokens:readonly Token[],_ctx:CommandContext){return {execute:()=>({lines:['pong']})};}
}
class Good implements Plugin {activate(c:PluginContext){c.registerCommand(new Ping());}}
const manifest:PluginManifest={name:'good',contributes:{commands:['ping']}};
test('code registration validates manifests and rolls back all categories without losing prior plugins',async()=>{
  const r=new EditorRuntime(),cli=app(r);
  assert.deepEqual(r.installer.install(Good,manifest),[]);
  const before=r.history.state;
  class Partial implements Plugin {activate(c:PluginContext){
    c.registerShape(new MarkerProvider());
    c.registerDecorator({name:'unpublished',decorate:()=>'*'});
    c.registerAttribute({name:'unpublished',handles:()=>false,apply:()=>{}});
    c.registerCommand(new Ping());
  }}
  assert.deepEqual(r.installer.install(Partial,{name:'partial'}),['error: duplicate registration: commands/ping']);
  assert.equal(r.registry.shapes.has('marker'),false);
  assert.equal(r.registry.decorators.has('unpublished'),false);assert.equal(r.registry.attributes.has('unpublished'),false);
  assert.deepEqual(await cli.executeLine('ping'),['pong']);assert.deepEqual(r.history.state,before);
  class Throws implements Plugin{activate(c:PluginContext){c.registerDecorator({name:'x',decorate:()=>'*'});throw Error('boom');}}
  assert.deepEqual(r.installer.install(Throws,{name:'throws',contributes:{decorators:['x']}}),['error: plugin failed to activate: throws (boom)']);
  assert.equal(r.registry.decorators.has('x'),false);
  class Mismatch implements Plugin {activate(c:PluginContext){c.registerDecorator({name:'x',decorate:()=>'*'});}}
  assert.match(r.installer.install(Mismatch,{name:'mismatch'})[0]!,/^error: plugin manifest mismatch: mismatch /);
  assert.equal(r.registry.decorators.has('x'),false);
});
test('config four failures, internal missing dependency, duplicate rollback, disabled and subsequent success',async()=>{
  mkdirSync('tmp',{recursive:true});const base=mkdtempSync(resolve('tmp','loader-'));
  const pkg=(name:string,code:string,contributes:unknown={})=>{
    const dir=join(base,name);mkdirSync(dir);writeFileSync(join(dir,'package.json'),JSON.stringify({name,type:'module',main:'index.mjs',contributes}));
    writeFileSync(join(dir,'index.mjs'),code);
  };
  pkg('no-default','export const other=1;');
  pkg('mismatch','export default class {activate(c){c.registerDecorator({name:"ghost",decorate(){return "*"}})}}');
  pkg('throws','export default class {activate(c){c.registerDecorator({name:"ghost",decorate(){return "*"}});throw Error("boom")}}',{decorators:['ghost']});
  pkg('broken-dependency','import "./missing-dependency.mjs";export default class {activate(){}}');
  pkg('good','export default class {activate(c,o){c.registerCommand({name:"ping",help:["ping"],create(){return {execute(){return {lines:[o.word]}}}}})}}',{commands:['ping']});
  pkg('duplicate','export default class {activate(c){c.registerDecorator({name:"ghost",decorate(){return "*"}});c.registerCommand({name:"ping",help:[],create(){}})}}',{decorators:['ghost'],commands:['ping']});
  pkg('last','export default class {activate(c){c.registerDecorator({name:"last",decorate(){return "end"}})}}',{decorators:['last']});
  const config=join(base,'plugins.config.json');writeFileSync(config,JSON.stringify({plugins:[
    {module:'./disabled-missing',enabled:false},{module:'./missing'},{module:'./no-default'},{module:'./mismatch'},
    {module:'./throws'},{module:'./broken-dependency'},{module:'./good',options:{word:'configured'}},{module:'./duplicate'},{module:'./last'}
  ]}));
  const r=new EditorRuntime(),errors=await r.loader.loadConfig(config);
  assert.equal(errors.length,6);
  assert.equal(errors[0],'error: plugin not found: ./missing');
  assert.equal(errors[1],'error: plugin has no default export: ./no-default');
  assert.match(errors[2]!,/^error: plugin manifest mismatch: mismatch /);
  assert.equal(errors[3],'error: plugin failed to activate: throws (boom)');
  assert.match(errors[4]!,/^error: plugin failed to activate: broken-dependency /);
  assert.equal(errors[5],'error: duplicate registration: commands/ping');
  assert.equal(r.registry.decorators.has('ghost'),false);assert.equal(r.registry.decorators.has('last'),true);
  assert.deepEqual(await app(r).executeLine('ping'),['configured']);
});
test('bad configuration is rejected completely before any optional activation; builtins remain',async()=>{
  const r=new EditorRuntime();mkdirSync('tmp',{recursive:true});const base=mkdtempSync(resolve('tmp','bad-config-')),file=join(base,'bad.json');
  for(const body of ['{',JSON.stringify({plugins:[{module:'@svgframe/builtin-shapes'},{module:9}]}),JSON.stringify({plugins:[],typo:true})]){
    writeFileSync(file,body);assert.deepEqual(await r.loader.loadConfig(file),['error: invalid plugin config']);
    assert.deepEqual([...r.registry.decorators.keys()],[]);
  }
  const cli=app(r);assert.deepEqual(await cli.executeLine('init'),['canvas 800x600 created']);
  assert.deepEqual(await cli.executeLine('create rect r 1 2 3 4'),['rect#r created']);
});
