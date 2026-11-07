import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readdirSync,readFileSync} from 'node:fs';
import {join,resolve,relative,basename} from 'node:path';
import ts from 'typescript';
test('class filenames and package dependencies enforce public plugin boundaries',()=>{
  const files:string[]=[];const walk=(dir:string):void=>{for(const e of readdirSync(dir,{withFileTypes:true})){
    const path=join(dir,e.name);if(e.isDirectory()&&!['dist','node_modules'].includes(e.name))walk(path);else if(e.isFile()&&path.endsWith('.ts'))files.push(path);
  }};walk('packages');walk('plugins');
  for(const file of files){
    const normalized=file.replaceAll('\\','/'),source=ts.createSourceFile(file,readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true);
    const classes=source.statements.filter(ts.isClassDeclaration);assert.ok(classes.length<=1,file);
    for(const c of classes)assert.equal(c.name?.text,basename(file,'.ts'),file);
    const specs:string[]=[];
    const visit=(node:ts.Node):void=>{
      if((ts.isImportDeclaration(node)||ts.isExportDeclaration(node))&&node.moduleSpecifier&&ts.isStringLiteral(node.moduleSpecifier))specs.push(node.moduleSpecifier.text);
      if(ts.isCallExpression(node)&&node.arguments[0]&&ts.isStringLiteral(node.arguments[0])&&(node.expression.kind===ts.SyntaxKind.ImportKeyword||node.expression.getText(source)==='require'))specs.push(node.arguments[0].text);
      ts.forEachChild(node,visit);
    };visit(source);
    for(const spec of specs){
      if(normalized.startsWith('packages/core/')){
        assert.ok(!spec.startsWith('@svgframe/')&&!spec.startsWith('node:')&&spec!=='saxes',file+' -> '+spec);
        if(spec.startsWith('.'))assert.ok(resolve(file,'..',spec).startsWith(resolve('packages/core')+'/'.replace('/',process.platform==='win32'?'\\':'/')),file+' -> '+spec);
        if(normalized.includes('/domain/')&&spec.startsWith('.'))assert.ok(resolve(file,'..',spec).startsWith(resolve('packages/core/src/domain')),file+' -> '+spec);
      }
      if(normalized.startsWith('plugins/')){
        if(spec.startsWith('@svgframe/'))assert.equal(spec,'@svgframe/core',file+' -> '+spec);
        if(spec.startsWith('.'))assert.ok(resolve(file,'..',spec).startsWith(resolve(normalized.split('/').slice(0,2).join('/'))),file+' -> '+spec);
      }
      if(normalized.includes('/loading/'))assert.ok(!spec.startsWith('@svgframe/plugin-')&&!spec.includes('/plugins/'),file+' -> '+spec);
    }
  }
});
