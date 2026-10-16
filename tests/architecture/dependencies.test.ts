import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync,readFileSync } from 'node:fs';
import { join,resolve,relative,basename } from 'node:path';
import ts from 'typescript';
test('class filenames and source import directions follow the architecture',()=>{
  const files:string[]=[];
  const walk=(dir:string):void=>{for(const item of readdirSync(dir,{withFileTypes:true})){
    const path=join(dir,item.name);if(item.isDirectory())walk(path);else if(path.endsWith('.ts'))files.push(path);
  }};walk('src');
  for(const file of files){
    const rel=relative('src',file).replaceAll('\\','/'),layer=rel.split('/')[0]!;
    const source=ts.createSourceFile(file,readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true);
    const classes=source.statements.filter(ts.isClassDeclaration);
    assert.ok(classes.length<=1,file);
    for(const c of classes)assert.equal(c.name?.text,basename(file,'.ts'),file);
    for(const statement of source.statements){
      if(!ts.isImportDeclaration(statement)||!ts.isStringLiteral(statement.moduleSpecifier))continue;
      const spec=statement.moduleSpecifier.text;
      const target=spec.startsWith('.')?relative(resolve('src'),resolve(file,'..',spec)).replaceAll('\\','/'):spec;
      if(layer==='domain') assert.ok(!target.startsWith('..')&&!/^(application|infrastructure|cli|node:|saxes)/.test(target),file+' -> '+target);
      if(layer==='application') assert.ok(!/^(infrastructure|cli|node:|saxes)/.test(target),file+' -> '+target);
      if(layer==='infrastructure') assert.ok(!target.startsWith('cli/'),file+' -> '+target);
      if(layer==='cli') assert.ok(!/^(infrastructure|domain\/shapes)/.test(target),file+' -> '+target);
    }
  }
});
