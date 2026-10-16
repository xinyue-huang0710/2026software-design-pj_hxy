import { EditorError } from '../domain/errors/EditorError.js';
export interface Token {readonly value:string;readonly quoted:boolean;}
export class Tokenizer {
  tokenize(line:string):readonly Token[] {
    if(line.trimStart().startsWith('#')) return [];
    const tokens:Token[]=[];let i=0;
    while(i<line.length){
      while(i<line.length&&/\s/.test(line[i]!)) i++;
      if(i===line.length) break;
      let value='';const quoted=line[i]==='"';
      if(quoted){
        i++;let closed=false;
        while(i<line.length){
          const ch=line[i++]!;
          if(ch==='"'){closed=true;break;}
          if(ch==='\\'&&(line[i]==='"'||line[i]==='\\')) value+=line[i++]!;
          else value+=ch;
        }
        if(!closed) throw new EditorError('unterminated quoted argument');
        if(i<line.length&&!/\s/.test(line[i]!)) throw new EditorError('expected space after quoted argument');
      } else {
        while(i<line.length&&!/\s/.test(line[i]!)){
          const ch=line[i++]!;
          if(ch==='"') throw new EditorError('quotes must surround a complete argument');
          value+=ch;
        }
      }
      tokens.push({value,quoted});
    }
    return tokens;
  }
}
