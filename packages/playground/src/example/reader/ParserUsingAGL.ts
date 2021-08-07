// adapted from "net.akehurst.language/examples/js/node/src/main.js"
import agl_module from "net.akehurst.language-agl-processor";

export class ParserUsingAGL {
    // without the following magic line, it does not work
    Agl = agl_module.net.akehurst.language.agl.processor.Agl;
    grammarStr = `
namespace test
grammar SimpleExample {
    skip WHITE_SPACE = "\\s+" ;
    skip MULTI_LINE_COMMENT = "/\\*[^*]*\\*+(?:[^*/][^*]*\\*+)*/" ;
    skip SINGLE_LINE_COMMENT = "//.*?$" ;
    unit = definition* ;
    definition = classDefinition ;
    classDefinition =
        'class' NAME '{'
            propertyDefinition*
            methodDefinition*
        '}'
    ;
    propertyDefinition = NAME ':' NAME ;
    methodDefinition = NAME '(' parameterList ')' body ;
    parameterList = [ parameterDefinition / ',']* ;
    parameterDefinition = NAME ':' NAME ;
    body = '{' propertyDefinition '}' ;
    NAME = "[a-zA-Z_][a-zA-Z0-9_]*" ;
    BOOLEAN = "true | false" ;
    NUMBER = "[0-9]+([.][0-9]+)?" ;
    STRING = "'(?:\\\\?.)*?'" ;
}
`;
    proc = this.Agl.processorFromString(this.grammarStr);

    doIt() {
        let sentence = `
class class {
  property : String
  prop2 : Integer
  method(p1: Integer, p2: String) {
    x1: String
  }    
}
class Anneke {
}
`;
        let sppt = this.proc.parse(sentence);
        // JSON.stringify(sppt);
        console.info(sppt);

        let asm = this.proc.process(sentence).toArray();
        console.info(asm);
    }
}



