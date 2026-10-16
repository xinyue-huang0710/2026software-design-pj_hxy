import { TreeFormatter } from '../../src/cli/TreeFormatter.js';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { EditorRuntime } from '../../src/EditorRuntime.js';
import { CommandDispatcher } from '../../src/cli/CommandDispatcher.js';
import { CliApplication } from '../../src/cli/CliApplication.js';
test('assignment §6 and §6.1 A replay produces expected errors, geometry and SVG',async()=>{
  for(const name of ['session','flowchart']){
    const saved=new Map<string,string>(),r=new EditorRuntime({
      read:async()=>readFileSync('examples/other.svg','utf8'),
      write:async(path,content)=>{saved.set(path,content);}
    });
    const cli=new CliApplication(new CommandDispatcher(r.session,r.history),r.invoker,new TreeFormatter()),output:string[]=[];
    for(const line of readFileSync(`examples/${name}.txt`,'utf8').split(/\r?\n/))output.push(...await cli.executeLine(line));
    const errors=output.filter(s=>s.startsWith('error:'));
    if(name==='session'){
      assert.deepEqual(errors,['error: cannot group a container into its own descendant: markers','error: undo not allowed after io command']);
      assert.ok(output.includes('warning: assigned id rect1 to unnamed <rect>'));
      const doc=r.reader.read(saved.get('examples/demo.svg')!).document;
      assert.equal(doc.size,5);
      assert.equal(r.factory.inspect(doc.findShape('c1')).properties[0]![1],'130');
      assert.equal(r.factory.inspect(doc.findShape('title')).properties.at(-1)![1],'My Diagram');
      assert.equal(doc.parentOf('box')!.id,'markers');
      assert.equal(r.session.snapshot().size,7);
    }else{
      assert.deepEqual(errors,[]);
      const doc=r.reader.read(saved.get('examples/flowchart.svg')!).document;
      assert.equal(doc.size,8);
      assert.equal(r.factory.inspect(doc.findShape('process')).properties[1]![1],'100');
      assert.equal(r.factory.inspect(doc.findShape('process-label')).properties.at(-1)![1],'处理数据 v2');
      assert.deepEqual(doc.findShape('flowchart').children().map(s=>s.id),['node1','node2','arrow1']);
    }
  }
});
test('all document-dependent commands reject before init and preserve empty history',async()=>{
  const r=new EditorRuntime(),cli=new CliApplication(new CommandDispatcher(r.session,r.history),r.invoker,new TreeFormatter());
  for(const line of ['save a.svg','canvas','create g g','delete g','move g 1 2','scale g 2','set g fill red',
    'group new g','ungroup g','addto g a','front g','back g','tree','show g','undo','redo']){
    assert.deepEqual(await cli.executeLine(line),["error: no document. use 'init' or 'read' first"],line);
    assert.deepEqual(r.history.state,{undo:0,redo:0,blocked:true});
  }
});
