import {readdirSync,mkdirSync,readFileSync,writeFileSync,existsSync} from 'node:fs';
import {join,resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
function copy(from,to){mkdirSync(to,{recursive:true});for(const e of readdirSync(from,{withFileTypes:true})){if(e.isDirectory())copy(join(from,e.name),join(to,e.name));else writeFileSync(join(to,e.name),readFileSync(join(from,e.name)));}}
for(const base of ['packages','plugins'])for(const name of readdirSync(join(root,base))){
 const compiled=join(root,'dist',base,name,'src');if(existsSync(compiled))copy(compiled,join(root,base,name,'dist'));
}
