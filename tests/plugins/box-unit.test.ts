import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Shape} from '@svgframe/core';
import type {ShapeCreation,ShapeView} from '@svgframe/core';
import {BoxProvider} from '../../plugins/shape-box/src/BoxProvider.js';
import {BoxFillHandler} from '../../plugins/shape-box/src/BoxFillHandler.js';
import {BoxLabelHandler} from '../../plugins/shape-box/src/BoxLabelHandler.js';
class Part extends Shape {
  #text:string;
  constructor(id:string,type:string,text=''){super(id,type);this.#text=text;}
  text(){return this.#text;}
  override setAttribute(k:string,v:string){if(k==='text')this.#text=v;else super.setAttribute(k,v);}
  move(){} scale(){}
  clone():Part {const p=new Part(this.id,this.typeKey,this.#text);for(const[k,v]of this.styleEntries())p.setAttribute(k,v);return p;}
}
test('box package independently creates template, serializes, validates and delegates attributes using only a factory substitute',()=>{
  const calls:unknown[]=[];
  const factory:ShapeCreation={
    create(type,id,args){calls.push([type,id,args]);const p=new Part(id,type,type==='text'?args[2]:'');if(type==='rect')p.setAttribute('fill',args[4]!);return p;},
    inspect(shape):ShapeView{return {id:shape.id,label:shape.typeKey+'#'+shape.id,inline:'',properties:shape instanceof Part&&shape.typeKey==='text'?[['text',shape.text()]]:[],styles:shape.styleEntries()};}
  };
  const provider=new BoxProvider(factory),box=provider.create('n',['120','100','160','60','开始']);
  assert.deepEqual(calls,[['rect','n-rect',['120','100','160','60','#4a90d9']],['text','n-label',['140','135','开始']]]);
  assert.equal(box.canUngroup(),false);assert.equal(provider.toSvgElement(box).attributes['data-kind'],'box');
  const context={shape:(id:string)=>id==='n'?box:box.children().find(s=>s.id===id)!,inspect:(id:string)=>factory.inspect(box.children().find(s=>s.id===id)!)};
  new BoxFillHandler().apply(context,'n','fill','red');
  assert.equal(box.body().styleEntries().find(([k])=>k==='fill')?.[1],'red');
  const result=new BoxLabelHandler().apply(context,'n','label','new');
  assert.deepEqual(result.undo,['box#n label restored: "开始"']);
  assert.equal((box.label() as Part).text(),'new');
  box.detach(box.label());assert.throws(()=>box.validateStructure(),/invalid box structure/);
  assert.throws(()=>provider.fromSvg('n',{tag:'g',attributes:{'data-kind':'box'}},[]),/invalid box structure/);
});
