export class GrammarTemplate {

// there is no prettier for the grammar string, therefore we take indentation and other layout matters into account in this template
// unfortunately, this makes things a little less legible :-(

    generateGrammar(languageName: string, unitName: string, generatedParseRules: string[]) {
        return `
// This file contains the input to the AGL parser generator (see https://https://github.com/dhakehurst/net.akehurst.language). 
// The grammar in this file is read by ....
        
export const ${unitName}GrammarStr = \`
namespace ${languageName}
grammar ${unitName} {
                
${generatedParseRules.map(ruleText => `${ruleText}`).join(" ;\n\n")} ;
        
// white space and comments
skip WHITE_SPACE = "\\s+" ;

        
// the predefined basic types   
leaf identifier          = "[a-zA-Z_][a-zA-Z0-9_]*" ;
/* see https://stackoverflow.com/questions/37032620/regex-for-matching-a-string-literal-in-java */
leaf stringLiteral       = "\\"[^\\"]*\\"";
leaf numberLiteral       = "[0-9]+";
leaf booleanLiteral      = 'false' | 'true';
            
}\`; // end of grammar
`;
        // end Template
    }
}

// NOT INCLUDED YET:
// skip MULTI_LINE_COMMENT = "/\\*[^*]*\\*+(?:[^*/][^*]*\\*+)*/" ;
// skip SINGLE_LINE_COMMENT = "//[^\r\n]*" ;
// leaf stringLiteral       = '"' "[^\"\\]*(\\.[^\"\\]*)*" '"';
