import { readFile,writeFile,rename,unlink } from 'node:fs/promises';
import { dirname,basename,join } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { DocumentStore } from '../../application/ports/DocumentStore.js';
import { EditorError } from '../../domain/errors/EditorError.js';
export class FileDocumentStore implements DocumentStore {
  async read(path:string):Promise<string> {
    try{return await readFile(path,'utf8');}
    catch{throw new EditorError(`cannot read file: ${path}`);}
  }
  async write(path:string,content:string):Promise<void> {
    const temporary=join(dirname(path),`.${basename(path)}.${randomUUID()}.tmp`);
    try {
      await writeFile(temporary,content,{encoding:'utf8',flag:'wx'});
      await rename(temporary,path);
    } catch {
      await unlink(temporary).catch(()=>{});
      throw new EditorError(`cannot write file: ${path}`);
    }
  }
}
