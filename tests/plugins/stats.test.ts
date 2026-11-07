import {test} from 'node:test';
import assert from 'node:assert/strict';
import type {NodeSnapshot} from '@svgframe/core';
import {StatsCommand} from '../../plugins/command-stats/src/StatsCommand.js';
const node=(id:string,typeKey:string,children?:readonly NodeSnapshot[]):NodeSnapshot=>({id,typeKey,container:children!==undefined,attributes:{},children:children??[]});
test('stats standalone counts leaves in first-appearance DFS order and all container kinds excluding root',()=>{
  const document={width:1,height:1,children:[node('scene','g',[node('c','circle'),node('n','arbitrary-composite',[node('r','rect'),node('t','text')]),node('r2','rect')]),node('c2','circle')]};
  const before=JSON.stringify(document);
  assert.deepEqual(new StatsCommand({snapshot:()=>document}).execute(),{lines:['circle: 2  rect: 2  text: 1  (total 5, containers 2)']});
  assert.equal(JSON.stringify(document),before);
  assert.deepEqual(new StatsCommand({snapshot:()=>({...document,children:[]})}).execute().lines,['(total 0, containers 0)']);
});
