import {execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
import ts from 'typescript';
const root=resolve(import.meta.dirname,'../..');
const [base='final',target='HEAD',output='docs/metrics']=process.argv.slice(2);
const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8',maxBuffer:32*1024*1024});
function category(file){
 if(file.startsWith('extensions/svg-tools/src/'))return 'vscode';
 if(file.startsWith('packages/core/src/'))return 'kernel';
 if(file.startsWith('packages/host/src/'))return 'host';
 if(file.startsWith('plugins/')&&file.includes('/src/'))return 'plugin';
 if(file.startsWith('src/domain/shapes/')||file.startsWith('src/infrastructure/providers/'))return 'plugin';
 if(file.startsWith('src/application/commands/')&&!/\/(Command|EditCommand)\.ts$/.test(file))return 'plugin';
 if(file.startsWith('src/domain/')||file.startsWith('src/application/'))return 'kernel';
 if(file.startsWith('src/'))return 'host';
}
function complexity(source){
 let functions=0,cc=0;
 const functionNode=n=>ts.isFunctionLike(n)&&n.body!==undefined;
 const decision=n=>ts.isIfStatement(n)||ts.isConditionalExpression(n)||ts.isForStatement(n)||ts.isForOfStatement(n)||ts.isForInStatement(n)||ts.isWhileStatement(n)||ts.isDoStatement(n)||ts.isCatchClause(n)||ts.isCaseClause(n)||
 (ts.isBinaryExpression(n)&&[ts.SyntaxKind.AmpersandAmpersandToken,ts.SyntaxKind.BarBarToken,ts.SyntaxKind.QuestionQuestionToken].includes(n.operatorToken.kind));
 const visit=n=>{
  if(functionNode(n)){functions++;let value=1;const count=x=>{if(x!==n&&functionNode(x))return;if(decision(x))value++;ts.forEachChild(x,count);};count(n);cc+=value;}
  ts.forEachChild(n,visit);
 };visit(source);return {functions,cc};
}
function responsibility(file,source){
 const names=source.statements.filter(n=>ts.isClassDeclaration(n)||ts.isInterfaceDeclaration(n)).map(n=>n.name?.text).filter(Boolean).join(', ');
 const role=file.includes('/contracts/')?'公开扩展契约':file.includes('/domain/')||file.includes('/shapes/')?'领域模型与不变量':file.includes('/loading/')?'模块解析、注册安装与失败处理':file.includes('/commands/')||file.includes('command-')?'命令语法与请求转发':file.includes('/providers/')||file.includes('shape-')?'图形创建和输入输出映射':file.includes('tree-')?'树标签扩展':file.includes('/cli/')?'终端交互和展示':file.includes('/io/')||file.includes('/infrastructure/')?'文件与 SVG 编解码':file.includes('/application/')?'应用事务、历史和查询':'装配入口或公共导出';
 return role+(names?'：'+names:'');
}
function collect(rev){
 const commit=git('rev-parse',rev+'^{}').trim();
 const files=git('ls-tree','-r','--name-only',commit).trim().split('\n').filter(f=>f.endsWith('.ts')&&!f.endsWith('.d.ts')&&category(f));
 const hash=createHash('sha256');
 const rows=files.map(file=>{
  const text=git('show',commit+':'+file);hash.update(file+'\0'+text+'\0');
  const ast=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true);
  return {file,category:category(file),loc:text.split(/\r?\n/).filter(l=>l.trim()).length,...complexity(ast),responsibility:responsibility(file,ast)};
 });
 const totals=Object.fromEntries(['kernel','host','plugin','vscode'].map(cat=>[cat,rows.filter(r=>r.category===cat).reduce((a,r)=>({files:a.files+1,loc:a.loc+r.loc,functions:a.functions+r.functions,cc:a.cc+r.cc}),{files:0,loc:0,functions:0,cc:0})]));
 return {commit,runtimeSourceHash:hash.digest('hex'),totals,files:rows};
}
const before=collect(base),after=collect(target),dir=resolve(root,output);mkdirSync(dir,{recursive:true});
const report={method:'Nonempty physical TypeScript lines including comments. CC summed per function: 1 + if/conditional/loops/catch/case/&&/||/??; nested functions counted separately. Production CLI only in kernel/host/plugin; VS Code listed separately. Phase 1 future-plugin implementations classified consistently by responsibility, not claimed to be preexisting plugins. Generated from git objects, not working tree.',base:{ref:base,...before},target:{ref:target,...after}};
writeFileSync(join(dir,'metrics.json'),JSON.stringify(report,null,2)+'\n');
const lines=['# Git 历史指标（自动生成）','','生成命令：node tools/metrics/generate.mjs '+base+' '+target+' '+output,'','基线代码提交：'+before.commit,'','目标代码提交：'+after.commit,'','目标生产源码 SHA-256：'+after.runtimeSourceHash,'','报告提交本身不计入生产源码；最终以 final / p2 重跑，数值及源码哈希应一致。','',report.method,'','| 分类 | 原文件数 | 新文件数 | 原行数 | 新行数 | 行数增量 | 原 CC | 新 CC | CC 增量 |','|---|---:|---:|---:|---:|---:|---:|---:|---:|'];
for(const cat of ['kernel','host','plugin','vscode']){const b=before.totals[cat],a=after.totals[cat];lines.push('| '+[cat,b.files,a.files,b.loc,a.loc,a.loc-b.loc,b.cc,a.cc,a.cc-b.cc].join(' | ')+' |');}
lines.push('','## 目标文件清单与职责','','| 文件 | 分类 | 非空行 | CC | 职责 |','|---|---|---:|---:|---|');
for(const r of after.files)lines.push('| '+[r.file,r.category,r.loc,r.cc,r.responsibility].join(' | ')+' |');
writeFileSync(join(dir,'README.md'),lines.join('\n')+'\n');
console.log(JSON.stringify({base:before.commit,target:after.commit,totals:after.totals,runtimeSourceHash:after.runtimeSourceHash},null,2));
