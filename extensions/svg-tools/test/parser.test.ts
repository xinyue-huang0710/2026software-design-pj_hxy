import {test} from 'node:test';
import assert from 'node:assert/strict';
import {SvgOutlineParser} from '../src/SvgOutlineParser.js';
test('nested, unnamed, CRLF, Unicode and quoted > have exact source selections',()=>{
  const text='<?xml version="1.0"?>\r\n<svg xmlns="http://www.w3.org/2000/svg"><!-- 🙂 -->\r\n<g id="层"><text data-note="a>b">🙂<![CDATA[<rect/>]]></text><rect/></g></svg>';
  const roots=new SvgOutlineParser().parse(text),g=roots[0]!.children[0]!;
  assert.equal(roots[0]!.name,'svg');assert.equal(g.name,'g#层');
  assert.deepEqual(g.children.map(n=>n.name),['text','rect']);
  for(const n of [roots[0]!,g,...g.children]){
    assert.equal(text.slice(n.selectionStart,n.selectionEnd),n.name.split('#')[0]);
    assert.equal(text[n.start],'<');assert.equal(text[n.end-1],'>');
  }
  assert.equal(text.slice(g.children[1]!.start,g.children[1]!.end),'<rect/>');
});
test('incomplete XML clears and later valid edits restore without stale nodes',()=>{
  const parser=new SvgOutlineParser();
  assert.deepEqual(parser.parse('<svg><g>'),[]);
  assert.deepEqual(parser.parse('<svg><g></svg>'),[]);
  assert.equal(parser.parse('<svg><circle id="new"/></svg>')[0]!.children[0]!.name,'circle#new');
});
