import { EditorError } from '../../domain/errors/EditorError.js';
export class XmlEscaper {
  text(value:string):string {
    for(const char of value){
      const n=char.codePointAt(0)!;
      if(!(n===9||n===10||n===13||(n>=32&&n<=0xd7ff)||(n>=0xe000&&n<=0xfffd)||(n>=0x10000&&n<=0x10ffff)))
        throw new EditorError('invalid XML character');
    }
    return value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\r/g,'&#13;');
  }
  attribute(value:string):string {
    return this.text(value).replace(/"/g,'&quot;').replace(/\n/g,'&#10;').replace(/\t/g,'&#9;');
  }
  name(value:string):string {
    if(!/^[A-Za-z_][A-Za-z0-9_.-]*$/.test(value)) throw new EditorError('invalid XML name');
    return value;
  }
}
