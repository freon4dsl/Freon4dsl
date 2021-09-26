import { GrammarRule } from "./GrammarRules";
import { refRuleName, refSeparator } from "./RHSEntries";

export class GrammarModel {
    unitName: string = '';
    langName: string = ''
    rules: GrammarRule[] = [];
    toGrammar() : string {
        // there is no prettier for the grammar string, therefore we take indentation and
        // other layout matters into account in this template
        // unfortunately, this makes things a little less legible :-(
        return `// This file contains the input to the AGL parser generator 
// (see https://https://github.com/dhakehurst/net.akehurst.language). 
// The grammar in this file is read by ....
        
export const ${(this.unitName)}GrammarStr = \`
namespace ${(this.langName)}
grammar ${(this.unitName)} {
                
${this.rules.map(rule => `${rule.toGrammar()}`).join('\n')}   

__pi_reference = [ identifier / '${refSeparator}' ]+ ;
        
// white space and comments
skip WHITE_SPACE = "\\\\s+" ;
skip SINGLE_LINE_COMMENT = "//[^\\\\r\\\\n]*" ;
skip MULTI_LINE_COMMENT = "/\\\\*[^*]*\\\\*+(?:[^*/][^*]*\\\\*+)*/" ;
        
// the predefined basic types   
leaf identifier          = "[a-zA-Z_][a-zA-Z0-9_]*" ;
/* see https://stackoverflow.com/questions/37032620/regex-for-matching-a-string-literal-in-java */
leaf stringLiteral       = '"' "[^\\\\"\\\\\\\\]*(\\\\\\\\.[^\\\\"\\\\\\\\]*)*" '"' ;
leaf numberLiteral       = "[0-9]+";
leaf booleanLiteral      = 'false' | 'true';
            
}\`; // end of grammar`;
    }
    names() : string[] {
        const result: string[] = this.rules.map(r => `${r.ruleName}`);
        result.push(refRuleName);
        return result;
    }

    toMethod() : string {
        return `${this.rules.map(rule => `${rule.toMethod()}`).join('\n')}`;
    }
}
